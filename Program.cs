using System.Text.Json;
using System.Text.Json.Nodes;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using MyWebApi.Data;
using MyWebApi.Endpoints;
using MyWebApi.Handlers;
using MyWebApi.Models;

var builder = WebApplication.CreateBuilder(args);

// 1. Core Services & EF Core PostgreSQL
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Redis Cache
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis");
    options.InstanceName = "MyApiCache_";
});

// 3. Validation & Exception Handling
builder.Services.AddValidatorsFromAssemblyContaining<Program>();
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

// 4. CORS Policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

builder.Services.AddAuthorization();

builder.Services.AddIdentityApiEndpoints<User>().AddEntityFrameworkStores<AppDbContext>();

var app = builder.Build();

app.UseExceptionHandler();

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

app.Use(async (context, next) =>
{
    var path = context.Request.Path.Value;
    var isLogin = context.Request.Method == "POST" && path == "/auth/login";
    var isRefresh = context.Request.Method == "POST" && path == "/auth/refresh";

    if (!isLogin && !isRefresh)
    {
        await next();
        return;
    }

    const string cookieName = "refreshToken";

    if (isRefresh)
    {
        if (
            !context.Request.Cookies.TryGetValue(cookieName, out var refreshToken) || 
            string.IsNullOrWhiteSpace(refreshToken))
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return;
        }

        var body = JsonSerializer.SerializeToUtf8Bytes(new {refreshToken});

        context.Request.Body = new MemoryStream(body);
        context.Request.ContentType = "application/json";
        context.Request.ContentLength = body.Length;
    }

    var originalBody = context.Response.Body;
    
    await using var buffer = new MemoryStream();
    context.Response.Body = buffer;

    try
    {
        await next();

        buffer.Position = 0;

        if (context.Response.StatusCode != StatusCodes.Status200OK ||
            context.Response.ContentType?.Contains(
                "application/json",
                StringComparison.OrdinalIgnoreCase) != true)
        {
            context.Response.Body = originalBody;
            await buffer.CopyToAsync(originalBody);
            return;
        }

        var json = await JsonNode.ParseAsync(buffer);

        if (json is not JsonObject response ||
            response["refreshToken"]?.GetValue<string>() is not { } token)
        {
            buffer.Position = 0;
            context.Response.Body = originalBody;
            await buffer.CopyToAsync(originalBody);
            return;
        }

        context.Response.Cookies.Append(
            cookieName,
            token,
            new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Lax,
                Path = "/auth/refresh",
                MaxAge = TimeSpan.FromDays(14)
            });

        response.Remove("refreshToken");

        context.Response.Body = originalBody;
        context.Response.ContentLength = null;

        await JsonSerializer.SerializeAsync(
            originalBody,
            response,
            cancellationToken: context.RequestAborted);
    }
    finally
    {
        context.Response.Body = originalBody;
    }
});

// default identity endpoints (/register, /login, etc)
app.MapGroup("/auth").MapIdentityApi<User>();

app.MapPost("/auth/logout", (HttpContext context) =>
{
    context.Response.Cookies.Delete("refreshToken", new CookieOptions
    {
        HttpOnly = true,
        Secure = true,
        SameSite = SameSiteMode.Lax,
        Path = "/auth/refresh"
    });

    return Results.NoContent();
});

app.UseHttpsRedirection();

app.MapProductEndpoints();
app.MapCategoryEndpoints();

app.Run();