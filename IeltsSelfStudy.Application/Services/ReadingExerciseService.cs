using IeltsSelfStudy.Application.DTOs.ReadingExercises;
using IeltsSelfStudy.Application.DTOs.Common;
using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Domain.Entities;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace IeltsSelfStudy.Application.Services;

public class ReadingExerciseService : IReadingExerciseService
{
    private readonly IGenericRepository<ReadingExercise> _readingRepo;
    private readonly IGenericRepository<Attempt> _attemptRepo;
    private readonly IGenericRepository<Question> _questionRepo;
    private readonly ILogger<ReadingExerciseService> _logger;

    public ReadingExerciseService(
        IGenericRepository<ReadingExercise> readingRepo,
        IGenericRepository<Attempt> attemptRepo,
        IGenericRepository<Question> questionRepo,
        ILogger<ReadingExerciseService> logger)
    {
        _readingRepo = readingRepo;
        _attemptRepo = attemptRepo;
        _questionRepo = questionRepo;
        _logger = logger;
    }

    public async Task<List<ReadingExerciseDto>> GetAllAsync()
    {
        _logger.LogInformation("Getting all reading exercises");
        var list = await _readingRepo.GetAllAsync();
        var result = list.Where(x => x.IsActive).Select(MapToDto).ToList();

        _logger.LogInformation("Retrieved {Count} reading exercises", result.Count);
        return result;
    }

    public async Task<PagedResponse<ReadingExerciseDto>> GetPagedAsync(PagedRequest request)
    {
        _logger.LogInformation("Getting paged reading exercises. PageNumber: {PageNumber}, PageSize: {PageSize}",
            request.PageNumber, request.PageSize);

        var (items, totalCount) = await _readingRepo.GetPagedAsync(
            request,
            filter: q => q.Where(r => r.IsActive),
            orderBy: q => q.OrderByDescending(r => r.CreatedAt)
        );

        var dtos = items.Select(MapToDto).ToList();

        _logger.LogInformation("Retrieved {Count} reading exercises (Page {PageNumber}/{TotalPages})",
            dtos.Count, request.PageNumber, (int)Math.Ceiling(totalCount / (double)request.PageSize));

        return new PagedResponse<ReadingExerciseDto>(dtos, totalCount, request);
    }

    public async Task<ReadingExerciseDto?> GetByIdAsync(int id)
    {
        _logger.LogDebug("Getting reading exercise by ID: {ExerciseId}", id);
        
        var item = await _readingRepo.GetByIdAsync(id);
        if (item is null)
        {
            _logger.LogWarning("Reading exercise not found: {ExerciseId}", id);
            return null;
        }
        return MapToDto(item);
    }

    public async Task<ReadingExerciseDto> CreateAsync(CreateReadingExerciseRequest request)
    {
        _logger.LogInformation("Creating new reading exercise: {Title}", request.Title);
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

        _logger.LogInformation("Reading exercise created successfully: {ExerciseId}, Title: {Title}", entity.Id, entity.Title);
        return MapToDto(entity);
    }

    public async Task<ReadingExerciseDto?> UpdateAsync(int id, UpdateReadingExerciseRequest request)
    {
        _logger.LogInformation("Updating reading exercise: {ExerciseId}", id);
        
        var entity = await _readingRepo.GetByIdAsync(id);
        if (entity is null)
        {
            _logger.LogWarning("Reading exercise not found for update: {ExerciseId}", id);
            return null;
        }

        entity.Title = request.Title;
        entity.Description = request.Description;
        entity.PassageText = request.PassageText;
        entity.Level = request.Level;
        entity.QuestionCount = request.QuestionCount;
        entity.IsActive = request.IsActive;

        _readingRepo.Update(entity);
        await _readingRepo.SaveChangesAsync();

        _logger.LogInformation("Reading exercise updated successfully: {ExerciseId}", id);
        return MapToDto(entity);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        _logger.LogInformation("Deleting reading exercise: {ExerciseId}", id);
        
        var entity = await _readingRepo.GetByIdAsync(id);
        if (entity is null)
        {
            _logger.LogWarning("Reading exercise not found for deletion: {ExerciseId}", id);
            return false;
        }

        // Soft delete
        entity.IsActive = false;

        _readingRepo.Update(entity);
        await _readingRepo.SaveChangesAsync();

        _logger.LogInformation("Reading exercise deleted successfully: {ExerciseId}", id);
        return true;
    }

    public async Task<EvaluateReadingResponse> EvaluateAsync(int readingExerciseId, EvaluateReadingRequest request)
    {
        _logger.LogInformation("Evaluating reading exercise: {ReadingExerciseId}", readingExerciseId);
        // 1. Lấy exercise (DbContext tự đóng sau khi xong)
        var exercise = await _readingRepo.GetByIdAsync(readingExerciseId);
        if (exercise is null)
        {
            _logger.LogError("Reading exercise not found for evaluation: {ReadingExerciseId}", readingExerciseId);
            throw new InvalidOperationException("Reading exercise not found.");
        }

        // 2. Lấy tất cả questions cho exercise này
        var allQuestions = await _questionRepo.GetAllAsync();
        var questions = allQuestions
            .Where(q => q.Skill == "Reading" && q.ExerciseId == readingExerciseId && q.IsActive)
            .OrderBy(q => q.QuestionNumber)
            .ToList();

        if (questions.Count == 0)
        {
            _logger.LogError("No questions found for this exercise: {ReadingExerciseId}", readingExerciseId);
            throw new InvalidOperationException("No questions found for this exercise.");
        }

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

        _logger.LogInformation("Reading exercise evaluation completed. ReadingExerciseId: {ReadingExerciseId}, CorrectCount: {CorrectCount}, TotalQuestions: {TotalQuestions}", 
            readingExerciseId, correctCount, questions.Count);

        // Tính điểm theo thang 9.0 (IELTS)
        var maxScore = 9.0;
        var score = totalPoints > 0 ? (earnedPoints / totalPoints) * maxScore : 0;

        // 4. Lưu attempt (DbContext mới, nhanh)
        var result = await SaveAttemptAsync(readingExerciseId, request, exercise, questions, score, maxScore, correctCount, questionResults);
        _logger.LogInformation("Reading exercise evaluation saved. ReadingExerciseId: {ReadingExerciseId}, AttemptId: {AttemptId}, Score: {Score}", 
            readingExerciseId, result.AttemptId, result.Score);
        return result;
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

        _logger.LogInformation("Reading exercise evaluation saved. ReadingExerciseId: {ReadingExerciseId}, AttemptId: {AttemptId}, Score: {Score}", 
            readingExerciseId, attempt.Id, score);
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
