using System.Text.Json;
using IeltsSelfStudy.Application.DTOs.SpeakingExercises;
using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Domain.Entities;

namespace IeltsSelfStudy.Application.Services;

public class SpeakingExerciseService : ISpeakingExerciseService
{
    private readonly IGenericRepository<SpeakingExercise> _speakingRepo;
    private readonly IGenericRepository<Attempt> _attemptRepo;

    public SpeakingExerciseService(
        IGenericRepository<SpeakingExercise> speakingRepo,
        IGenericRepository<Attempt> attemptRepo)
    {
        _speakingRepo = speakingRepo;
        _attemptRepo = attemptRepo;
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

    // ✅ Evaluate: demo chấm điểm + lưu attempt (sau này thay bằng AI thật)
    public async Task<EvaluateSpeakingResponse> EvaluateAsync(int speakingExerciseId, EvaluateSpeakingRequest request)
    {
        var exercise = await _speakingRepo.GetByIdAsync(speakingExerciseId);
        if (exercise is null)
            throw new InvalidOperationException("Speaking exercise not found.");

        int wordCount = request.AnswerText.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length;

        // TODO: gọi AI thật ở đây
        double? maxScore = 9.0;
        double? score = Math.Min(9.0, 3.0 + wordCount / 25.0); // demo
        string feedback = $"Demo feedback: Bạn trả lời khoảng {wordCount} từ. Hãy nói trôi chảy hơn và dùng từ nối.";

        // userAnswerJson để xem lại history
        var payload = new
        {
            answerText = request.AnswerText,
            wordCount,
            question = exercise.Question,
            part = exercise.Part,
            topic = exercise.Topic,
            level = exercise.Level,
            targetBand = request.TargetBand
        };
        string userAnswerJson = JsonSerializer.Serialize(payload);

        var attempt = new Attempt
        {
            UserId = request.UserId,
            Skill = "Speaking",
            ExerciseId = speakingExerciseId,
            Score = score,
            MaxScore = maxScore,
            UserAnswerJson = userAnswerJson,
            AiFeedback = feedback,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _attemptRepo.AddAsync(attempt);
        await _attemptRepo.SaveChangesAsync();

        return new EvaluateSpeakingResponse
        {
            AttemptId = attempt.Id,
            Score = score,
            MaxScore = maxScore,
            Feedback = feedback
        };
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
