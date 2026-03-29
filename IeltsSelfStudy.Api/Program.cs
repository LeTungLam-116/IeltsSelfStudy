using IeltsSelfStudy.Api;
using IeltsSelfStudy.Api.Configuration;
using IeltsSelfStudy.Api.Extensions;
using IeltsSelfStudy.Application;
using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Infrastructure;
using IeltsSelfStudy.Infrastructure.Services;
using IeltsSelfStudy.Infrastructure.AI;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using System.Text;
using Microsoft.EntityFrameworkCore;
using IeltsSelfStudy.Infrastructure.Persistence;
using IeltsSelfStudy.Domain.Entities;


// ===== CẤU HÌNH SERILOG TRƯỚC KHI BUILD =====
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(new ConfigurationBuilder()
        .SetBasePath(Directory.GetCurrentDirectory())
        .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
        .AddJsonFile($"appsettings.{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production"}.json", optional: true)
        .Build())
    .CreateLogger();

try
{
    Log.Information("Starting IeltsSelfStudy API");

    var builder = WebApplication.CreateBuilder(args);

    // ===== THAY THẾ LOGGING MẶC ĐỊNH BẰNG SERILOG =====
    builder.Host.UseSerilog();

    // Add services
    builder.Services.AddApplication();
    builder.Services.AddInfrastructure(builder.Configuration);
    builder.Services.AddHttpClient<IOpenAiGradingService, OpenAiGradingService>()
        .AddStandardResilienceHandler();
    builder.Services.AddScoped<IPlacementTestService, PlacementTestService>();

    // Bind JwtSettings
    builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
    var jwt = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>()
              ?? throw new InvalidOperationException("Missing JwtSettings configuration.");

    // JWT Bearer (Access token)
    builder.Services
        .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(opt =>
        {
            opt.MapInboundClaims = false;
            opt.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = jwt.Issuer,

                ValidateAudience = true,
                ValidAudience = jwt.Audience,

                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.SecretKey)),

                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromSeconds(30),

                NameClaimType = "sub",
                RoleClaimType = "role"
            };
        });

    builder.Services.AddAuthorization();

    // ===== OUTPUT CACHE (REDIS) =====
    // Tự động sử dụng Redis phân tán để lưu cache, chống mất dữ liệu khi server restart.
    builder.Services.AddStackExchangeRedisOutputCache(options =>
    {
        options.Configuration = builder.Configuration.GetConnectionString("Redis");
        options.InstanceName = "IeltsApp_"; // Tiền tố tránh trùng lập Key
    });

    builder.Services.AddOutputCache(options =>
    {
        // Policy mặc định: cache 5 phút cho tất cả GET requests
        options.AddBasePolicy(builder =>
            builder.Expire(TimeSpan.FromMinutes(5))
                   .Tag("global"));
    });

    // Add Controllers with JSON options
    builder.Services.AddControllers()
        .AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
            options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        });

    // Swagger Bearer
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo { Title = "IeltsSelfStudy API", Version = "v1" });
        c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Name = "Authorization",
            Description = "Bearer {accessToken}"
        });
        c.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
                },
                Array.Empty<string>()
            }
        });
        
        // Enable file upload support
        // c.OperationFilter<FileUploadOperationFilter>();
    });

    // CORS for SPA + Cookie refresh
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowFrontend",
            policy =>
            {
                policy.SetIsOriginAllowed(origin => true) // Allow any origin
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials();
            });
    });

    // Validate OpenAI API Key
    var openAiApiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");
    if (string.IsNullOrWhiteSpace(openAiApiKey))
    {
        Log.Warning("OpenAI API key is missing (Environment Variable: OPENAI_API_KEY)");
    }

    var app = builder.Build();

    // ===== AUTO-INIT SYSTEM SETTINGS (Helper when EF migrations tool is restricted) =====
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        var context = services.GetRequiredService<IeltsDbContext>();
        var logger = services.GetRequiredService<ILogger<Program>>();
        try
        {
            // Ensure table exists
            await context.Database.ExecuteSqlRawAsync(@"
                IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[SystemSettings]') AND type in (N'U'))
                BEGIN
                    CREATE TABLE [SystemSettings] (
                        [Id] int NOT NULL IDENTITY,
                        [Key] nvarchar(100) NOT NULL,
                        [Value] nvarchar(max) NOT NULL,
                        [Type] nvarchar(50) NOT NULL,
                        [Group] nvarchar(50) NOT NULL,
                        [Description] nvarchar(500) NULL,
                        [UpdatedAt] datetime2 NOT NULL,
                        CONSTRAINT [PK_SystemSettings] PRIMARY KEY ([Id])
                    );
                    CREATE UNIQUE INDEX [IX_SystemSettings_Key] ON [SystemSettings] ([Key]);
                END");

            // Seed default settings if empty
            if (!context.SystemSettings.Any())
            {
                var now = DateTime.UtcNow;
                var defaults = new List<SystemSetting>
                {
                    new SystemSetting { Key = "AI_Model", Value = "gpt-4o-mini", Type = "Text", Group = "AI", Description = "OpenAI Model Name", UpdatedAt = now },
                    new SystemSetting { Key = "AI_ApiKey", Value = "", Type = "Password", Group = "AI", Description = "OpenAI API Key", UpdatedAt = now },
                    new SystemSetting { Key = "AI_Prompt_Writing", Value = "You are an IELTS Writing examiner...", Type = "TextArea", Group = "AI", Description = "System prompt for writing grading", UpdatedAt = now },
                    new SystemSetting { Key = "AI_Prompt_Speaking", Value = "You are an IELTS Speaking examiner...", Type = "TextArea", Group = "AI", Description = "System prompt for speaking grading", UpdatedAt = now },
                    new SystemSetting { Key = "Payment_Vnp_TmnCode", Value = "", Type = "Text", Group = "Payment", Description = "VNPay Terminal Code", UpdatedAt = now },
                    new SystemSetting { Key = "Payment_Vnp_HashSecret", Value = "", Type = "Password", Group = "Payment", Description = "VNPay Hash Secret", UpdatedAt = now },
                    new SystemSetting { Key = "Payment_Vnp_BaseUrl", Value = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html", Type = "Text", Group = "Payment", Description = "VNPay Base URL", UpdatedAt = now },
                    new SystemSetting { Key = "Payment_Vnp_ReturnUrl", Value = "http://localhost:5173/payment-callback", Type = "Text", Group = "Payment", Description = "VNPay Return URL", UpdatedAt = now }
                };
                context.SystemSettings.AddRange(defaults);
                await context.SaveChangesAsync();
                logger.LogInformation("Seeded default system settings.");
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while initializing the database.");
        }
    }


    // ===== THÊM MIDDLEWARE SERILOG REQUEST LOGGING =====
    app.UseSerilogRequestLogging(options =>
    {
        options.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
        {
            diagnosticContext.Set("UserAgent", httpContext.Request.Headers["User-Agent"].ToString());
            diagnosticContext.Set("RemoteIP", httpContext.Connection.RemoteIpAddress);
        };
    });

    // Configure the HTTP request pipeline
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    app.UseHttpsRedirection();
    app.UseCors("AllowFrontend");
    app.UseOutputCache(); // Kích hoạt Output Cache Middleware
    app.UseGlobalExceptionHandler();
    app.UseAuthentication();
    app.UseAuthorization();
    // Serve static files from wwwroot (for uploaded audio)
    app.UseStaticFiles();
    app.MapControllers();

    Log.Information("IeltsSelfStudy API started successfully on {Environment}", app.Environment.EnvironmentName);

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application failed to start");
    throw;
}
finally
{
    Log.CloseAndFlush();
}