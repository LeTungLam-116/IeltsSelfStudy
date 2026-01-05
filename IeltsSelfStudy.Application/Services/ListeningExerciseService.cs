using IeltsSelfStudy.Application.DTOs.ListeningExercises;
using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Domain.Entities;
using System.Text.Json;

namespace IeltsSelfStudy.Application.Services;

public class ListeningExerciseService : IListeningExerciseService
{
    private readonly IGenericRepository<ListeningExercise> _listeningRepo;
    private readonly IGenericRepository<Attempt> _attemptRepo;
    private readonly IGenericRepository<Question> _questionRepo;

    public ListeningExerciseService(
        IGenericRepository<ListeningExercise> listeningRepo,
        IGenericRepository<Attempt> attemptRepo,
        IGenericRepository<Question> questionRepo)
    {
        _listeningRepo = listeningRepo;
        _attemptRepo = attemptRepo;
        _questionRepo = questionRepo;
    }

    public async Task<List<ListeningExerciseDto>> GetAllAsync()
    {
        var list = await _listeningRepo.GetAllAsync();
        // Lọc chỉ bài active (nếu muốn)
        return list.Where(x => x.IsActive).Select(MapToDto).ToList();
    }

    public async Task<ListeningExerciseDto?> GetByIdAsync(int id)
    {
        var entity = await _listeningRepo.GetByIdAsync(id);
        return entity is null ? null : MapToDto(entity);
    }

    public async Task<ListeningExerciseDto> CreateAsync(CreateListeningExerciseRequest request)
    {
        var entity = new ListeningExercise
        {
            Title = request.Title,
            Description = request.Description,
            AudioUrl = request.AudioUrl,
            Transcript = request.Transcript,
            Level = request.Level,
            QuestionCount = request.QuestionCount,
            DurationSeconds = request.DurationSeconds,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _listeningRepo.AddAsync(entity);
        await _listeningRepo.SaveChangesAsync();

        return MapToDto(entity);
    }

    public async Task<ListeningExerciseDto?> UpdateAsync(int id, UpdateListeningExerciseRequest request)
    {
        var entity = await _listeningRepo.GetByIdAsync(id);
        if (entity is null) return null;

        entity.Title = request.Title;
        entity.Description = request.Description;
        entity.AudioUrl = request.AudioUrl;
        entity.Transcript = request.Transcript;
        entity.Level = request.Level;
        entity.QuestionCount = request.QuestionCount;
        entity.DurationSeconds = request.DurationSeconds;
        entity.IsActive = request.IsActive;

        _listeningRepo.Update(entity);
        await _listeningRepo.SaveChangesAsync();

        return MapToDto(entity);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var entity = await _listeningRepo.GetByIdAsync(id);
        if (entity is null) return false;

        // soft delete
        entity.IsActive = false;

        _listeningRepo.Update(entity);
        await _listeningRepo.SaveChangesAsync();

        return true;
    }

    public async Task<EvaluateListeningResponse> EvaluateAsync(int listeningExerciseId, EvaluateListeningRequest request)
    {
        // 1. Lấy exercise (DbContext tự đóng sau khi xong)
        var exercise = await _listeningRepo.GetByIdAsync(listeningExerciseId);
        if (exercise is null)
            throw new InvalidOperationException("Listening exercise not found.");

        // 2. Lấy tất cả questions cho exercise này
        var allQuestions = await _questionRepo.GetAllAsync();
        var questions = allQuestions
            .Where(q => q.Skill == "Listening" && q.ExerciseId == listeningExerciseId && q.IsActive)
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
        return await SaveAttemptAsync(listeningExerciseId, request, exercise, questions, score, maxScore, correctCount, questionResults);
    }
    private async Task<EvaluateListeningResponse> SaveAttemptAsync(
        int listeningExerciseId,
        EvaluateListeningRequest request,
        ListeningExercise exercise,
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
            Skill = "Listening",
            ExerciseId = listeningExerciseId,
            Score = score,
            MaxScore = maxScore,
            UserAnswerJson = userAnswerJson,
            AiFeedback = feedbackJson,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
        await _attemptRepo.AddAsync(attempt);
        await _attemptRepo.SaveChangesAsync();

        return new EvaluateListeningResponse
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

    private static ListeningExerciseDto MapToDto(ListeningExercise e) =>
        new()
        {
            Id = e.Id,
            Title = e.Title,
            Description = e.Description,
            AudioUrl = e.AudioUrl,
            Transcript = e.Transcript,
            Level = e.Level,
            QuestionCount = e.QuestionCount,
            DurationSeconds = e.DurationSeconds,
            IsActive = e.IsActive,
            CreatedAt = e.CreatedAt
        };
}
