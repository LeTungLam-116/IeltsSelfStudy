using IeltsSelfStudy.Application.DTOs.ListeningExercises;
using IeltsSelfStudy.Application.DTOs.Common;
using IeltsSelfStudy.Application.DTOs;
using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Domain.Entities;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace IeltsSelfStudy.Application.Services;

public class ListeningExerciseService : IListeningExerciseService
{
    private readonly IGenericRepository<Exercise> _exerciseRepo; // TPH: Use Exercise instead of ListeningExercise
    private readonly IGenericRepository<Attempt> _attemptRepo;
    private readonly IGenericRepository<Question> _questionRepo;
    private readonly ILogger<ListeningExerciseService> _logger;

    public ListeningExerciseService(
        IGenericRepository<Exercise> exerciseRepo, // Updated to use Exercise
        IGenericRepository<Attempt> attemptRepo,
        IGenericRepository<Question> questionRepo,
        ILogger<ListeningExerciseService> logger)
    {
        _exerciseRepo = exerciseRepo;
        _attemptRepo = attemptRepo;
        _questionRepo = questionRepo;
        _logger = logger;
    }

    public async Task<List<ListeningExerciseDto>> GetAllAsync()
    {
        _logger.LogInformation("Getting all listening exercises");
        // TPH: Filter exercises by Type = "Listening"
        var allExercises = await _exerciseRepo.GetAllAsync();
        var list = allExercises.Where(e => e.Type == "Listening" && e.IsActive).ToList();
        var result = list.Select(MapToDto).ToList();
        
        _logger.LogInformation("Retrieved {Count} listening exercises", result.Count);
        return result;
    }

    public async Task<PagedResponse<ListeningExerciseDto>> GetPagedAsync(PagedRequest request)
    {
        _logger.LogInformation("Getting paged listening exercises. PageNumber: {PageNumber}, PageSize: {PageSize}",
            request.PageNumber, request.PageSize);

        // TPH: Filter by Type = "Listening" and IsActive
        var (items, totalCount) = await _exerciseRepo.GetPagedAsync(
            request,
            filter: q => q.Where(e => e.Type == "Listening" && e.IsActive),
            orderBy: q => q.OrderByDescending(e => e.CreatedAt)
        );

        var dtos = items.Select(MapToDto).ToList();

        _logger.LogInformation("Retrieved {Count} listening exercises (Page {PageNumber}/{TotalPages})",
            dtos.Count, request.PageNumber, (int)Math.Ceiling(totalCount / (double)request.PageSize));

        return new PagedResponse<ListeningExerciseDto>(dtos, totalCount, request);
    }

    public async Task<ListeningExerciseDto?> GetByIdAsync(int id)
    {
        _logger.LogDebug("Getting listening exercise by ID: {ExerciseId}", id);
        // TPH: Get exercise and verify it's a listening exercise
        var item = await _exerciseRepo.GetByIdAsync(id);
        if (item is null || item.Type != "Listening")
        {
            _logger.LogWarning("Listening exercise not found: {ExerciseId}", id);
            return null;
        }
        return MapToDto(item);
    }

