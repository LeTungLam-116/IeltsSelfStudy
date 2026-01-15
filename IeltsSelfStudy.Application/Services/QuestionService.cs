using IeltsSelfStudy.Application.DTOs.Questions;
using IeltsSelfStudy.Application.DTOs.Common;
using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace IeltsSelfStudy.Application.Services;

public class QuestionService : IQuestionService
{
    private readonly IGenericRepository<Question> _questionRepo;
    private readonly IGenericRepository<Exercise> _exerciseRepo;
    private readonly ILogger<QuestionService> _logger;

    public QuestionService(
        IGenericRepository<Question> questionRepo,
        IGenericRepository<Exercise> exerciseRepo,
        ILogger<QuestionService> logger)
    {
        _questionRepo = questionRepo;
        _exerciseRepo = exerciseRepo;
        _logger = logger;
    }

    public async Task<List<QuestionDto>> GetAllAsync()
    {
        _logger.LogInformation("Getting all active questions");
        var list = await _questionRepo.GetAllAsync();
        _logger.LogInformation("Retrieved {Count} questions", list.Count);
        var activeQuestions = list.Where(x => x.IsActive).ToList();
        var result = new List<QuestionDto>();
        foreach (var q in activeQuestions)
        {
            result.Add(await MapToDtoAsync(q));
        }
        return result;
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

        var dtos = new List<QuestionDto>();
        foreach (var item in items)
        {
            dtos.Add(await MapToDtoAsync(item));
        }

        _logger.LogInformation("Retrieved {Count} questions (Page {PageNumber}/{TotalPages})",
            dtos.Count, request.PageNumber, (int)Math.Ceiling(totalCount / (double)request.PageSize));

        return new PagedResponse<QuestionDto>(dtos, totalCount, request);
    }

    public async Task<List<QuestionDto>> GetByExerciseAsync(int exerciseId)
    {
        _logger.LogInformation("Getting questions for exercise ID: {ExerciseId}", exerciseId);
        var allQuestions = await _questionRepo.GetAllAsync();
        var questions = allQuestions.Where(q => q.ExerciseId == exerciseId && q.IsActive).ToList();
        _logger.LogInformation("Retrieved {Count} questions for exercise ID: {ExerciseId}", questions.Count, exerciseId);
        var orderedQuestions = questions
            .OrderBy(q => q.QuestionNumber)
            .ToList();

        var result = new List<QuestionDto>();
        foreach (var q in orderedQuestions)
        {
            result.Add(await MapToDtoAsync(q));
        }
        return result;
    }

    public async Task<QuestionDto?> GetByIdAsync(int id)
    {
        _logger.LogInformation("Getting question by ID: {Id}", id);
        var entity = await _questionRepo.GetByIdAsync(id);
        _logger.LogInformation("Question found: {Found}", entity != null);
        return entity is null ? null : await MapToDtoAsync(entity);
    }

    public async Task<QuestionDto> CreateAsync(CreateQuestionRequest request)
    {
        _logger.LogInformation("Creating new question for exercise ID: {ExerciseId}", request.ExerciseId);
        var entity = new Question
        {
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
        return await MapToDtoAsync(entity);
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
        return await MapToDtoAsync(entity);
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

    private async Task<QuestionDto> MapToDtoAsync(Question q)
    {
        var exercise = await _exerciseRepo.GetByIdAsync(q.ExerciseId);
        return new QuestionDto
        {
            Id = q.Id,
            Skill = exercise?.Type ?? "Unknown",
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
}