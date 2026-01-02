using IeltsSelfStudy.Application.Common;
using IeltsSelfStudy.Application.DTOs.SpeakingExercises;
using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Domain.Entities;
using IeltsSelfStudy.Application.Abstractions;
using System.Text.Json;
using IeltsSelfStudy.Application.DTOs.AI;

namespace IeltsSelfStudy.Application.Services;

public class SpeakingExerciseService : ISpeakingExerciseService
{
    private readonly IGenericRepository<SpeakingExercise> _speakingRepo;
    private readonly IGenericRepository<Attempt> _attemptRepo;
    private readonly IOpenAiGradingService _aiGradingService;

    public SpeakingExerciseService(
        IGenericRepository<SpeakingExercise> speakingRepo,
        IGenericRepository<Attempt> attemptRepo,
        IOpenAiGradingService aiGradingService)
    {
        _speakingRepo = speakingRepo;
        _attemptRepo = attemptRepo;
        _aiGradingService = aiGradingService;
    }

    public async Task<List<SpeakingExerciseDto>> GetAllAsync()
    {
        var list = await _speakingRepo.GetAllAsync();
        return list.Where(x => x.IsActive).Select(MapToDto).ToList();
    }

    public async Task<SpeakingExerciseDto?> GetByIdAsync(int id)
    {
        var e = await _speakingRepo.GetByIdAsync(id);
        return e is null ? null : MapToDto(e);
    }

    public async Task<SpeakingExerciseDto> CreateAsync(CreateSpeakingExerciseRequest request)
    {
        var e = new SpeakingExercise
        {
            Title = request.Title,
            Description = request.Description,
            Part = request.Part,
            Question = request.Question,
            Topic = request.Topic,
            Level = request.Level,
            Tips = request.Tips,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _speakingRepo.AddAsync(e);
        await _speakingRepo.SaveChangesAsync();

        return MapToDto(e);
    }

    public async Task<SpeakingExerciseDto?> UpdateAsync(int id, UpdateSpeakingExerciseRequest request)
    {
        var e = await _speakingRepo.GetByIdAsync(id);
        if (e is null) return null;

        e.Title = request.Title;
        e.Description = request.Description;
        e.Part = request.Part;
        e.Question = request.Question;
        e.Topic = request.Topic;
        e.Level = request.Level;
        e.Tips = request.Tips;
        e.IsActive = request.IsActive;

        _speakingRepo.Update(e);
        await _speakingRepo.SaveChangesAsync();

        return MapToDto(e);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var e = await _speakingRepo.GetByIdAsync(id);
        if (e is null) return false;

        e.IsActive = false;
        _speakingRepo.Update(e);
        await _speakingRepo.SaveChangesAsync();

        return true;
    }

    public async Task<EvaluateSpeakingResponse> EvaluateAsync(int speakingExerciseId, EvaluateSpeakingRequest request)
    {
        // 1. Lấy exercise (DbContext tự đóng sau khi xong)
        var exercise = await _speakingRepo.GetByIdAsync(speakingExerciseId);
        if (exercise is null)
            throw new InvalidOperationException("Speaking exercise not found.");

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
            aiFeedback = await _aiGradingService.GradeSpeakingAsync(prompt);
        }
        catch (Exception ex)
        {
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
            Skill = "Speaking",
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
    private static string CreatePromptForAI(SpeakingExercise exercise, EvaluateSpeakingRequest request)
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

    private static SpeakingExerciseDto MapToDto(SpeakingExercise e) => new()
    {
        Id = e.Id,
        Title = e.Title,
        Description = e.Description,
        Part = e.Part,
        Question = e.Question,
        Topic = e.Topic,
        Level = e.Level,
        Tips = e.Tips,
        IsActive = e.IsActive,
        CreatedAt = e.CreatedAt
    };
}
