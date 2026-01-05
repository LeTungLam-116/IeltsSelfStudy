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
        services.AddScoped<IListeningExerciseService, ListeningExerciseService>();
        services.AddScoped<IReadingExerciseService, ReadingExerciseService>();
        services.AddScoped<IAttemptService, AttemptService>();
        services.AddScoped<IWritingExerciseService, WritingExerciseService>();
        services.AddScoped<ISpeakingExerciseService, SpeakingExerciseService>();
        services.AddScoped<IQuestionService, QuestionService>();

        return services;
    }
}
