using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Infrastructure.Persistence;
using IeltsSelfStudy.Infrastructure.Repositories;
using IeltsSelfStudy.Infrastructure.Services;
using IeltsSelfStudy.Infrastructure.Payment;
using IeltsSelfStudy.Infrastructure.Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using CloudinaryDotNet;

namespace IeltsSelfStudy.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        services.AddDbContext<IeltsDbContext>(options =>
            options.UseSqlServer(connectionString, sqlOptions =>
            {
                sqlOptions.CommandTimeout(120); // Tăng timeout lên 120 giây (2 phút)
            }));

        services.AddMemoryCache();
        services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
        services.AddScoped<IUserRepository, UserRepository>();          // vi co them ham rieng o user repository
        services.AddScoped<IFileService, FileService>();
        services.AddScoped<ISettingService, SettingService>();
        services.AddTransient<IVnPayTool, VnPayLibrary>();

        // Configure Cloudinary
        var cloudinarySettings = configuration.GetSection("Cloudinary").Get<CloudinarySettings>();
        if (cloudinarySettings != null && !string.IsNullOrEmpty(cloudinarySettings.CloudName))
        {
            var account = new Account(
                cloudinarySettings.CloudName,
                cloudinarySettings.ApiKey,
                cloudinarySettings.ApiSecret
            );
            var cloudinary = new Cloudinary(account);
            services.AddSingleton(cloudinary);
        }
        else
        {
            throw new Exception("Cloudinary configuration is missing or invalid in appsettings.json");
        }

        return services;
    }
}
