using IeltsSelfStudy.Application.DTOs.ListeningExercises;
using IeltsSelfStudy.Application.DTOs.Common;
using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Domain.Entities;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace IeltsSelfStudy.Application.Services;

public class ListeningExerciseService : IListeningExerciseService
{
    private readonly IGenericRepository<ListeningExercise> _listeningRepo;
    private readonly IGenericRepository<Attempt> _attemptRepo;
    private readonly IGenericRepository<Question> _questionRepo;
    private readonly ILogger<ListeningExerciseService> _logger;

    public ListeningExerciseService(
        IGenericRepository<ListeningExercise> listeningRepo,
        IGenericRepository<Attempt> attemptRepo,
        IGenericRepository<Question> questionRepo,
        ILogger<ListeningExerciseService> logger)
    {
        _listeningRepo = listeningRepo;
        _attemptRepo = attemptRepo;
        _questionRepo = questionRepo;
        _logger = logger;
    }

    public async Task<List<ListeningExerciseDto>> GetAllAsync()
    {
        _logger.LogInformation("Getting all listening exercises");
        var list = await _listeningRepo.GetAllAsync();
        var result = list.Where(x => x.IsActive).Select(MapToDto).ToList();

        _logger.LogInformation("Retrieved {Count} listening exercises", result.Count);
        return result;
    }

    public async Task<PagedResponse<ListeningExerciseDto>> GetPagedAsync(PagedRequest request)
    {
        _logger.LogInformation("Getting paged listening exercises. PageNumber: {PageNumber}, PageSize: {PageSize}",
            request.PageNumber, request.PageSize);

        var (items, totalCount) = await _listeningRepo.GetPagedAsync(
            request,
            filter: q => q.Where(l => l.IsActive),
            orderBy: q => q.OrderByDescending(l => l.CreatedAt)
        );

        var dtos = items.Select(MapToDto).ToList();

        _logger.LogInformation("Retrieved {Count} listening exercises (Page {PageNumber}/{TotalPages})",
            dtos.Count, request.PageNumber, (int)Math.Ceiling(totalCount / (double)request.PageSize));

        return new PagedResponse<ListeningExerciseDto>(dtos, totalCount, request);
    }

    public async Task<ListeningExerciseDto?> GetByIdAsync(int id)
    {
        _logger.LogDebug("Getting listening exercise by ID: {ExerciseId}", id);
        var item = await _listeningRepo.GetByIdAsync(id);
        if (item is null)
        {
            _logger.LogWarning("Listening exercise not found: {ExerciseId}", id);
            return null;
        }
        return MapToDto(item);
    }

    public async Task<ListeningExerciseDto> CreateAsync(CreateListeningExerciseRequest request)
    {
        _logger.LogInformation("Creating new listening exercise: {Title}", request.Title);
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

        _logger.LogInformation("Listening exercise created successfully: {ExerciseId}, Title: {Title}", entity.Id, entity.Title);
        return MapToDto(entity);
    }

    public async Task<ListeningExerciseDto?> UpdateAsync(int id, UpdateListeningExerciseRequest request)
    {
        _logger.LogInformation("Updating listening exercise: {ExerciseId}", id);
        
        var entity = await _listeningRepo.GetByIdAsync(id);
        if (entity is null)
        {
            _logger.LogWarning("Listening exercise not found for update: {ExerciseId}", id);
            return null;
        }

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

        _logger.LogInformation("Listening exercise updated successfully: {ExerciseId}", id);
        return MapToDto(entity);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        _logger.LogInformation("Deleting listening exercise: {ExerciseId}", id);
        
        var entity = await _listeningRepo.GetByIdAsync(id);
        if (entity is null)
        {
            _logger.LogWarning("Listening exercise not found for deletion: {ExerciseId}", id);
            return false;
        }

        // soft delete
        entity.IsActive = false;

        _listeningRepo.Update(entity);
        await _listeningRepo.SaveChangesAsync();

        _logger.LogInformation("Listening exercise deleted successfully: {ExerciseId}", id);
        return true;
    }

    public async Task<EvaluateListeningResponse> EvaluateAsync(int listeningExerciseId, EvaluateListeningRequest request)
    {
        _logger.LogInformation("Evaluating listening exercise: {ListeningExerciseId}", listeningExerciseId);
        // 1. Lấy exercise (DbContext tự đóng sau khi xong)
        var exercise = await _listeningRepo.GetByIdAsync(listeningExerciseId);
        if (exercise is null)
        {
            _logger.LogError("Listening exercise not found for evaluation: {ListeningExerciseId}", listeningExerciseId);
            throw new InvalidOperationException("Listening exercise not found.");
        }
        
        // 2. Lấy tất cả questions cho exercise này
        var allQuestions = await _questionRepo.GetAllAsync();
        var questions = allQuestions
            .Where(q => q.Skill == "Listening" && q.ExerciseId == listeningExerciseId && q.IsActive)
            .OrderBy(q => q.QuestionNumber)
            .ToList();

        if (questions.Count == 0)
        {
            _logger.LogError("No questions found for this exercise: {ListeningExerciseId}", listeningExerciseId);
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

        _logger.LogInformation("Listening exercise evaluation saved. ListeningExerciseId: {ListeningExerciseId}, AttemptId: {AttemptId}, Score: {Score}", 
            listeningExerciseId, attempt.Id, score);
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
