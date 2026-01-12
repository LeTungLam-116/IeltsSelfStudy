using IeltsSelfStudy.Application.DTOs.Questions;
using IeltsSelfStudy.Application.DTOs.Common;
using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace IeltsSelfStudy.Application.Services;

public class QuestionService : IQuestionService
{
    private readonly IGenericRepository<Question> _questionRepo;
    private readonly ILogger<QuestionService> _logger;

    public QuestionService(IGenericRepository<Question> questionRepo, ILogger<QuestionService> logger)
    {
        _questionRepo = questionRepo;
        _logger = logger;
    }

    public async Task<List<QuestionDto>> GetAllAsync()
    {
        _logger.LogInformation("Getting all active questions");
        var list = await _questionRepo.GetAllAsync();
        _logger.LogInformation("Retrieved {Count} questions", list.Count);
        return list.Where(x => x.IsActive).Select(MapToDto).ToList();
    }

    public async Task<PagedResponse<QuestionDto>> GetPagedAsync(PagedRequest request)
    {
        _logger.LogInformation("Getting paged questions. PageNumber: {PageNumber}, PageSize: {PageSize}",
            request.PageNumber, request.PageSize);

        var (items, totalCount) = await _questionRepo.GetPagedAsync(
            request,
            filter: q => q.Where(q => q.IsActive),
            orderBy: q => q.OrderByDescending(q => q.CreatedAt)
        );

        var dtos = items.Select(MapToDto).ToList();

        _logger.LogInformation("Retrieved {Count} questions (Page {PageNumber}/{TotalPages})",
            dtos.Count, request.PageNumber, (int)Math.Ceiling(totalCount / (double)request.PageSize));

        return new PagedResponse<QuestionDto>(dtos, totalCount, request);
    }

    public async Task<List<QuestionDto>> GetByExerciseAsync(string skill, int exerciseId)
    {
        _logger.LogInformation("Getting questions for skill: {Skill}, exercise ID: {ExerciseId}", skill, exerciseId);
        var all = await _questionRepo.GetAllAsync();
        _logger.LogInformation("Retrieved {Count} questions for skill: {Skill}, exercise ID: {ExerciseId}", all.Count, skill, exerciseId);
        return all
            .Where(q => q.Skill == skill && q.ExerciseId == exerciseId && q.IsActive)
            .OrderBy(q => q.QuestionNumber)
            .Select(MapToDto)
            .ToList();
    }

    public async Task<QuestionDto?> GetByIdAsync(int id)
    {
        _logger.LogInformation("Getting question by ID: {Id}", id);
        var entity = await _questionRepo.GetByIdAsync(id);
        _logger.LogInformation("Question found: {Found}", entity != null);
        return entity is null ? null : MapToDto(entity);
    }

    public async Task<QuestionDto> CreateAsync(CreateQuestionRequest request)
    {
        _logger.LogInformation("Creating new question for skill: {Skill}, exercise ID: {ExerciseId}", request.Skill, request.ExerciseId);
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

        _logger.LogInformation("Question created with ID: {Id}", entity.Id);
        return MapToDto(entity);
    }

    public async Task<QuestionDto?> UpdateAsync(int id, UpdateQuestionRequest request)
    {
        _logger.LogInformation("Updating question with ID: {Id}", id);
        var entity = await _questionRepo.GetByIdAsync(id);
        if (entity is null)
        {
            _logger.LogWarning("Question with ID: {Id} not found", id);
            return null;
        }

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

        _logger.LogInformation("Question with ID: {Id} updated successfully", id);
        return MapToDto(entity);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        _logger.LogInformation("Deleting question with ID: {Id}", id);
        var entity = await _questionRepo.GetByIdAsync(id);
        if (entity is null)
        {
            _logger.LogWarning("Question with ID: {Id} not found", id);
            return false;
        }

        entity.IsActive = false;
        _questionRepo.Update(entity);
        await _questionRepo.SaveChangesAsync();

        _logger.LogInformation("Question with ID: {Id} soft deleted successfully", id);
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