using System.Net;
using System.Text.Json;
using IeltsSelfStudy.Api.DTOs;

namespace IeltsSelfStudy.Api.Middleware;

public class GlobalExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;
    private readonly IWebHostEnvironment _environment;

    public GlobalExceptionHandlerMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionHandlerMiddleware> logger,
        IWebHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred. Path: {Path}", context.Request.Path);
            await HandleExceptionAsync(context, ex);
        }
    }

    private Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var code = HttpStatusCode.InternalServerError;
        var message = "An error occurred while processing your request.";
        var detail = (string?)null;

        switch (exception)
        {
            case InvalidOperationException invalidOpEx:
                code = HttpStatusCode.BadRequest;
                message = invalidOpEx.Message;
                if (_environment.IsDevelopment())
                {
                    detail = invalidOpEx.StackTrace;
                }
                break;

            case KeyNotFoundException keyNotFoundEx:
                code = HttpStatusCode.NotFound;
                message = keyNotFoundEx.Message;
                if (_environment.IsDevelopment())
                {
                    detail = keyNotFoundEx.StackTrace;
                }
                break;

            case ArgumentException argEx:
                code = HttpStatusCode.BadRequest;
                message = argEx.Message;
                if (_environment.IsDevelopment())
                {
                    detail = argEx.StackTrace;
                }
                break;

            case UnauthorizedAccessException:
                code = HttpStatusCode.Unauthorized;
                message = "You are not authorized to perform this action.";
                break;

            case NotImplementedException:
                code = HttpStatusCode.NotImplemented;
                message = "This feature is not yet implemented.";
                break;

            case TimeoutException:
                code = HttpStatusCode.RequestTimeout;
                message = "The request timed out. Please try again.";
                break;

            default:
                // Log unexpected exceptions
                _logger.LogError(exception, "Unexpected error: {Message}", exception.Message);
                if (_environment.IsDevelopment())
                {
                    detail = exception.StackTrace;
                    message = exception.Message;
                }
                break;
        }

        var response = new ErrorResponse
        {
            Message = message,
            Detail = detail,
            StatusCode = (int)code,
            Timestamp = DateTime.UtcNow,
            Path = context.Request.Path
        };

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = _environment.IsDevelopment()
        };

        var result = JsonSerializer.Serialize(response, jsonOptions);

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)code;

        return context.Response.WriteAsync(result);
    }
}