    public async Task<ListeningExerciseDto> CreateAsync(CreateListeningExerciseRequest request)
    {
        _logger.LogInformation("Creating new listening exercise: {Title}", request.Title);
        var entity = new Exercise // TPH: Changed from ListeningExercise to Exercise
        {
            Type = "Listening", // TPH: Set discriminator
            Title = request.Title,
            Description = request.Description,
            AudioUrl = request.AudioUrl, // TPH: Nullable field
            Transcript = request.Transcript,
            Level = request.Level,
            QuestionCount = request.QuestionCount,
            DurationSeconds = request.DurationSeconds,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _exerciseRepo.AddAsync(entity); // TPH: Changed from _listeningRepo
        await _exerciseRepo.SaveChangesAsync();
        _logger.LogInformation("Created listening exercise with ID: {ExerciseId}", entity.Id);

        return MapToDto(entity);
    }

    public async Task<ListeningExerciseDto?> UpdateAsync(int id, UpdateListeningExerciseRequest request)
    {
        _logger.LogInformation("Updating listening exercise: {ExerciseId}", id);
        
        // TPH: Get exercise and verify it's a listening exercise
        var entity = await _exerciseRepo.GetByIdAsync(id);
        if (entity is null || entity.Type != "Listening")
        {
            _logger.LogWarning("Listening exercise not found for update: {ExerciseId}", id);
            return null;
        }

        // TPH: Update only listening-specific fields
        entity.Title = request.Title;
        entity.Description = request.Description;
        entity.AudioUrl = request.AudioUrl;
        entity.Transcript = request.Transcript;
        entity.Level = request.Level;
        entity.QuestionCount = request.QuestionCount;
        entity.DurationSeconds = request.DurationSeconds;
        entity.IsActive = request.IsActive;

        _exerciseRepo.Update(entity); // TPH: Changed from _listeningRepo
        await _exerciseRepo.SaveChangesAsync();

        _logger.LogInformation("Listening exercise updated successfully: {ExerciseId}", id);
        return MapToDto(entity);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        _logger.LogInformation("Deleting listening exercise: {ExerciseId}", id);
        
        // TPH: Get exercise and verify it's a listening exercise
        var entity = await _exerciseRepo.GetByIdAsync(id);
        if (entity is null || entity.Type != "Listening")
        {
            _logger.LogWarning("Listening exercise not found for deletion: {ExerciseId}", id);
            return false;
        }

        // Soft delete
        entity.IsActive = false;

        _exerciseRepo.Update(entity); // TPH: Changed from _listeningRepo
        await _exerciseRepo.SaveChangesAsync();

        _logger.LogInformation("Listening exercise deleted successfully: {ExerciseId}", id);
        return true;
    }

    public async Task<EvaluateListeningResponse> EvaluateAsync(int listeningExerciseId, EvaluateListeningRequest request)
    {
        _logger.LogInformation("Evaluating listening exercise: {ListeningExerciseId}", listeningExerciseId);
        // 1. Lấy exercise (TPH: Get exercise and verify it's a listening exercise)
        var exercise = await _exerciseRepo.GetByIdAsync(listeningExerciseId);
        if (exercise is null || exercise.Type != "Listening")
        {
            _logger.LogError("Listening exercise not found for evaluation: {ListeningExerciseId}", listeningExerciseId);
            throw new InvalidOperationException("Listening exercise not found.");
        }
        
        // 2. Lấy tất cả questions cho exercise này
        List<Question> allQuestions = await _questionRepo.GetAllAsync();
        List<Question> questions = allQuestions.Where(q => q.ExerciseId == listeningExerciseId && q.IsActive).ToList();
        if (!questions.Any())
        {
            _logger.LogError("No questions found for this exercise: {ListeningExerciseId}", listeningExerciseId);
            throw new InvalidOperationException("No questions found for this exercise.");
        }

        // 3. Tính điểm từ user answers
        // Convert Answers from Dictionary<string, string> to Dictionary<int, string>
        var answers = request.Answers.ToDictionary(kvp => int.Parse(kvp.Key), kvp => kvp.Value);
        var scoreResult = CalculateScoreAsync(questions, answers);
        var earnedPoints = scoreResult.EarnedPoints;
        var correctCount = scoreResult.CorrectCount;
        var questionResults = scoreResult.QuestionResults;

        // 4. Tính điểm theo thang 9.0 (IELTS)
        var totalPoints = questions.Sum(q => q.Points);
        var maxScore = 9.0;
        var score = totalPoints > 0 ? (earnedPoints / totalPoints) * maxScore : 0;
    
        // 5. Lưu attempt (DbContext mới, nhanh)
        return await SaveAttemptAsync(listeningExerciseId, request, exercise, questions, score, maxScore, correctCount, questionResults);
    }

    private async Task<EvaluateListeningResponse> SaveAttemptAsync(
        int listeningExerciseId,
        EvaluateListeningRequest request,
        Exercise exercise, // TPH: Changed from ListeningExercise to Exercise
        List<Question> questions,
        double score,
        double maxScore,
        int correctCount,
        List<QuestionResult> questionResults)
    {
        // Create feedback
        var feedbackJson = CreateFeedbackJson(questionResults);

        // Save attempt
        var attempt = new Attempt
        {
            UserId = request.UserId,
            ExerciseId = listeningExerciseId,
            Score = score,
            MaxScore = maxScore,
            UserAnswerJson = JsonSerializer.Serialize(request.Answers),
            AiFeedback = feedbackJson,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _attemptRepo.AddAsync(attempt);
        await _attemptRepo.SaveChangesAsync();

        _logger.LogInformation("Listening exercise evaluation saved. ListeningExerciseId: {ListeningExerciseId}, AttemptId: {AttemptId}, Score: {Score}", 
            listeningExerciseId, attempt.Id, score);

        return new EvaluateListeningResponse
        {
            AttemptId = attempt.Id,
            Score = score,
            MaxScore = maxScore,
            CorrectCount = correctCount,
            TotalQuestions = questions.Count,
            QuestionResults = questionResults.ToDictionary(q => q.QuestionId, q => q.IsCorrect),
            Feedback = feedbackJson
        };
    }

    private class CalculateScoreResult
    {
        public double EarnedPoints { get; set; }
        public int CorrectCount { get; set; }
        public List<QuestionResult> QuestionResults { get; set; } = new();
    }

    private static ListeningExerciseDto MapToDto(Exercise e) => // TPH: Changed from ListeningExercise to Exercise
        new ListeningExerciseDto
        {
            Id = e.Id,
            Title = e.Title,
            Description = e.Description,
            AudioUrl = e.AudioUrl, // TPH: Nullable field
            Transcript = e.Transcript,
            Level = e.Level,
            QuestionCount = e.QuestionCount,
            DurationSeconds = e.DurationSeconds,
            IsActive = e.IsActive,
            CreatedAt = e.CreatedAt
        };

    private CalculateScoreResult CalculateScoreAsync(
        List<Question> questions,
        Dictionary<int, string> userAnswers)
    {
        double earnedPoints = 0;
        int correctCount = 0;
        var questionResults = new List<QuestionResult>();

        foreach (var question in questions)
        {
            var userAnswer = userAnswers.GetValueOrDefault(question.Id, "");
            var isCorrect = string.Equals(userAnswer.Trim(), question.CorrectAnswer.Trim(), StringComparison.OrdinalIgnoreCase);

            if (isCorrect)
            {
                earnedPoints += question.Points;
                correctCount++;
            }

            questionResults.Add(new QuestionResult
            {
                QuestionId = question.Id,
                QuestionText = question.QuestionText,
                UserAnswer = userAnswer,
                CorrectAnswer = question.CorrectAnswer,
                IsCorrect = isCorrect,
                Points = isCorrect ? question.Points : 0
            });
        }

        return new CalculateScoreResult
        {
            EarnedPoints = earnedPoints,
            CorrectCount = correctCount,
            QuestionResults = questionResults
        };
    }

    private static string CreateFeedbackJson(List<QuestionResult> questionResults)
    {
        var summary = $"You got {questionResults.Count(q => q.IsCorrect)} out of {questionResults.Count} questions correct.";
        var detailedFeedback = questionResults.Select(q => new
        {
            QuestionId = q.QuestionId,
            QuestionText = q.QuestionText,
            IsCorrect = q.IsCorrect,
            Points = q.Points,
            Feedback = q.IsCorrect ? "Correct!" : $"Incorrect. The correct answer is: {q.CorrectAnswer}"
        }).ToList();

        var feedback = new
        {
            Summary = summary,
            DetailedFeedback = detailedFeedback
        };

        return JsonSerializer.Serialize(feedback, new JsonSerializerOptions { WriteIndented = true });
    }
}