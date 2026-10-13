using System.Text.Json;
using System.Text.Json.Nodes;
namespace MyWebApi.Middleware;

public static class RefreshTokenMiddleware
{
    public static IApplicationBuilder UseRefreshTokenMiddleware(this IApplicationBuilder app)
    {
        return app.Use(async (context, next) =>
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

                var body = JsonSerializer.SerializeToUtf8Bytes(new { refreshToken });

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
    }
}