using IeltsSelfStudy.Application.DTOs.SpeakingExercises;
using IeltsSelfStudy.Application.DTOs.Common;
using IeltsSelfStudy.Application.DTOs.AI;
using IeltsSelfStudy.Application.Abstractions;
using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Domain.Entities;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace IeltsSelfStudy.Application.Services;

public class SpeakingExerciseService : ISpeakingExerciseService
{
    private readonly IGenericRepository<Exercise> _exerciseRepo; // TPH
    private readonly IGenericRepository<Attempt> _attemptRepo;
    private readonly IOpenAiGradingService _aiGradingService;
    private readonly ILogger<SpeakingExerciseService> _logger;

    public SpeakingExerciseService(
        IGenericRepository<Exercise> exerciseRepo, // TPH
        IGenericRepository<Attempt> attemptRepo,
        IOpenAiGradingService aiGradingService,
        ILogger<SpeakingExerciseService> logger)
    {
        _exerciseRepo = exerciseRepo; // TPH: Changed from _speakingRepo
        _attemptRepo = attemptRepo;
        _aiGradingService = aiGradingService;
        _logger = logger;
    }

    public async Task<List<SpeakingExerciseDto>> GetAllAsync()
    {
        _logger.LogInformation("Getting all speaking exercises");

        // TPH: Filter exercises by Type = "Speaking"
        var allExercises = await _exerciseRepo.GetAllAsync();
        var list = allExercises.Where(e => e.Type == "Speaking" && e.IsActive).ToList();
        var result = list.Select(MapToDto).ToList();

        _logger.LogInformation("Retrieved {Count} speaking exercises", result.Count);
        return result;
    }

    public async Task<PagedResponse<SpeakingExerciseDto>> GetPagedAsync(PagedRequest request)
    {
        _logger.LogInformation("Getting paged speaking exercises. PageNumber: {PageNumber}, PageSize: {PageSize}",
            request.PageNumber, request.PageSize);

        // TPH: Filter by Type = "Speaking" and IsActive
        var (items, totalCount) = await _exerciseRepo.GetPagedAsync(
            request,
            filter: q => q.Where(e => e.Type == "Speaking" && e.IsActive),
            orderBy: q => q.OrderByDescending(e => e.CreatedAt)
        );

        var dtos = items.Select(MapToDto).ToList();

        _logger.LogInformation("Retrieved {Count} speaking exercises (Page {PageNumber}/{TotalPages})",
            dtos.Count, request.PageNumber, (int)Math.Ceiling(totalCount / (double)request.PageSize));

        return new PagedResponse<SpeakingExerciseDto>(dtos, totalCount, request);
    }

    public async Task<SpeakingExerciseDto?> GetByIdAsync(int id)
    {
        _logger.LogDebug("Getting speaking exercise by ID: {ExerciseId}", id);
        // TPH: Get exercise and verify it's a speaking exercise
        var item = await _exerciseRepo.GetByIdAsync(id);
        if (item is null || item.Type != "Speaking")
        {
            _logger.LogWarning("Speaking exercise not found: {ExerciseId}", id);
            return null;
        }
        return MapToDto(item);
    }

