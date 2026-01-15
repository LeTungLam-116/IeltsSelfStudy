using IeltsSelfStudy.Application.DTOs.WritingExercises;
using IeltsSelfStudy.Application.DTOs.Common;
using IeltsSelfStudy.Application.DTOs.AI;
using IeltsSelfStudy.Application.Abstractions;
using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Domain.Entities;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace IeltsSelfStudy.Application.Services;

public class WritingExerciseService : IWritingExerciseService
{
    private readonly IGenericRepository<Exercise> _exerciseRepo; // TPH
    private readonly IGenericRepository<Attempt> _attemptRepo;
    private readonly IOpenAiGradingService _aiGradingService;
    private readonly ILogger<WritingExerciseService> _logger;

    public WritingExerciseService(
        IGenericRepository<Exercise> exerciseRepo, // TPH
        IGenericRepository<Attempt> attemptRepo,
        IOpenAiGradingService aiGradingService,
        ILogger<WritingExerciseService> logger)
    {
        _exerciseRepo = exerciseRepo; // TPH: Changed from _writingRepo
        _attemptRepo = attemptRepo;
        _aiGradingService = aiGradingService;
        _logger = logger;
    }

    public async Task<List<WritingExerciseDto>> GetAllAsync()
    {
        _logger.LogInformation("Getting all writing exercises");

        // TPH: Filter exercises by Type = "Writing"
        var allExercises = await _exerciseRepo.GetAllAsync();
        var list = allExercises.Where(e => e.Type == "Writing" && e.IsActive).ToList();
        var result = list.Select(MapToDto).ToList();

        _logger.LogInformation("Retrieved {Count} writing exercises", result.Count);
        return result;
    }

    public async Task<PagedResponse<WritingExerciseDto>> GetPagedAsync(PagedRequest request)
    {
        _logger.LogInformation("Getting paged writing exercises. PageNumber: {PageNumber}, PageSize: {PageSize}",
            request.PageNumber, request.PageSize);

        // TPH: Filter by Type = "Writing" and IsActive
        var (items, totalCount) = await _exerciseRepo.GetPagedAsync(
            request,
            filter: q => q.Where(e => e.Type == "Writing" && e.IsActive),
            orderBy: q => q.OrderByDescending(e => e.CreatedAt)
        );

        var dtos = items.Select(MapToDto).ToList();

        _logger.LogInformation("Retrieved {Count} writing exercises (Page {PageNumber}/{TotalPages})",
            dtos.Count, request.PageNumber, (int)Math.Ceiling(totalCount / (double)request.PageSize));

        return new PagedResponse<WritingExerciseDto>(dtos, totalCount, request);
    }

    public async Task<WritingExerciseDto?> GetByIdAsync(int id)
    {
        _logger.LogDebug("Getting writing exercise by ID: {ExerciseId}", id);
        // TPH: Get exercise and verify it's a writing exercise
        var item = await _exerciseRepo.GetByIdAsync(id);
        if (item is null || item.Type != "Writing")
        {
            _logger.LogWarning("Writing exercise not found: {ExerciseId}", id);
            return null;
        }
        return MapToDto(item);
    }

