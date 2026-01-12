using IeltsSelfStudy.Application;
using IeltsSelfStudy.Application.Abstractions;
using IeltsSelfStudy.Infrastructure;
using IeltsSelfStudy.Infrastructure.AI;
using IeltsSelfStudy.Api.Extensions;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using IeltsSelfStudy.Api.Configuration;
using Microsoft.OpenApi.Models;
using System.Text;
using Serilog;

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
    builder.Services.AddHttpClient<IOpenAiGradingService, OpenAiGradingService>();

    // Bind JwtSettings
    builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
    var jwt = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>()
              ?? throw new InvalidOperationException("Missing JwtSettings configuration.");

    // JWT Bearer (Access token)
    builder.Services
        .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(opt =>
        {
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

    // Add Controllers
    builder.Services.AddControllers();

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
    });

    // CORS for SPA + Cookie refresh
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowFrontend",
            policy =>
            {
                policy.WithOrigins("http://localhost:5173")
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
    app.UseGlobalExceptionHandler();
    app.UseAuthentication();
    app.UseAuthorization();
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