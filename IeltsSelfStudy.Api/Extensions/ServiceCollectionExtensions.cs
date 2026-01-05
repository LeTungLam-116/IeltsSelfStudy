using IeltsSelfStudy.Api.Middleware;

namespace IeltsSelfStudy.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IApplicationBuilder UseGlobalExceptionHandler(this IApplicationBuilder app)
    {
        return app.UseMiddleware<GlobalExceptionHandlerMiddleware>();
    }
}