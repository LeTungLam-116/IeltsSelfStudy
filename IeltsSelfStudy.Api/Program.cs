using IeltsSelfStudy.Application;
using IeltsSelfStudy.Application.Abstractions;
using IeltsSelfStudy.Infrastructure;
using IeltsSelfStudy.Infrastructure.AI;
using IeltsSelfStudy.Api.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddHttpClient<IOpenAiGradingService, OpenAiGradingService>();
// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseGlobalExceptionHandler();

app.UseAuthorization();

app.MapControllers();

app.Run();
