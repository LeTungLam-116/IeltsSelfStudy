using IeltsSelfStudy.Application.DTOs.Common;
using IeltsSelfStudy.Application.DTOs.Exercises;
using IeltsSelfStudy.Application.DTOs.ListeningExercises;
using IeltsSelfStudy.Application.DTOs.ReadingExercises;
using IeltsSelfStudy.Application.DTOs.WritingExercises;
using IeltsSelfStudy.Application.DTOs.SpeakingExercises;
using IeltsSelfStudy.Application.Interfaces;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;

namespace IeltsSelfStudy.Application.Services;

public class ExerciseService : IExerciseService
{
    private readonly IListeningExerciseService _listeningService;
    private readonly IReadingExerciseService _readingService;
    private readonly IWritingExerciseService _writingService;
    private readonly ISpeakingExerciseService _speakingService;
    private readonly ILogger<ExerciseService> _logger;

    public ExerciseService(
        IListeningExerciseService listeningService,
        IReadingExerciseService readingService,
        IWritingExerciseService writingService,
        ISpeakingExerciseService speakingService,
        ILogger<ExerciseService> logger)
    {
        _listeningService = listeningService;
        _readingService = readingService;
        _writingService = writingService;
        _speakingService = speakingService;
        _logger = logger;
    }

    public async Task<List<AdminExerciseDto>> GetAllAsync()
    {
        _logger.LogInformation("Getting all exercises for admin");

        // Sequential execution to avoid DbContext concurrency issues
        var listeningExercises = await GetAllListeningExercises();
        var readingExercises = await GetAllReadingExercises();
        var writingExercises = await GetAllWritingExercises();
        var speakingExercises = await GetAllSpeakingExercises();

        var allExercises = new List<AdminExerciseDto>();
        allExercises.AddRange(listeningExercises);
        allExercises.AddRange(readingExercises);
        allExercises.AddRange(writingExercises);
        allExercises.AddRange(speakingExercises);

        _logger.LogInformation("Retrieved {Count} exercises total", allExercises.Count);
        return allExercises;
    }

    public async Task<PagedResponse<AdminExerciseDto>> GetPagedAsync(PagedRequest request, ExerciseFilters? filters = null)
    {
        _logger.LogInformation("Getting paged exercises for admin. PageNumber: {PageNumber}, PageSize: {PageSize}",
            request.PageNumber, request.PageSize);

        // Get all exercises (this is simplified - in production you'd want proper server-side filtering)
        var allExercises = await GetAllAsync();

        // Apply filters
        if (filters != null)
        {
            allExercises = ApplyFilters(allExercises, filters);
        }

        // Apply sorting
        if (!string.IsNullOrEmpty(filters?.SortBy))
        {
            allExercises = ApplySorting(allExercises, filters.SortBy, filters.SortDirection);
        }

        // Apply pagination
        var totalCount = allExercises.Count;
        var items = allExercises
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        _logger.LogInformation("Retrieved {Count} exercises (Page {PageNumber})",
            items.Count, request.PageNumber);

        return new PagedResponse<AdminExerciseDto>(items, totalCount, request);
    }

    public async Task<AdminExerciseDto?> GetByIdAsync(int id)
    {
        _logger.LogDebug("Getting exercise by ID: {ExerciseId}", id);

        try
        {
            // Try each service sequentially to avoid DbContext concurrency issues
            var listeningExercise = await GetListeningExerciseById(id);
            if (listeningExercise != null)
            {
                _logger.LogDebug("Found listening exercise: {ExerciseId}", id);
                return listeningExercise;
            }

            var readingExercise = await GetReadingExerciseById(id);
            if (readingExercise != null)
            {
                _logger.LogDebug("Found reading exercise: {ExerciseId}", id);
                return readingExercise;
            }

            var writingExercise = await GetWritingExerciseById(id);
            if (writingExercise != null)
            {
                _logger.LogDebug("Found writing exercise: {ExerciseId}", id);
                return writingExercise;
            }

            var speakingExercise = await GetSpeakingExerciseById(id);
            if (speakingExercise != null)
            {
                _logger.LogDebug("Found speaking exercise: {ExerciseId}", id);
                return speakingExercise;
            }

            _logger.LogWarning("Exercise not found: {ExerciseId}", id);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting exercise by ID: {ExerciseId}", id);
            throw;
        }
    }

