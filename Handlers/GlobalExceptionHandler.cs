
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace MyWebApi.Handlers;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        // recording of the error in Linux terminal
        _logger.LogError(exception, "An unexpected error has occured: {Message}", exception.Message);

        // creation of structured JSON response based on RFC 7807 protocol
        var problemDetails = new ProblemDetails
        {
            Status = StatusCodes.Status500InternalServerError,
            Title = "Server Error",
            Detail = "An internal server error has occured. Please try again later.",
            Type = "https://tools.ietf.org/html/rfc9110#section-15.6.1"
        };

        // returning pure JSON response
        httpContext.Response.StatusCode = problemDetails.Status.Value;
        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);

        // returning true to acknowledge error's succesful handling
        return true;
    }
}