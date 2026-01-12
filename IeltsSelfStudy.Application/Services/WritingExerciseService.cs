using IeltsSelfStudy.Application.DTOs.WritingExercises;
using IeltsSelfStudy.Application.DTOs.Common;
using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Application.DTOs.Attempts;
using IeltsSelfStudy.Domain.Entities;
using IeltsSelfStudy.Application.Common;
using IeltsSelfStudy.Application.Abstractions;
using System.Text.Json;
using IeltsSelfStudy.Application.DTOs.AI;
using Microsoft.Extensions.Logging;

namespace IeltsSelfStudy.Application.Services;

public class WritingExerciseService : IWritingExerciseService
{
    private readonly IGenericRepository<WritingExercise> _writingRepo;
    private readonly IGenericRepository<Attempt> _attemptRepo;
    private readonly IOpenAiGradingService _aiGradingService;
    private readonly ILogger<WritingExerciseService> _logger;

    public WritingExerciseService(
        IGenericRepository<WritingExercise> writingRepo,
        IGenericRepository<Attempt> attemptRepo,
        IOpenAiGradingService aiGradingService,
        ILogger<WritingExerciseService> logger)
    {
        _writingRepo = writingRepo;
        _attemptRepo = attemptRepo;
        _aiGradingService = aiGradingService;
        _logger = logger;
    }

    public async Task<List<WritingExerciseDto>> GetAllAsync()
    {
        _logger.LogInformation("Getting all writing exercises");

        var list = await _writingRepo.GetAllAsync();
        var result = list.Where(x => x.IsActive).Select(MapToDto).ToList();

        _logger.LogInformation("Retrieved {Count} writing exercises", result.Count);
        return result;
    }

    public async Task<PagedResponse<WritingExerciseDto>> GetPagedAsync(PagedRequest request)
    {
        _logger.LogInformation("Getting paged writing exercises. PageNumber: {PageNumber}, PageSize: {PageSize}",
            request.PageNumber, request.PageSize);

        var (items, totalCount) = await _writingRepo.GetPagedAsync(
            request,
            filter: q => q.Where(w => w.IsActive),
            orderBy: q => q.OrderByDescending(w => w.CreatedAt)
        );

        var dtos = items.Select(MapToDto).ToList();

        _logger.LogInformation("Retrieved {Count} writing exercises (Page {PageNumber}/{TotalPages})",
            dtos.Count, request.PageNumber, (int)Math.Ceiling(totalCount / (double)request.PageSize));

        return new PagedResponse<WritingExerciseDto>(dtos, totalCount, request);
    }

    public async Task<WritingExerciseDto?> GetByIdAsync(int id)
    {
        _logger.LogDebug("Getting writing exercise by ID: {ExerciseId}", id);
        
        var item = await _writingRepo.GetByIdAsync(id);
        if (item is null)
        {
            _logger.LogWarning("Writing exercise not found: {ExerciseId}", id);
            return null;
        }
        
        return MapToDto(item);
    }

    public async Task<WritingExerciseDto> CreateAsync(CreateWritingExerciseRequest request)
    {
        _logger.LogInformation("Creating new writing exercise: {Title}", request.Title);
        
        var entity = new WritingExercise
        {
            Title = request.Title,
            Description = request.Description,
            TaskType = request.TaskType,
            Question = request.Question,
            Topic = request.Topic,
            Level = request.Level,
            MinWordCount = request.MinWordCount,
            SampleAnswer = request.SampleAnswer,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _writingRepo.AddAsync(entity);
        await _writingRepo.SaveChangesAsync();

        _logger.LogInformation("Writing exercise created successfully: {ExerciseId}, Title: {Title}", entity.Id, entity.Title);
        return MapToDto(entity);
    }

    public async Task<WritingExerciseDto?> UpdateAsync(int id, UpdateWritingExerciseRequest request)
    {
        _logger.LogInformation("Updating writing exercise: {ExerciseId}", id);
        
        var entity = await _writingRepo.GetByIdAsync(id);
        if (entity is null)
        {
            _logger.LogWarning("Writing exercise not found for update: {ExerciseId}", id);
            return null;
        }

        entity.Title = request.Title;
        entity.Description = request.Description;
        entity.TaskType = request.TaskType;
        entity.Question = request.Question;
        entity.Topic = request.Topic;
        entity.Level = request.Level;
        entity.MinWordCount = request.MinWordCount;
        entity.SampleAnswer = request.SampleAnswer;

        _writingRepo.Update(entity);
        await _writingRepo.SaveChangesAsync();

        _logger.LogInformation("Writing exercise updated successfully: {ExerciseId}", id);
        return MapToDto(entity);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        _logger.LogInformation("Deleting writing exercise: {ExerciseId}", id);
        
        var entity = await _writingRepo.GetByIdAsync(id);
        if (entity is null)
        {
            _logger.LogWarning("Writing exercise not found for deletion: {ExerciseId}", id);
            return false;
        }

        entity.IsActive = false;
        _writingRepo.Update(entity);
        await _writingRepo.SaveChangesAsync();

        _logger.LogInformation("Writing exercise deleted successfully: {ExerciseId}", id);
        return true;
    }

    public async Task<EvaluateWritingResponse> EvaluateAsync(int writingExerciseId, EvaluateWritingRequest request)
    {
        _logger.LogInformation("Evaluating writing exercise. ExerciseId: {ExerciseId}, UserId: {UserId}", 
            writingExerciseId, request.UserId);
        // 1. Lấy đề Writing (DbContext tự đóng sau khi xong)
        var exercise = await _writingRepo.GetByIdAsync(writingExerciseId);
        if (exercise is null)
        {
            _logger.LogError("Writing exercise not found for evaluation: {ExerciseId}", writingExerciseId);
            throw new InvalidOperationException("Writing exercise not found.");
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
            Skill = "Writing",
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
    private static string CreatePromptForAI(WritingExercise exercise, EvaluateWritingRequest request)
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

    private static WritingExerciseDto MapToDto(WritingExercise e) =>
        new()
        {
            Id = e.Id,
            Title = e.Title,
            Description = e.Description,
            TaskType = e.TaskType,
            Question = e.Question,
            Topic = e.Topic,
            Level = e.Level,
            MinWordCount = e.MinWordCount,
            SampleAnswer = e.SampleAnswer,
            IsActive = e.IsActive,
            CreatedAt = e.CreatedAt
        };
}