    public async Task<WritingExerciseDto> CreateAsync(CreateWritingExerciseRequest request)
    {
        _logger.LogInformation("Creating new writing exercise: {Title}", request.Title);

        var entity = new Exercise // TPH: Changed from WritingExercise to Exercise
        {
            Type = "Writing", // TPH: Set discriminator
            Title = request.Title,
            Description = request.Description,
            TaskType = request.TaskType, // TPH: Nullable field
            Question = request.Question,
            Topic = request.Topic,
            Level = request.Level,
            MinWordCount = request.MinWordCount,
            SampleAnswer = request.SampleAnswer,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _exerciseRepo.AddAsync(entity);
        await _exerciseRepo.SaveChangesAsync();
        _logger.LogInformation("Created writing exercise with ID: {ExerciseId}", entity.Id);

        return MapToDto(entity);
    }

    public async Task<WritingExerciseDto?> UpdateAsync(int id, UpdateWritingExerciseRequest request)
    {
        _logger.LogInformation("Updating writing exercise: {ExerciseId}", id);

        // TPH: Get exercise and verify it's a writing exercise
        var entity = await _exerciseRepo.GetByIdAsync(id);
        if (entity is null || entity.Type != "Writing")
        {
            _logger.LogWarning("Writing exercise not found for update: {ExerciseId}", id);
            return null;
        }

        // TPH: Update only writing-specific fields
        entity.Title = request.Title;
        entity.Description = request.Description;
        entity.TaskType = request.TaskType;
        entity.Question = request.Question;
        entity.Topic = request.Topic;
        entity.Level = request.Level;
        entity.MinWordCount = request.MinWordCount;
        entity.SampleAnswer = request.SampleAnswer;
        entity.IsActive = request.IsActive;

        _exerciseRepo.Update(entity); // TPH: Changed from _writingRepo
        await _exerciseRepo.SaveChangesAsync();

        _logger.LogInformation("Writing exercise updated successfully: {ExerciseId}", id);
        return MapToDto(entity);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        _logger.LogInformation("Deleting writing exercise: {ExerciseId}", id);

        // TPH: Get exercise and verify it's a writing exercise
        var entity = await _exerciseRepo.GetByIdAsync(id);
        if (entity is null || entity.Type != "Writing")
        {
            _logger.LogWarning("Writing exercise not found for deletion: {ExerciseId}", id);
            return false;
        }

        // Soft delete
        entity.IsActive = false;

        _exerciseRepo.Update(entity); // TPH: Changed from _writingRepo
        await _exerciseRepo.SaveChangesAsync();

        _logger.LogInformation("Writing exercise deleted successfully: {ExerciseId}", id);
        return true;
    }

    public async Task<EvaluateWritingResponse> EvaluateAsync(int writingExerciseId, EvaluateWritingRequest request)
    {
        _logger.LogInformation("Evaluating writing exercise. ExerciseId: {ExerciseId}, UserId: {UserId}",
            writingExerciseId, request.UserId);
        // 1. Lấy đề Writing (TPH: Get exercise and verify it's a writing exercise)
        var exercise = await _exerciseRepo.GetByIdAsync(writingExerciseId);
        if (exercise is null || exercise.Type != "Writing")
        {
            _logger.LogError("Writing exercise not found for evaluation: {ExerciseId}", writingExerciseId);
            throw new InvalidOperationException("Writing exercise not found or not a writing exercise.");
        }

        // 2. Copy dữ liệu cần thiết (không cần entity nữa)
        var exerciseData = new
        {
            Question = exercise.Question,
            TaskType = exercise.TaskType,
            Topic = exercise.Topic,
            Level = exercise.Level,
            MinWordCount = exercise.MinWordCount
        };

        // 3. Tạo prompt cho AI
        var prompt = CreatePromptForAI(exercise, request);

        // 4. Gọi AI để chấm điểm (DbContext đã đóng)
        WritingFeedbackDto aiFeedback;
        try
        {
            _logger.LogInformation("Calling AI grading service for writing exercise: {ExerciseId}", writingExerciseId);
            aiFeedback = await _aiGradingService.GradeWritingAsync(prompt);
            _logger.LogInformation("AI grading completed successfully for exercise: {ExerciseId}, OverallBand: {Band}", 
                writingExerciseId, aiFeedback.OverallBand);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to grade writing with AI. ExerciseId: {ExerciseId}", writingExerciseId);
            throw new InvalidOperationException($"Failed to grade writing with AI: {ex.Message}", ex);
        }

        // 5. Lưu attempt (DbContext mới, nhanh)
        return await SaveAttemptAsync(writingExerciseId, request, exerciseData, aiFeedback);
    }

    // Lưu attempt vào database (DbContext mới, không giữ quá lâu)
    private async Task<EvaluateWritingResponse> SaveAttemptAsync(
        int writingExerciseId,
        EvaluateWritingRequest request,
        dynamic exerciseData,
        WritingFeedbackDto aiFeedback)
    {
        // Chuyển đổi feedback từ AI thành JSON
        var feedbackJson = JsonSerializer.Serialize(aiFeedback, new JsonSerializerOptions 
        { 
            WriteIndented = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        // Tạo JSON để lưu user answer
        var payloadForAi = new
        {
            essayText = request.EssayText,
            question = exerciseData.Question,
            topic = exerciseData.Topic,
            level = exerciseData.Level,
            targetBand = request.TargetBand
        };
        var userAnswerJson = JsonSerializer.Serialize(payloadForAi);

        // Lưu Attempt với điểm và feedback từ AI
        var attempt = new Attempt
        {
            UserId = request.UserId,
            // TPH: Skill được suy ra từ Exercise.Type, không cần lưu riêng
            ExerciseId = writingExerciseId,
            Score = aiFeedback.OverallBand,
            MaxScore = 9.0,
            UserAnswerJson = userAnswerJson,
            AiFeedback = feedbackJson,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _attemptRepo.AddAsync(attempt);
        await _attemptRepo.SaveChangesAsync(); // DbContext mới, nhanh

        _logger.LogInformation("Writing evaluation completed. ExerciseId: {ExerciseId}, UserId: {UserId}, AttemptId: {AttemptId}, Score: {Score}", 
            writingExerciseId, request.UserId, attempt.Id, attempt.Score);

        return new EvaluateWritingResponse
        {
            AttemptId = attempt.Id,
            Score = aiFeedback.OverallBand,
            MaxScore = 9.0,
            Feedback = feedbackJson
        };
    }

    /// <summary>
    /// Tạo prompt chi tiết cho AI để chấm bài Writing
    /// </summary>
    private static string CreatePromptForAI(Exercise exercise, EvaluateWritingRequest request)
    {
        var prompt = $@"You are an experienced IELTS Writing examiner. Please evaluate the following essay according to IELTS Writing Task {exercise.TaskType} criteria.

        **Question:**
        {exercise.Question}

        **Topic:** {exercise.Topic ?? "General"}

        **Level:** {exercise.Level}

        **Target Band:** {(request.TargetBand.HasValue ? request.TargetBand.Value.ToString("F1") : "Not specified")}

        **Minimum Word Count:** {exercise.MinWordCount}

        **Student's Essay:**
        {request.EssayText}

        Please evaluate this essay based on the four IELTS Writing criteria:
        1. **Task Response (TR)**: How well the essay addresses the task requirements
        2. **Coherence and Cohesion (CC)**: How well the essay is organized and connected
        3. **Lexical Resource (LR)**: Vocabulary range and accuracy
        4. **Grammar Range and Accuracy (GRA)**: Grammar usage and accuracy

        Provide:
        - An overall band score (0-9)
        - Individual scores for each criterion (TR, CC, LR, GRA)
        - Strengths of the essay
        - Areas for improvement
        - Specific corrections with explanations
        - A better version example of key sections

        Be constructive and beginner-friendly in your feedback.";

        return prompt;
    }

    private static WritingExerciseDto MapToDto(Exercise e) => // TPH: Changed from WritingExercise to Exercise
        new()
        {
            Id = e.Id,
            Title = e.Title,
            Description = e.Description,
            TaskType = e.TaskType, // TPH: Nullable field
            Question = e.Question,
            Topic = e.Topic,
            Level = e.Level,
            MinWordCount = e.MinWordCount ?? 250, // TPH: Default value for nullable
            SampleAnswer = e.SampleAnswer,
            IsActive = e.IsActive,
            CreatedAt = e.CreatedAt
        };
}
