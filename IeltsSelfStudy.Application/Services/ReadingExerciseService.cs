using IeltsSelfStudy.Application.DTOs.ReadingExercises;
using IeltsSelfStudy.Application.DTOs.Common;
using IeltsSelfStudy.Application.DTOs;
using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Domain.Entities;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace IeltsSelfStudy.Application.Services;

public class ReadingExerciseService : IReadingExerciseService
{
    private readonly IGenericRepository<Exercise> _exerciseRepo; // TPH: Changed from ReadingExercise
    private readonly IGenericRepository<Attempt> _attemptRepo;
    private readonly IGenericRepository<Question> _questionRepo;
    private readonly ILogger<ReadingExerciseService> _logger;

    public ReadingExerciseService(
        IGenericRepository<Exercise> exerciseRepo, // TPH: Changed from ReadingExercise
        IGenericRepository<Attempt> attemptRepo,
        IGenericRepository<Question> questionRepo,
        ILogger<ReadingExerciseService> logger)
    {
        _exerciseRepo = exerciseRepo;
        _attemptRepo = attemptRepo;
        _questionRepo = questionRepo;
        _logger = logger;
    }

    public async Task<List<ReadingExerciseDto>> GetAllAsync()
    {
        _logger.LogInformation("Getting all reading exercises");
        // TPH: Filter exercises by Type = "Reading"
        var allExercises = await _exerciseRepo.GetAllAsync();
        var list = allExercises.Where(e => e.Type == "Reading" && e.IsActive).ToList();
        var result = list.Select(MapToDto).ToList();
        
        _logger.LogInformation("Retrieved {Count} reading exercises", result.Count);
        return result;
    }

    public async Task<PagedResponse<ReadingExerciseDto>> GetPagedAsync(PagedRequest request)
    {
        _logger.LogInformation("Getting paged reading exercises. PageNumber: {PageNumber}, PageSize: {PageSize}",
            request.PageNumber, request.PageSize);

        // TPH: Filter by Type = "Reading" and IsActive
        var (items, totalCount) = await _exerciseRepo.GetPagedAsync(
            request,
            filter: q => q.Where(e => e.Type == "Reading" && e.IsActive),
            orderBy: q => q.OrderByDescending(e => e.CreatedAt)
        );

        var dtos = items.Select(MapToDto).ToList();

        _logger.LogInformation("Retrieved {Count} reading exercises (Page {PageNumber}/{TotalPages})",
            dtos.Count, request.PageNumber, (int)Math.Ceiling(totalCount / (double)request.PageSize));

        return new PagedResponse<ReadingExerciseDto>(dtos, totalCount, request);
    }

    public async Task<ReadingExerciseDto?> GetByIdAsync(int id)
    {
        _logger.LogDebug("Getting reading exercise by ID: {ExerciseId}", id);
        // TPH: Get exercise and verify it's a reading exercise
        var item = await _exerciseRepo.GetByIdAsync(id);
        if (item is null || item.Type != "Reading")
        {
            _logger.LogWarning("Reading exercise not found: {ExerciseId}", id);
            return null;
        }
        return MapToDto(item);
    }

