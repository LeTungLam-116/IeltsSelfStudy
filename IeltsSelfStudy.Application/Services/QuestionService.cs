using IeltsSelfStudy.Application.DTOs.Questions;
using IeltsSelfStudy.Application.DTOs.Common;
using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Domain.Entities;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;

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

        // Batch fetch exercises to avoid N+1
        var exerciseIds = activeQuestions.Select(q => q.ExerciseId).Distinct().ToList();
        var exercises = await _exerciseRepo.GetAll()
            .Where(e => exerciseIds.Contains(e.Id))
            .ToListAsync();
        var exerciseById = exercises.ToDictionary(e => e.Id);

        var result = activeQuestions.Select(q => new QuestionDto
        {
            Id = q.Id,
            Skill = exerciseById.TryGetValue(q.ExerciseId, out var ex) ? ex.Type : "Unknown",
            ExerciseId = q.ExerciseId,
            ExerciseTitle = exerciseById.TryGetValue(q.ExerciseId, out var ex2) ? ex2.Title : string.Empty,
            QuestionNumber = q.QuestionNumber,
            QuestionText = q.QuestionText,
            QuestionType = q.QuestionType,
            CorrectAnswer = q.CorrectAnswer,
            Points = q.Points,
            OptionsJson = q.OptionsJson,
            IsActive = q.IsActive,
            CreatedAt = q.CreatedAt
        }).ToList();

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

        // Batch fetch exercises to avoid N+1
        var exerciseIds = items.Select(i => i.ExerciseId).Distinct().ToList();
        var exercises = await _exerciseRepo.GetAll()
            .Where(e => exerciseIds.Contains(e.Id))
            .ToListAsync();
        var exerciseById = exercises.ToDictionary(e => e.Id);

        var dtos = items.Select(item => new QuestionDto
        {
            Id = item.Id,
            Skill = exerciseById.TryGetValue(item.ExerciseId, out var ex) ? ex.Type : "Unknown",
            ExerciseId = item.ExerciseId,
            ExerciseTitle = exerciseById.TryGetValue(item.ExerciseId, out var ex2) ? ex2.Title : string.Empty,
            QuestionNumber = item.QuestionNumber,
            QuestionText = item.QuestionText,
            QuestionType = item.QuestionType,
            CorrectAnswer = item.CorrectAnswer,
            Points = item.Points,
            OptionsJson = item.OptionsJson,
            IsActive = item.IsActive,
            CreatedAt = item.CreatedAt
        }).ToList();

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

        // Get exercise once to fill title/type
        var exercise = await _exerciseRepo.GetByIdAsync(exerciseId);
        var result = orderedQuestions.Select(q => new QuestionDto
        {
            Id = q.Id,
            Skill = exercise?.Type ?? "Unknown",
            ExerciseId = q.ExerciseId,
            ExerciseTitle = exercise?.Title ?? string.Empty,
            QuestionNumber = q.QuestionNumber,
            QuestionText = q.QuestionText,
            QuestionType = q.QuestionType,
            CorrectAnswer = q.CorrectAnswer,
            Points = q.Points,
            OptionsJson = q.OptionsJson,
            IsActive = q.IsActive,
            CreatedAt = q.CreatedAt
        }).ToList();

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
        // Validate exercise type: only Listening/Reading can have Questions
        var exercise = await _exerciseRepo.GetByIdAsync(request.ExerciseId);
        if (exercise == null)
        {
            _logger.LogWarning("Exercise not found: {ExerciseId}", request.ExerciseId);
            throw new ArgumentException("Exercise not found.");
        }

        if (exercise.Type != "Listening" && exercise.Type != "Reading")
        {
            _logger.LogWarning("Attempted to add question to unsupported exercise type: {Type} (ExerciseId: {ExerciseId})", exercise.Type, request.ExerciseId);
            throw new InvalidOperationException("Questions can only be added to Listening or Reading exercises.");
        }

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
        // Transactional: insert question and update exercise questionCount atomically
        try
        {
            await _questionRepo.ExecuteInTransactionAsync(async () =>
            {
                await _questionRepo.AddAsync(entity);
                await _questionRepo.SaveChangesAsync();

                // refresh exercise entity to update counter
                var exc = await _exerciseRepo.GetByIdAsync(request.ExerciseId);
                if (exc != null)
                {
                    exc.QuestionCount = (exc.QuestionCount <= 0) ? 1 : exc.QuestionCount + 1;
                    _exerciseRepo.Update(exc);
                }
                await _exerciseRepo.SaveChangesAsync();
            });
        }
        catch (DbUpdateException dbEx)
        {
            _logger.LogError(dbEx, "DB update failed while creating question for exercise {ExerciseId}", request.ExerciseId);
            // Convert to friendlier message (duplicate question number) if appropriate
            throw new InvalidOperationException("Failed to create question. Possible duplicate question number for this exercise.");
        }

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
        // Validate target exercise type before updating association
        var targetExercise = await _exerciseRepo.GetByIdAsync(request.ExerciseId);
        if (targetExercise == null)
        {
            _logger.LogWarning("Target exercise not found: {ExerciseId}", request.ExerciseId);
            throw new ArgumentException("Target exercise not found.");
        }
        if (targetExercise.Type != "Listening" && targetExercise.Type != "Reading")
        {
            _logger.LogWarning("Attempted to associate question with unsupported exercise type: {Type} (ExerciseId: {ExerciseId})", targetExercise.Type, request.ExerciseId);
            throw new InvalidOperationException("Questions can only be associated with Listening or Reading exercises.");
        }
        var originalExerciseId = entity.ExerciseId;

        // If association changed, update counts transactionally
        if (originalExerciseId != request.ExerciseId)
        {
            try
            {
                await _questionRepo.ExecuteInTransactionAsync(async () =>
                {
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

                    var orig = await _exerciseRepo.GetByIdAsync(originalExerciseId);
                    if (orig != null && orig.QuestionCount > 0)
                    {
                        orig.QuestionCount = Math.Max(0, orig.QuestionCount - 1);
                        _exerciseRepo.Update(orig);
                        await _exerciseRepo.SaveChangesAsync();
                    }

                    var dest = await _exerciseRepo.GetByIdAsync(request.ExerciseId);
                    if (dest != null)
                    {
                        dest.QuestionCount = (dest.QuestionCount <= 0) ? 1 : dest.QuestionCount + 1;
                        _exerciseRepo.Update(dest);
                        await _exerciseRepo.SaveChangesAsync();
                    }
                });
            }
            catch (DbUpdateException dbEx)
            {
                _logger.LogError(dbEx, "DB update failed while moving question {Id} to exercise {ExerciseId}", id, request.ExerciseId);
                throw new InvalidOperationException("Failed to move question. Possible duplicate question number in target exercise.");
            }
        }
        else
        {
            // same exercise - normal update but catch uniqueness violations
            try
            {
                entity.QuestionNumber = request.QuestionNumber;
                entity.QuestionText = request.QuestionText;
                entity.QuestionType = request.QuestionType;
                entity.CorrectAnswer = request.CorrectAnswer;
                entity.Points = request.Points;
                entity.OptionsJson = request.OptionsJson;
                entity.IsActive = request.IsActive;

                _questionRepo.Update(entity);
                await _questionRepo.SaveChangesAsync();
            }
            catch (DbUpdateException dbEx)
            {
                _logger.LogError(dbEx, "DB update failed while updating question {Id}", id);
                throw new InvalidOperationException("Failed to update question. Possible duplicate question number for this exercise.");
            }
        }

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

        // Transactional: soft-delete question and decrement exercise.questionCount
        await _questionRepo.ExecuteInTransactionAsync(async () =>
        {
            entity.IsActive = false;
            _questionRepo.Update(entity);
            await _questionRepo.SaveChangesAsync();

            var exercise = await _exerciseRepo.GetByIdAsync(entity.ExerciseId);
            if (exercise != null && exercise.QuestionCount > 0)
            {
                exercise.QuestionCount = Math.Max(0, exercise.QuestionCount - 1);
                _exerciseRepo.Update(exercise);
                await _exerciseRepo.SaveChangesAsync();
            }
        });

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
            ExerciseTitle = exercise?.Title ?? string.Empty,
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