    public async Task<AdminExerciseDto> CreateAsync(CreateExerciseRequest request)
    {
        _logger.LogInformation("Creating new exercise of type: {Type}", request.Type);

        // Auto-managed question counts: ignore any admin-supplied QuestionCount on create.
        if (request.QuestionCount.HasValue)
        {
            _logger.LogInformation("Ignoring admin-supplied QuestionCount ({Count}) for new exercise of type {Type}", request.QuestionCount.Value, request.Type);
            request.QuestionCount = null;
        }

        return request.Type switch
        {
            "Listening" => await CreateListeningExercise(request),
            "Reading" => await CreateReadingExercise(request),
            "Writing" => await CreateWritingExercise(request),
            "Speaking" => await CreateSpeakingExercise(request),
            _ => throw new ArgumentException($"Unsupported exercise type: {request.Type}")
        };
    }

    public async Task<AdminExerciseDto?> UpdateAsync(int id, UpdateExerciseRequest request)
    {
        _logger.LogInformation("Updating exercise: {ExerciseId}", id);

        // First get the exercise to know its type
        var existingExercise = await GetByIdAsync(id);
        if (existingExercise == null)
        {
            _logger.LogWarning("Exercise not found for update: {ExerciseId}", id);
            return null;
        }

        // Auto-managed question counts: ignore any admin-supplied QuestionCount on update.
        if (request.QuestionCount.HasValue)
        {
            _logger.LogInformation("Ignoring admin-supplied QuestionCount ({Count}) for update of exercise {ExerciseId}", request.QuestionCount.Value, id);
            request.QuestionCount = null;
        }

        return existingExercise.Type switch
        {
            "Listening" => await UpdateListeningExercise(id, request),
            "Reading" => await UpdateReadingExercise(id, request),
            "Writing" => await UpdateWritingExercise(id, request),
            "Speaking" => await UpdateSpeakingExercise(id, request),
            _ => throw new ArgumentException($"Unsupported exercise type: {existingExercise.Type}")
        };
    }

    public async Task<bool> DeleteAsync(int id)
    {
        _logger.LogInformation("Deleting exercise: {ExerciseId}", id);

        // First get the exercise to know its type
        var existingExercise = await GetByIdAsync(id);
        if (existingExercise == null)
        {
            _logger.LogWarning("Exercise not found for deletion: {ExerciseId}", id);
            return false;
        }

        return existingExercise.Type switch
        {
            "Listening" => await _listeningService.DeleteAsync(id),
            "Reading" => await _readingService.DeleteAsync(id),
            "Writing" => await _writingService.DeleteAsync(id),
            "Speaking" => await _speakingService.DeleteAsync(id),
            _ => throw new ArgumentException($"Unsupported exercise type: {existingExercise.Type}")
        };
    }

