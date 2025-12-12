using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace IeltsSelfStudy.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<ICourseService, CourseService>();

        return services;
    }
}
