using FluentValidation;
using Microsoft.EntityFrameworkCore;
using MyWebApi.Data;
using MyWebApi.Endpoints;
using MyWebApi.Handlers;
using MyWebApi.Middleware;
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

RefreshTokenMiddleware.UseRefreshTokenMiddleware(app);

// default identity endpoints (/register, /login, etc)
app.MapGroup("/auth").MapIdentityApi<User>();

app.UseHttpsRedirection();

app.MapProductEndpoints();
app.MapCategoryEndpoints();
app.MapAuthenticationEndpoints();

app.Run();