    public async Task<BulkExerciseResult> BulkUpdateAsync(BulkExerciseOperation operation)
    {
        _logger.LogInformation("Performing bulk {Operation} on {Count} exercises",
            operation.Operation, operation.ExerciseIds.Count);

        var success = 0;
        var failed = 0;
        var errors = new List<BulkExerciseResult.BulkExerciseError>();

        foreach (var exerciseId in operation.ExerciseIds)
        {
            try
            {
                bool operationResult;
                if (operation.Operation == "delete")
                {
                    operationResult = await DeleteAsync(exerciseId);
                }
                else if (operation.Operation == "activate")
                {
                    var result = await UpdateAsync(exerciseId, new UpdateExerciseRequest { IsActive = true });
                    operationResult = result != null;
                }
                else if (operation.Operation == "deactivate")
                {
                    var result = await UpdateAsync(exerciseId, new UpdateExerciseRequest { IsActive = false });
                    operationResult = result != null;
                }
                else
                {
                    throw new ArgumentException($"Unsupported operation: {operation.Operation}");
                }

                if (operationResult)
                {
                    success++;
                }
                else
                {
                    failed++;
                    errors.Add(new BulkExerciseResult.BulkExerciseError
                    {
                        ExerciseId = exerciseId,
                        Error = "Exercise not found or operation failed"
                    });
                }
            }
            catch (Exception ex)
            {
                failed++;
                errors.Add(new BulkExerciseResult.BulkExerciseError
                {
                    ExerciseId = exerciseId,
                    Error = ex.Message
                });
                _logger.LogError(ex, "Failed to {Operation} exercise {ExerciseId}", operation.Operation, exerciseId);
            }
        }

        _logger.LogInformation("Bulk {Operation} completed. Success: {Success}, Failed: {Failed}",
            operation.Operation, success, failed);

        return new BulkExerciseResult
        {
            Success = success,
            Failed = failed,
            Errors = errors
        };
    }

    // Helper methods
    private async Task<List<AdminExerciseDto>> GetAllListeningExercises()
    {
        var exercises = await _listeningService.GetAllAsync();
        return exercises.Select(MapListeningToAdmin).ToList();
    }

    private async Task<List<AdminExerciseDto>> GetAllReadingExercises()
    {
        var exercises = await _readingService.GetAllAsync();
        return exercises.Select(MapReadingToAdmin).ToList();
    }

    private async Task<List<AdminExerciseDto>> GetAllWritingExercises()
    {
        var exercises = await _writingService.GetAllAsync();
        return exercises.Select(MapWritingToAdmin).ToList();
    }

    private async Task<List<AdminExerciseDto>> GetAllSpeakingExercises()
    {
        var exercises = await _speakingService.GetAllAsync();
        return exercises.Select(MapSpeakingToAdmin).ToList();
    }

    private async Task<AdminExerciseDto?> GetListeningExerciseById(int id)
    {
        var dto = await _listeningService.GetByIdAsync(id);
        return dto != null ? MapListeningToAdmin(dto) : null;
    }

    private async Task<AdminExerciseDto?> GetReadingExerciseById(int id)
    {
        var dto = await _readingService.GetByIdAsync(id);
        return dto != null ? MapReadingToAdmin(dto) : null;
    }

    private async Task<AdminExerciseDto?> GetWritingExerciseById(int id)
    {
        var dto = await _writingService.GetByIdAsync(id);
        return dto != null ? MapWritingToAdmin(dto) : null;
    }

    private async Task<AdminExerciseDto?> GetSpeakingExerciseById(int id)
    {
        var dto = await _speakingService.GetByIdAsync(id);
        return dto != null ? MapSpeakingToAdmin(dto) : null;
    }

    private async Task<AdminExerciseDto> CreateListeningExercise(CreateExerciseRequest request)
    {
            var listeningRequest = new CreateListeningExerciseRequest
            {
                Title = request.Title,
                Description = request.Description,
                AudioUrl = request.AudioUrl ?? "",
                Transcript = request.Transcript,
                Level = request.Level ?? "Beginner",
                // QuestionCount is auto-managed — default to 0 on create
                QuestionCount = request.QuestionCount ?? 0,
                DurationSeconds = request.DurationSeconds
            };

        var result = await _listeningService.CreateAsync(listeningRequest);
        return MapListeningToAdmin(result);
    }

    private async Task<AdminExerciseDto> CreateReadingExercise(CreateExerciseRequest request)
    {
            var readingRequest = new CreateReadingExerciseRequest
            {
                Title = request.Title,
                Description = request.Description,
                PassageText = request.PassageText ?? "",
                Level = request.Level ?? "Beginner",
                // QuestionCount is auto-managed — default to 0 on create
                QuestionCount = request.QuestionCount ?? 0
            };

        var result = await _readingService.CreateAsync(readingRequest);
        return MapReadingToAdmin(result);
    }