    public async Task<ReadingExerciseDto> CreateAsync(CreateReadingExerciseRequest request)
    {
        _logger.LogInformation("Creating new reading exercise: {Title}", request.Title);
        var entity = new Exercise // TPH: Changed from ReadingExercise to Exercise
        {
            Type = "Reading", // TPH: Set discriminator
            Title = request.Title,
            Description = request.Description,
            PassageText = request.PassageText, // TPH: Nullable field
            Level = request.Level,
            QuestionCount = request.QuestionCount,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _exerciseRepo.AddAsync(entity);
        await _exerciseRepo.SaveChangesAsync();
        _logger.LogInformation("Created reading exercise with ID: {ExerciseId}", entity.Id);

        return MapToDto(entity);
    }

    public async Task<ReadingExerciseDto?> UpdateAsync(int id, UpdateReadingExerciseRequest request)
    {
        _logger.LogInformation("Updating reading exercise: {ExerciseId}", id);
        
        // TPH: Get exercise and verify it's a reading exercise
        var entity = await _exerciseRepo.GetByIdAsync(id);
        if (entity is null || entity.Type != "Reading")
        {
            _logger.LogWarning("Reading exercise not found for update: {ExerciseId}", id);
            return null;
        }

        // TPH: Update only reading-specific fields
        entity.Title = request.Title;
        entity.Description = request.Description;
        entity.PassageText = request.PassageText;
        entity.Level = request.Level;
        entity.QuestionCount = request.QuestionCount;
        entity.IsActive = request.IsActive;

        _exerciseRepo.Update(entity); // TPH: Changed from _readingRepo
        await _exerciseRepo.SaveChangesAsync();

        _logger.LogInformation("Reading exercise updated successfully: {ExerciseId}", id);
        return MapToDto(entity);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        _logger.LogInformation("Deleting reading exercise: {ExerciseId}", id);
        
        // TPH: Get exercise and verify it's a reading exercise
        var entity = await _exerciseRepo.GetByIdAsync(id);
        if (entity is null || entity.Type != "Reading")
        {
            _logger.LogWarning("Reading exercise not found for deletion: {ExerciseId}", id);
            return false;
        }

        // Soft delete
        entity.IsActive = false;

        _exerciseRepo.Update(entity); // TPH: Changed from _readingRepo
        await _exerciseRepo.SaveChangesAsync();

        _logger.LogInformation("Reading exercise deleted successfully: {ExerciseId}", id);
        return true;
    }

    public async Task<EvaluateReadingResponse> EvaluateAsync(int readingExerciseId, EvaluateReadingRequest request)
    {
        _logger.LogInformation("Evaluating reading exercise: {ReadingExerciseId}", readingExerciseId);
        // 1. Lấy exercise (TPH: Get exercise and verify it's a reading exercise)
        var exercise = await _exerciseRepo.GetByIdAsync(readingExerciseId);
        if (exercise is null || exercise.Type != "Reading")
        {
            _logger.LogError("Reading exercise not found for evaluation: {ReadingExerciseId}", readingExerciseId);
            throw new InvalidOperationException("Reading exercise not found.");
        }

        // 2. Lấy tất cả questions cho exercise này
        var allQuestions = await _questionRepo.GetAllAsync();
        var questions = allQuestions.Where(q => q.ExerciseId == readingExerciseId && q.IsActive).ToList();
        if (!questions.Any())
        {
            _logger.LogError("No questions found for this exercise: {ReadingExerciseId}", readingExerciseId);
            throw new InvalidOperationException("No questions found for this exercise.");
        }

        // 3. Tính điểm từ user answers
        var answers = request.Answers.ToDictionary(kvp => int.Parse(kvp.Key), kvp => kvp.Value);
        (double earnedPoints, int correctCount, List<QuestionResult> questionResults) = CalculateScoreAsync(questions, answers);

        // 4. Tính điểm theo thang 9.0 (IELTS)
        var totalPoints = questions.Sum(q => q.Points);
        var maxScore = 9.0;
        var score = totalPoints > 0 ? (earnedPoints / totalPoints) * maxScore : 0;

        // 5. Lưu attempt
        return await SaveAttemptAsync(readingExerciseId, request, exercise, questions, score, maxScore, correctCount, questionResults);
    }

    private async Task<EvaluateReadingResponse> SaveAttemptAsync(
        int readingExerciseId,
        EvaluateReadingRequest request,
        Exercise exercise, // TPH: Changed from ReadingExercise to Exercise
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
            ExerciseId = readingExerciseId,
            Score = score,
            MaxScore = maxScore,
            UserAnswerJson = JsonSerializer.Serialize(request.Answers),
            AiFeedback = feedbackJson,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _attemptRepo.AddAsync(attempt);
        await _attemptRepo.SaveChangesAsync();

        _logger.LogInformation("Reading exercise evaluation saved. ReadingExerciseId: {ReadingExerciseId}, AttemptId: {AttemptId}, Score: {Score}", 
            readingExerciseId, attempt.Id, score);

        return new EvaluateReadingResponse
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

    private static ReadingExerciseDto MapToDto(Exercise e) => // TPH: Changed from ReadingExercise to Exercise
        new()
        {
            Id = e.Id,
            Title = e.Title,
            Description = e.Description,
            PassageText = e.PassageText, // TPH: Nullable field
            Level = e.Level,
            QuestionCount = e.QuestionCount,
            IsActive = e.IsActive,
            CreatedAt = e.CreatedAt
        };

    private (double earnedPoints, int correctCount, List<QuestionResult> questionResults) CalculateScoreAsync(
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

        return (earnedPoints, correctCount, questionResults);
    }

    private static string CreateFeedbackJson(List<QuestionResult> questionResults)
    {
        var feedback = new
        {
            Summary = $"You got {questionResults.Count(q => q.IsCorrect)} out of {questionResults.Count} questions correct.",
            DetailedFeedback = questionResults.Select(q => new
            {
                q.QuestionId,
                q.QuestionText,
                q.IsCorrect,
                q.Points,
                Feedback = q.IsCorrect ? "Correct!" : $"Incorrect. The correct answer is: {q.CorrectAnswer}"
            })
        };

        return JsonSerializer.Serialize(feedback, new JsonSerializerOptions { WriteIndented = true });
    }
}