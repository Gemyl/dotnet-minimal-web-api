using Microsoft.AspNetCore.Identity;
using MyWebApi.DTOs;
using MyWebApi.Models;

namespace MyWebApi.Endpoints;

public static class AuthenticationEndpoints
{
    public static void MapAuthenticationEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/auth");

        group.MapPost("/logout", (Delegate)Logout);
        group.MapPost("/register-user", RegisterUser);
    }

    private static async Task<IResult> Logout(HttpContext context)
    {
        context.Response.Cookies.Delete("refreshToken", new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Lax,
            Path = "/auth/refresh"
        });

        return Results.NoContent();
    }

    private static async Task<IResult> RegisterUser(RegisterRequest request, UserManager<User> userManager)
    {
        var user = new User
        {
            UserName = request.Email,
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName
        };

        var result = await userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            return Results.BadRequest(result.Errors);
        }

        return Results.Ok();
    }
}