    private async Task<AdminExerciseDto> CreateWritingExercise(CreateExerciseRequest request)
    {
        var writingRequest = new CreateWritingExerciseRequest
        {
            Title = request.Title,
            Description = request.Description,
            TaskType = request.TaskType ?? "Task2",
            ChartType = request.ChartType,
            EssayType = request.EssayType,
            Question = request.Question ?? "",
            Topic = request.Topic,
            MinWordCount = request.MinWordCount ?? 250,
            SampleAnswer = request.SampleAnswer,
            ImageUrl = request.ImageUrl,
            Level = request.Level ?? "Beginner"
        };

        var result = await _writingService.CreateAsync(writingRequest);
        return MapWritingToAdmin(result);
    }

    private async Task<AdminExerciseDto> CreateSpeakingExercise(CreateExerciseRequest request)
    {
        var speakingRequest = new CreateSpeakingExerciseRequest
        {
            Title = request.Title,
            Description = request.Description,
            Part = request.Part ?? "Part1",
            Question = request.Question ?? "",
            CueCardJson = request.CueCardJson,
            Topic = request.Topic,
            Tips = request.Tips,
            Level = request.Level ?? "Beginner"
        };

        var result = await _speakingService.CreateAsync(speakingRequest);
        return MapSpeakingToAdmin(result);
    }

    private async Task<AdminExerciseDto?> UpdateListeningExercise(int id, UpdateExerciseRequest request)
    {
        // Get current exercise first to fill in required fields
        var current = await GetListeningExerciseById(id);
        if (current == null) return null;

        var listeningRequest = new UpdateListeningExerciseRequest
        {
            Title = request.Title ?? current.Title,
            Description = request.Description ?? current.Description,
            AudioUrl = request.AudioUrl ?? current.AudioUrl,
            Transcript = request.Transcript ?? current.Transcript,
            Level = request.Level ?? current.Level,
            // QuestionCount is auto-managed; preserve current value
            QuestionCount = current.QuestionCount,
            DurationSeconds = request.DurationSeconds ?? current.DurationSeconds,
            IsActive = request.IsActive ?? current.IsActive
        };

        var result = await _listeningService.UpdateAsync(id, listeningRequest);
        return result != null ? MapListeningToAdmin(result) : null;
    }

    private async Task<AdminExerciseDto?> UpdateReadingExercise(int id, UpdateExerciseRequest request)
    {
        // Get current exercise first to fill in required fields
        var current = await GetReadingExerciseById(id);
        if (current == null) return null;

        var readingRequest = new UpdateReadingExerciseRequest
        {
            Title = request.Title ?? current.Title,
            Description = request.Description ?? current.Description,
            PassageText = request.PassageText ?? current.PassageText,
            Level = request.Level ?? current.Level,
            // QuestionCount is auto-managed; preserve current value
            QuestionCount = current.QuestionCount,
            IsActive = request.IsActive ?? current.IsActive
        };

        var result = await _readingService.UpdateAsync(id, readingRequest);
        return result != null ? MapReadingToAdmin(result) : null;
    }

    private async Task<AdminExerciseDto?> UpdateWritingExercise(int id, UpdateExerciseRequest request)
    {
        // Get current exercise first to fill in required fields
        var current = await GetWritingExerciseById(id);
        if (current == null) return null;

        var writingRequest = new UpdateWritingExerciseRequest
        {
            Title = request.Title ?? current.Title,
            Description = request.Description ?? current.Description,
            TaskType = request.TaskType ?? current.TaskType ?? "Task2",
            ChartType = request.ChartType ?? current.ChartType,
            EssayType = request.EssayType ?? current.EssayType,
            Question = request.Question ?? current.Question ?? "",
            Topic = request.Topic ?? current.Topic,
            MinWordCount = request.MinWordCount ?? current.MinWordCount ?? 250,
            SampleAnswer = request.SampleAnswer ?? current.SampleAnswer,
            ImageUrl = request.ImageUrl ?? current.ImageUrl,
            Level = request.Level ?? current.Level,
            IsActive = request.IsActive ?? current.IsActive
        };

        var result = await _writingService.UpdateAsync(id, writingRequest);
        return result != null ? MapWritingToAdmin(result) : null;
    }