    public async Task<SpeakingExerciseDto> CreateAsync(CreateSpeakingExerciseRequest request)
    {
        _logger.LogInformation("Creating new speaking exercise: {Title}", request.Title);

        var entity = new Exercise // TPH: Changed from SpeakingExercise to Exercise
        {
            Type = "Speaking", // TPH: Set discriminator
            Title = request.Title,
            Description = request.Description,
            Part = request.Part, // TPH: Nullable field
            Question = request.Question,
            Topic = request.Topic,
            Level = request.Level,
            Tips = request.Tips,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _exerciseRepo.AddAsync(entity);
        await _exerciseRepo.SaveChangesAsync();
        _logger.LogInformation("Created speaking exercise with ID: {ExerciseId}", entity.Id);

        return MapToDto(entity);
    }

    public async Task<SpeakingExerciseDto?> UpdateAsync(int id, UpdateSpeakingExerciseRequest request)
    {
        _logger.LogInformation("Updating speaking exercise: {ExerciseId}", id);

        // TPH: Get exercise and verify it's a speaking exercise
        var entity = await _exerciseRepo.GetByIdAsync(id);
        if (entity is null || entity.Type != "Speaking")
        {
            _logger.LogWarning("Speaking exercise not found for update: {ExerciseId}", id);
            return null;
        }

        // TPH: Update only speaking-specific fields
        entity.Title = request.Title;
        entity.Description = request.Description;
        entity.Part = request.Part;
        entity.Question = request.Question;
        entity.Topic = request.Topic;
        entity.Level = request.Level;
        entity.Tips = request.Tips;
        entity.IsActive = request.IsActive;

        _exerciseRepo.Update(entity); // TPH: Changed from _speakingRepo
        await _exerciseRepo.SaveChangesAsync();

        _logger.LogInformation("Speaking exercise updated successfully: {ExerciseId}", id);
        return MapToDto(entity);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        _logger.LogInformation("Deleting speaking exercise: {ExerciseId}", id);

        // TPH: Get exercise and verify it's a speaking exercise
        var entity = await _exerciseRepo.GetByIdAsync(id);
        if (entity is null || entity.Type != "Speaking")
        {
            _logger.LogWarning("Speaking exercise not found for deletion: {ExerciseId}", id);
            return false;
        }

        // Soft delete
        entity.IsActive = false;

        _exerciseRepo.Update(entity); // TPH: Changed from _speakingRepo
        await _exerciseRepo.SaveChangesAsync();

        _logger.LogInformation("Speaking exercise deleted successfully: {ExerciseId}", id);
        return true;
    }

    public async Task<EvaluateSpeakingResponse> EvaluateAsync(int speakingExerciseId, EvaluateSpeakingRequest request)
    {
        _logger.LogInformation("Evaluating speaking exercise. ExerciseId: {ExerciseId}, UserId: {UserId}",
            speakingExerciseId, request.UserId);
        // 1. Lấy exercise (TPH: Get exercise and verify it's a speaking exercise)
        var exercise = await _exerciseRepo.GetByIdAsync(speakingExerciseId);
        if (exercise is null || exercise.Type != "Speaking")
        {
            _logger.LogError("Speaking exercise not found for evaluation: {ExerciseId}", speakingExerciseId);
            throw new InvalidOperationException("Speaking exercise not found or not a speaking exercise.");
        }

        // 2. Copy dữ liệu cần thiết (không cần entity nữa)
        var exerciseData = new
        {
            Question = exercise.Question,
            Part = exercise.Part,
            Topic = exercise.Topic,
            Level = exercise.Level
        };

        // 3. Gọi AI (DbContext đã đóng)
        var prompt = CreatePromptForAI(exercise, request);
        
        SpeakingFeedbackDto aiFeedback;
        try
        {
            _logger.LogInformation("Calling AI grading service for speaking exercise: {ExerciseId}", speakingExerciseId);
            aiFeedback = await _aiGradingService.GradeSpeakingAsync(prompt);
            _logger.LogInformation("AI grading completed successfully for exercise: {ExerciseId}, OverallBand: {Band}", 
                speakingExerciseId, aiFeedback.OverallBand);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to grade speaking with AI. ExerciseId: {ExerciseId}", speakingExerciseId);
            throw new InvalidOperationException($"Failed to grade speaking with AI: {ex.Message}", ex);
        }

        // 4. Lưu attempt (DbContext mới, nhanh)
        return await SaveAttemptAsync(speakingExerciseId, request, exerciseData, aiFeedback);
    }

    private async Task<EvaluateSpeakingResponse> SaveAttemptAsync(
        int speakingExerciseId, 
        EvaluateSpeakingRequest request,
        dynamic exerciseData,
        SpeakingFeedbackDto aiFeedback)
    {
        // 4. Chuyển đổi feedback từ AI thành JSON để lưu vào database
        var feedbackJson = JsonSerializer.Serialize(aiFeedback, new JsonSerializerOptions 
        { 
            WriteIndented = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        // Tạo JSON để lưu user answer
        var payload = new
        {
            answerText = request.AnswerText,
            wordCount = request.AnswerText.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length,
            question = exerciseData.Question,
            part = exerciseData.Part,
            topic = exerciseData.Topic,
            level = exerciseData.Level,
            targetBand = request.TargetBand
        };
        string userAnswerJson = JsonSerializer.Serialize(payload);

        var attempt = new Attempt
        {
            UserId = request.UserId,
            // TPH: Skill được suy ra từ Exercise.Type, không cần lưu riêng
            ExerciseId = speakingExerciseId,
            Score = aiFeedback.OverallBand,
            MaxScore = 9.0,
            UserAnswerJson = userAnswerJson,
            AiFeedback = feedbackJson,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _attemptRepo.AddAsync(attempt);
        await _attemptRepo.SaveChangesAsync();

        _logger.LogInformation("Speaking evaluation completed. ExerciseId: {ExerciseId}, UserId: {UserId}, AttemptId: {AttemptId}, Score: {Score}", 
            speakingExerciseId, request.UserId, attempt.Id, attempt.Score);
            
        return new EvaluateSpeakingResponse
        {
            AttemptId = attempt.Id,
            Score = aiFeedback.OverallBand,
            MaxScore = 9.0,
            Feedback = feedbackJson
        };
    }

    /// <summary>
    /// Tạo prompt chi tiết cho AI để chấm bài Speaking
    /// </summary>
    private static string CreatePromptForAI(Exercise exercise, EvaluateSpeakingRequest request)
    {
        var prompt = $@"You are an experienced IELTS Speaking examiner. Please evaluate the following speaking answer according to IELTS Speaking {exercise.Part} criteria.

        **Question:**
        {exercise.Question}

        **Part:** {exercise.Part}

        **Topic:** {exercise.Topic ?? "General"}

        **Level:** {exercise.Level}

        **Target Band:** {(request.TargetBand.HasValue ? request.TargetBand.Value.ToString("F1") : "Not specified")}

        **Student's Answer:**
        {request.AnswerText}

        Please evaluate this answer based on the four IELTS Speaking criteria:
        1. **Fluency & Coherence**: How smoothly and clearly the candidate speaks
        2. **Lexical Resource**: Vocabulary range and accuracy
        3. **Grammatical Range & Accuracy**: Grammar usage and accuracy
        4. **Pronunciation**: Clarity and accuracy of pronunciation

        Provide:
        - An overall band score (0-9)
        - Individual scores for each criterion (Fluency, Lexical, Grammar, Pronunciation)
        - Strengths of the answer
        - Areas for improvement
        - Specific corrections with explanations
        - A better answer example

        Be constructive and beginner-friendly in your feedback.";

        return prompt;
    }

    private static SpeakingExerciseDto MapToDto(Exercise e) => // TPH: Changed from SpeakingExercise to Exercise
        new()
        {
            Id = e.Id,
            Title = e.Title,
            Description = e.Description,
            Part = e.Part, // TPH: Nullable field
            Question = e.Question,
            Topic = e.Topic,
            Level = e.Level,
            Tips = e.Tips,
            IsActive = e.IsActive,
            CreatedAt = e.CreatedAt
        };
}
