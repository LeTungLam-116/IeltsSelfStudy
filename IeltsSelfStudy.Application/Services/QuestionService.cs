using IeltsSelfStudy.Application.DTOs.Questions;
using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Domain.Entities;

namespace IeltsSelfStudy.Application.Services;

public class QuestionService : IQuestionService
{
    private readonly IGenericRepository<Question> _questionRepo;

    public QuestionService(IGenericRepository<Question> questionRepo)
    {
        _questionRepo = questionRepo;
    }

    public async Task<List<QuestionDto>> GetAllAsync()
    {
        var list = await _questionRepo.GetAllAsync();
        return list.Where(x => x.IsActive).Select(MapToDto).ToList();
    }

    public async Task<List<QuestionDto>> GetByExerciseAsync(string skill, int exerciseId)
    {
        var all = await _questionRepo.GetAllAsync();
        return all
            .Where(q => q.Skill == skill && q.ExerciseId == exerciseId && q.IsActive)
            .OrderBy(q => q.QuestionNumber)
            .Select(MapToDto)
            .ToList();
    }

    public async Task<QuestionDto?> GetByIdAsync(int id)
    {
        var entity = await _questionRepo.GetByIdAsync(id);
        return entity is null ? null : MapToDto(entity);
    }

    public async Task<QuestionDto> CreateAsync(CreateQuestionRequest request)
    {
        var entity = new Question
        {
            Skill = request.Skill,
            ExerciseId = request.ExerciseId,
            QuestionNumber = request.QuestionNumber,
            QuestionText = request.QuestionText,
            QuestionType = request.QuestionType,
            CorrectAnswer = request.CorrectAnswer,
            Points = request.Points,
            OptionsJson = request.OptionsJson,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _questionRepo.AddAsync(entity);
        await _questionRepo.SaveChangesAsync();

        return MapToDto(entity);
    }

    public async Task<QuestionDto?> UpdateAsync(int id, UpdateQuestionRequest request)
    {
        var entity = await _questionRepo.GetByIdAsync(id);
        if (entity is null) return null;

        entity.Skill = request.Skill;
        entity.ExerciseId = request.ExerciseId;
        entity.QuestionNumber = request.QuestionNumber;
        entity.QuestionText = request.QuestionText;
        entity.QuestionType = request.QuestionType;
        entity.CorrectAnswer = request.CorrectAnswer;
        entity.Points = request.Points;
        entity.OptionsJson = request.OptionsJson;
        entity.IsActive = request.IsActive;

        _questionRepo.Update(entity);
        await _questionRepo.SaveChangesAsync();

        return MapToDto(entity);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var entity = await _questionRepo.GetByIdAsync(id);
        if (entity is null) return false;

        entity.IsActive = false;
        _questionRepo.Update(entity);
        await _questionRepo.SaveChangesAsync();

        return true;
    }

    private static QuestionDto MapToDto(Question q) => new()
    {
        Id = q.Id,
        Skill = q.Skill,
        ExerciseId = q.ExerciseId,
        QuestionNumber = q.QuestionNumber,
        QuestionText = q.QuestionText,
        QuestionType = q.QuestionType,
        CorrectAnswer = q.CorrectAnswer,
        Points = q.Points,
        OptionsJson = q.OptionsJson,
        IsActive = q.IsActive,
        CreatedAt = q.CreatedAt
    };
}