    private async Task<AdminExerciseDto?> UpdateSpeakingExercise(int id, UpdateExerciseRequest request)
    {
        // Get current exercise first to fill in required fields
        var current = await GetSpeakingExerciseById(id);
        if (current == null) return null;

        var speakingRequest = new UpdateSpeakingExerciseRequest
        {
            Title = request.Title ?? current.Title,
            Description = request.Description ?? current.Description,
            Part = request.Part ?? current.Part ?? "Part1",
            Question = request.Question ?? current.Question ?? "",
            CueCardJson = request.CueCardJson ?? current.CueCardJson,
            Topic = request.Topic ?? current.Topic,
            Tips = request.Tips ?? current.Tips,
            Level = request.Level ?? current.Level,
            IsActive = request.IsActive ?? current.IsActive
        };

        var result = await _speakingService.UpdateAsync(id, speakingRequest);
        return result != null ? MapSpeakingToAdmin(result) : null;
    }

    // Mapping methods
    private static AdminExerciseDto MapListeningToAdmin(ListeningExerciseDto dto) => new()
    {
        Id = dto.Id,
        Type = "Listening",
        Title = dto.Title,
        Description = dto.Description,
        Level = dto.Level,
        QuestionCount = dto.QuestionCount,
        IsActive = dto.IsActive,
        CreatedAt = dto.CreatedAt,
        Version = 1,
        LastModifiedAt = dto.CreatedAt,
        LastModifiedBy = "system",
        TotalAttempts = 0,
        // Type-specific fields
        AudioUrl = dto.AudioUrl,
        Transcript = dto.Transcript,
        DurationSeconds = dto.DurationSeconds
    };

    private static AdminExerciseDto MapReadingToAdmin(ReadingExerciseDto dto) => new()
    {
        Id = dto.Id,
        Type = "Reading",
        Title = dto.Title,
        Description = dto.Description,
        Level = dto.Level,
        QuestionCount = dto.QuestionCount,
        IsActive = dto.IsActive,
        CreatedAt = dto.CreatedAt,
        Version = 1,
        LastModifiedAt = dto.CreatedAt,
        LastModifiedBy = "system",
        TotalAttempts = 0,
        // Type-specific fields
        PassageText = dto.PassageText
    };

    private static AdminExerciseDto MapWritingToAdmin(WritingExerciseDto dto) => new()
    {
        Id = dto.Id,
        Type = "Writing",
        Title = dto.Title,
        Description = dto.Description,
        Level = dto.Level,
        QuestionCount = 1, // Writing exercises typically have 1 question
        IsActive = dto.IsActive,
        CreatedAt = dto.CreatedAt,
        Version = 1,
        LastModifiedAt = dto.CreatedAt,
        LastModifiedBy = "system",
        TotalAttempts = 0,
        // Type-specific fields
        TaskType = dto.TaskType,
        ChartType = dto.ChartType,
        EssayType = dto.EssayType,
        Topic = dto.Topic,
        MinWordCount = dto.MinWordCount,
        SampleAnswer = dto.SampleAnswer,
        ImageUrl = dto.ImageUrl,
        Question = dto.Question
    };

    private static AdminExerciseDto MapSpeakingToAdmin(SpeakingExerciseDto dto) => new()
    {
        Id = dto.Id,
        Type = "Speaking",
        Title = dto.Title,
        Description = dto.Description,
        Level = dto.Level,
        QuestionCount = 1, // Speaking exercises typically have 1 question/prompt
        IsActive = dto.IsActive,
        CreatedAt = dto.CreatedAt,
        Version = 1,
        LastModifiedAt = dto.CreatedAt,
        LastModifiedBy = "system",
        TotalAttempts = 0,
        // Type-specific fields
        Part = dto.Part,
        Question = dto.Question,
        CueCardJson = dto.CueCardJson,
        Topic = dto.Topic,
        Tips = dto.Tips
    };

