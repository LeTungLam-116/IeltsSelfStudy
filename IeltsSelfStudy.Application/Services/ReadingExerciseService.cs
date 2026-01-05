using IeltsSelfStudy.Application.DTOs.ReadingExercises;
using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Domain.Entities;
using System.Text.Json;

namespace IeltsSelfStudy.Application.Services;

public class ReadingExerciseService : IReadingExerciseService
{
    private readonly IGenericRepository<ReadingExercise> _readingRepo;
    private readonly IGenericRepository<Attempt> _attemptRepo;
    private readonly IGenericRepository<Question> _questionRepo;

    public ReadingExerciseService(
        IGenericRepository<ReadingExercise> readingRepo,
        IGenericRepository<Attempt> attemptRepo,
        IGenericRepository<Question> questionRepo)
    {
        _readingRepo = readingRepo;
        _attemptRepo = attemptRepo;
        _questionRepo = questionRepo;
    }

    public async Task<List<ReadingExerciseDto>> GetAllAsync()
    {
        var list = await _readingRepo.GetAllAsync();
        return list.Where(x => x.IsActive).Select(MapToDto).ToList();
    }

    public async Task<ReadingExerciseDto?> GetByIdAsync(int id)
    {
        var entity = await _readingRepo.GetByIdAsync(id);
        return entity is null ? null : MapToDto(entity);
    }

    public async Task<ReadingExerciseDto> CreateAsync(CreateReadingExerciseRequest request)
    {
        var entity = new ReadingExercise
        {
            Title = request.Title,
            Description = request.Description,
            PassageText = request.PassageText,
            Level = request.Level,
            QuestionCount = request.QuestionCount,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _readingRepo.AddAsync(entity);
        await _readingRepo.SaveChangesAsync();

        return MapToDto(entity);
    }

    public async Task<ReadingExerciseDto?> UpdateAsync(int id, UpdateReadingExerciseRequest request)
    {
        var entity = await _readingRepo.GetByIdAsync(id);
        if (entity is null) return null;

        entity.Title = request.Title;
        entity.Description = request.Description;
        entity.PassageText = request.PassageText;
        entity.Level = request.Level;
        entity.QuestionCount = request.QuestionCount;
        entity.IsActive = request.IsActive;

        _readingRepo.Update(entity);
        await _readingRepo.SaveChangesAsync();

        return MapToDto(entity);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var entity = await _readingRepo.GetByIdAsync(id);
        if (entity is null) return false;

        // Soft delete
        entity.IsActive = false;

        _readingRepo.Update(entity);
        await _readingRepo.SaveChangesAsync();

        return true;
    }

    public async Task<EvaluateReadingResponse> EvaluateAsync(int readingExerciseId, EvaluateReadingRequest request)
    {
        // 1. Lấy exercise (DbContext tự đóng sau khi xong)
        var exercise = await _readingRepo.GetByIdAsync(readingExerciseId);
        if (exercise is null)
            throw new InvalidOperationException("Reading exercise not found.");

        // 2. Lấy tất cả questions cho exercise này
        var allQuestions = await _questionRepo.GetAllAsync();
        var questions = allQuestions
            .Where(q => q.Skill == "Reading" && q.ExerciseId == readingExerciseId && q.IsActive)
            .OrderBy(q => q.QuestionNumber)
            .ToList();

        if (questions.Count == 0)
            throw new InvalidOperationException("No questions found for this exercise.");

        // 3. Chấm điểm (DbContext đã đóng)
        var questionResults = new Dictionary<int, bool>();
        int correctCount = 0;
        double totalPoints = 0;
        double earnedPoints = 0;

        foreach (var question in questions)
        {
            var userAnswer = request.Answers.GetValueOrDefault(question.QuestionNumber.ToString());
            var isCorrect = string.Equals(userAnswer, question.CorrectAnswer, StringComparison.OrdinalIgnoreCase);
            
            questionResults[question.QuestionNumber] = isCorrect;
            
            if (isCorrect)
            {
                correctCount++;
                earnedPoints += question.Points;
            }
            
            totalPoints += question.Points;
        }

        // Tính điểm theo thang 9.0 (IELTS)
        var maxScore = 9.0;
        var score = totalPoints > 0 ? (earnedPoints / totalPoints) * maxScore : 0;

        // 4. Lưu attempt (DbContext mới, nhanh)
        return await SaveAttemptAsync(readingExerciseId, request, exercise, questions, score, maxScore, correctCount, questionResults);
    }
    private async Task<EvaluateReadingResponse> SaveAttemptAsync(
        int readingExerciseId,
        EvaluateReadingRequest request,
        ReadingExercise exercise,
        List<Question> questions,
        double score,
        double maxScore,
        int correctCount,
        Dictionary<int, bool> questionResults)
    {
        // Tạo JSON để lưu user answer
        var userAnswerJson = JsonSerializer.Serialize(request.Answers);

        // Tạo feedback JSON
        var feedback = new
        {
            correctCount,
            totalQuestions = questions.Count,
            score,
            maxScore,
            questionResults
        };
        var feedbackJson = JsonSerializer.Serialize(feedback, new JsonSerializerOptions { WriteIndented = true });

        var attempt = new Attempt
        {
            UserId = request.UserId,
            Skill = "Reading",
            ExerciseId = readingExerciseId,
            Score = score,
            MaxScore = maxScore,
            UserAnswerJson = userAnswerJson,
            AiFeedback = feedbackJson,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _attemptRepo.AddAsync(attempt);
        await _attemptRepo.SaveChangesAsync();

        return new EvaluateReadingResponse
        {
            AttemptId = attempt.Id,
            Score = score,
            MaxScore = maxScore,
            CorrectCount = correctCount,
            TotalQuestions = questions.Count,
            QuestionResults = questionResults,
            Feedback = feedbackJson
        };
    }

    private static ReadingExerciseDto MapToDto(ReadingExercise e) =>
        new()
        {
            Id = e.Id,
            Title = e.Title,
            Description = e.Description,
            PassageText = e.PassageText,
            Level = e.Level,
            QuestionCount = e.QuestionCount,
            IsActive = e.IsActive,
            CreatedAt = e.CreatedAt
        };
}
