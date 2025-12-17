using IeltsSelfStudy.Application.DTOs.WritingExercises;
using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Application.DTOs.Attempts;
using IeltsSelfStudy.Domain.Entities;

namespace IeltsSelfStudy.Application.Services;

public class WritingExerciseService : IWritingExerciseService
{
    private readonly IGenericRepository<WritingExercise> _writingRepo;
    private readonly IGenericRepository<Attempt> _attemptRepo;

    public WritingExerciseService(
        IGenericRepository<WritingExercise> writingRepo,
        IGenericRepository<Attempt> attemptRepo)
    {
        _writingRepo = writingRepo;
        _attemptRepo = attemptRepo;
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
        // 1. Lấy đề Writing
        var exercise = await _writingRepo.GetByIdAsync(writingExerciseId);
        if (exercise is null)
            throw new InvalidOperationException("Writing exercise not found.");

        // 2. Tạo JSON để lưu + gửi cho AI (tạm thời chỉ lưu)
        var payloadForAi = new
        {
            essayText = request.EssayText,
            question = exercise.Question,
            topic = exercise.Topic,
            level = exercise.Level,
            targetBand = request.TargetBand
        };

        var userAnswerJson = System.Text.Json.JsonSerializer.Serialize(payloadForAi);

        // 3. TODO: Gọi AI thật ở đây
        // =======================================
        // Tạm thời: chấm điểm fake theo số từ
        var wordCount = request.EssayText.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length;
        double? score = null;
        double? maxScore = 9.0;
        string feedback = "Demo feedback: hãy tích hợp AI để chấm thật.";

        if (wordCount >= exercise.MinWordCount)
        {
            // ví dụ: điểm tỷ lệ theo số từ
            score = Math.Min(9.0, 3.0 + wordCount / 50.0);
            feedback = $"Bài viết {wordCount} từ. Đây là điểm demo {score:F1}/9.0. Sau này thay bằng AI.";
        }

        // 4. Lưu Attempt
        var attempt = new Attempt
        {
            UserId = request.UserId,
            Skill = "Writing",
            ExerciseId = writingExerciseId,
            Score = score,
            MaxScore = maxScore,
            UserAnswerJson = userAnswerJson,
            AiFeedback = feedback,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _attemptRepo.AddAsync(attempt);
        await _attemptRepo.SaveChangesAsync();

        // 5. Trả response
        return new EvaluateWritingResponse
        {
            AttemptId = attempt.Id,
            Score = score,
            MaxScore = maxScore,
            Feedback = feedback
        };
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