    // Additional admin methods
    public async Task<ExercisePreview> GetExercisePreviewAsync(int exerciseId)
    {
        _logger.LogInformation("Getting exercise preview for exercise: {ExerciseId}", exerciseId);

        // Get the exercise first
        var exercise = await GetByIdAsync(exerciseId);
        if (exercise == null)
        {
            _logger.LogWarning("Exercise with ID {ExerciseId} not found", exerciseId);
            throw new ArgumentException($"Exercise with ID {exerciseId} not found");
        }

        _logger.LogDebug("Exercise found: ID={Id}, Type={Type}, Title={Title}", exercise.Id, exercise.Type, exercise.Title);

        // Validate required fields
        if (string.IsNullOrEmpty(exercise.Type))
        {
            _logger.LogError("Exercise Type is null or empty for ID {ExerciseId}", exerciseId);
            throw new ArgumentException("Exercise Type cannot be null or empty");
        }

        if (string.IsNullOrEmpty(exercise.Title))
        {
            _logger.LogError("Exercise Title is null or empty for ID {ExerciseId}", exerciseId);
            throw new ArgumentException("Exercise Title cannot be null or empty");
        }

        // Create preview based on exercise type
        var preview = new ExercisePreview
        {
            Id = exercise.Id,
            Type = exercise.Type,
            Title = exercise.Title,
            Description = exercise.Description,
            Level = exercise.Level,
            QuestionCount = exercise.QuestionCount,
            EstimatedDuration = CalculateEstimatedDuration(exercise),
            HasAudio = exercise.Type == "Listening" && !string.IsNullOrEmpty(exercise.AudioUrl),
            HasText = exercise.Type == "Reading" && !string.IsNullOrEmpty(exercise.PassageText),
            HasQuestions = exercise.QuestionCount > 0
        };

        // Add type-specific preview data
        preview.PreviewData = GetPreviewData(exercise);

        return preview;
    }

    public async Task<ExerciseAnalytics> GetExerciseAnalyticsAsync(int exerciseId)
    {
        _logger.LogInformation("Getting exercise analytics for exercise: {ExerciseId}", exerciseId);

        // For now, return mock analytics data
        // In a real implementation, this would aggregate data from Attempt entities
        var analytics = new ExerciseAnalytics
        {
            ExerciseId = exerciseId,
            TotalAttempts = 0, // TODO: Calculate from attempts
            AverageScore = 0.0, // TODO: Calculate from attempts
            PassRate = 0.0, // TODO: Calculate from attempts
            AverageTimeSpent = 0, // TODO: Calculate from attempts
            LastAttemptAt = DateTime.UtcNow, // TODO: Get from attempts
            PopularScoreRanges = new List<ExerciseAnalytics.ScoreRange>
            {
                new() { Range = "0-2", Count = 0 },
                new() { Range = "3-4", Count = 0 },
                new() { Range = "5-6", Count = 0 },
                new() { Range = "7-9", Count = 0 }
            }
        };

        return analytics;
    }

    public async Task<List<ExerciseVersion>> GetExerciseVersionsAsync(int exerciseId)
    {
        _logger.LogInformation("Getting exercise versions for exercise: {ExerciseId}", exerciseId);

        // For now, return a single current version
        // In a real implementation, this would track version history
        var versions = new List<ExerciseVersion>
        {
            new ExerciseVersion
            {
                Id = 1,
                ExerciseId = exerciseId,
                Version = 1,
                Data = "{}", // TODO: Serialize exercise data
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "system",
                IsActive = true,
                ChangeNotes = "Initial version"
            }
        };

        return versions;
    }

