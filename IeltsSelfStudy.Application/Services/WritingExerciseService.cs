using IeltsSelfStudy.Application.DTOs.WritingExercises;
using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Application.DTOs.Attempts;
using IeltsSelfStudy.Domain.Entities;
using IeltsSelfStudy.Application.Common;
using IeltsSelfStudy.Application.Abstractions;
using System.Text.Json;
using IeltsSelfStudy.Application.DTOs.AI;

namespace IeltsSelfStudy.Application.Services;

public class WritingExerciseService : IWritingExerciseService
{
    private readonly IGenericRepository<WritingExercise> _writingRepo;
    private readonly IGenericRepository<Attempt> _attemptRepo;
    private readonly IOpenAiGradingService _aiGradingService;

    public WritingExerciseService(
        IGenericRepository<WritingExercise> writingRepo,
        IGenericRepository<Attempt> attemptRepo,
        IOpenAiGradingService aiGradingService)
    {
        _writingRepo = writingRepo;
        _attemptRepo = attemptRepo;
        _aiGradingService = aiGradingService;
    }

    public async Task<List<WritingExerciseDto>> GetAllAsync()
    {
        var list = await _writingRepo.GetAllAsync();
        return list.Where(x => x.IsActive).Select(MapToDto).ToList();
    }

    public async Task<WritingExerciseDto?> GetByIdAsync(int id)
    {
        var entity = await _writingRepo.GetByIdAsync(id);
        return entity is null ? null : MapToDto(entity);
    }

    public async Task<WritingExerciseDto> CreateAsync(CreateWritingExerciseRequest request)
    {
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

        return MapToDto(entity);
    }

    public async Task<WritingExerciseDto?> UpdateAsync(int id, UpdateWritingExerciseRequest request)
    {
        var entity = await _writingRepo.GetByIdAsync(id);
        if (entity is null) return null;

        entity.Title = request.Title;
        entity.Description = request.Description;
        entity.TaskType = request.TaskType;
        entity.Question = request.Question;
        entity.Topic = request.Topic;
        entity.Level = request.Level;
        entity.MinWordCount = request.MinWordCount;
        entity.SampleAnswer = request.SampleAnswer;
        entity.IsActive = request.IsActive;

        _writingRepo.Update(entity);
        await _writingRepo.SaveChangesAsync();

        return MapToDto(entity);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var entity = await _writingRepo.GetByIdAsync(id);
        if (entity is null) return false;

        entity.IsActive = false;
        _writingRepo.Update(entity);
        await _writingRepo.SaveChangesAsync();

        return true;
    }

    public async Task<EvaluateWritingResponse> EvaluateAsync(int writingExerciseId, EvaluateWritingRequest request)
    {
        // 1. Lấy đề Writing (DbContext tự đóng sau khi xong)
        var exercise = await _writingRepo.GetByIdAsync(writingExerciseId);
        if (exercise is null)
            throw new InvalidOperationException("Writing exercise not found.");

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
            aiFeedback = await _aiGradingService.GradeWritingAsync(prompt);
        }
        catch (Exception ex)
        {
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