    // Helper methods for filtering and sorting
    private static List<AdminExerciseDto> ApplyFilters(List<AdminExerciseDto> exercises, ExerciseFilters filters)
    {
        var query = exercises.AsQueryable();

        if (filters.Types != null && filters.Types.Any())
        {
            var types = filters.Types;
            query = query.Where(e => types.Contains(e.Type));
        }

        if (filters.Levels != null && filters.Levels.Any())
        {
            var levels = filters.Levels;
            query = query.Where(e => levels.Contains(e.Level));
        }

        if (filters.IsActive.HasValue)
        {
            var isActive = filters.IsActive.Value;
            query = query.Where(e => e.IsActive == isActive);
        }

        if (!string.IsNullOrEmpty(filters.Search))
        {
            var search = filters.Search.ToLower();
            query = query.Where(e =>
                (e.Title != null && e.Title.ToLower().Contains(search)) ||
                (e.Description != null && e.Description.ToLower().Contains(search)));
        }

        return query.ToList();
    }

    private static List<AdminExerciseDto> ApplySorting(List<AdminExerciseDto> exercises, string sortBy, string? sortDirection)
    {
        var isDescending = sortDirection?.ToLower() == "desc";

        var query = exercises.AsQueryable();

        query = sortBy switch
        {
            "title" => isDescending ? query.OrderByDescending(e => e.Title) : query.OrderBy(e => e.Title),
            "type" => isDescending ? query.OrderByDescending(e => e.Type) : query.OrderBy(e => e.Type),
            "level" => isDescending ? query.OrderByDescending(e => e.Level) : query.OrderBy(e => e.Level),
            "createdAt" => isDescending ? query.OrderByDescending(e => e.CreatedAt) : query.OrderBy(e => e.CreatedAt),
            "totalAttempts" => isDescending ? query.OrderByDescending(e => e.TotalAttempts) : query.OrderBy(e => e.TotalAttempts),
            "averageScore" => isDescending ? query.OrderByDescending(e => e.AverageScore) : query.OrderBy(e => e.AverageScore),
            _ => query.OrderByDescending(e => e.CreatedAt)
        };

        return query.ToList();
    }

    private static int CalculateEstimatedDuration(AdminExerciseDto exercise)
    {
        // Rough estimation based on exercise type and question count
        return exercise.Type switch
        {
            "Listening" => Math.Max(180, exercise.QuestionCount * 30), // 30s per question, min 3min
            "Reading" => Math.Max(600, exercise.QuestionCount * 45),   // 45s per question, min 10min
            "Writing" => 2400, // 40 minutes for writing
            "Speaking" => 720,  // 12 minutes for speaking
            _ => 600 // 10 minutes default
        };
    }

    private static object GetPreviewData(AdminExerciseDto exercise)
    {
        // Return partial exercise data for preview as Dictionary for JSON serialization
        return exercise.Type switch
        {
            "Listening" => new Dictionary<string, object>
            {
                ["audioUrl"] = exercise.AudioUrl ?? "",
                ["transcript"] = !string.IsNullOrEmpty(exercise.Transcript)
                    ? exercise.Transcript.Substring(0, Math.Min(200, exercise.Transcript.Length)) + (exercise.Transcript.Length > 200 ? "..." : "")
                    : "",
                ["durationSeconds"] = exercise.DurationSeconds ?? 0
            },
            "Reading" => new Dictionary<string, object>
            {
                ["passageText"] = !string.IsNullOrEmpty(exercise.PassageText)
                    ? exercise.PassageText.Substring(0, Math.Min(300, exercise.PassageText.Length)) + (exercise.PassageText.Length > 300 ? "..." : "")
                    : ""
            },
            "Writing" => new Dictionary<string, object>
            {
                ["taskType"] = exercise.TaskType ?? "",
                ["topic"] = exercise.Topic ?? ""
            },
            "Speaking" => new Dictionary<string, object>
            {
                ["part"] = exercise.Part ?? "",
                ["question"] = exercise.Question ?? ""
            },
            _ => new Dictionary<string, object>()
        };
    }
}
