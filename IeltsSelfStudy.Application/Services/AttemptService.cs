using IeltsSelfStudy.Application.DTOs.Attempts;
using IeltsSelfStudy.Application.DTOs.Common;
using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Linq;

namespace IeltsSelfStudy.Application.Services;

public class AttemptService : IAttemptService
{
    private readonly IGenericRepository<Attempt> _attemptRepo;
    private readonly IGenericRepository<Exercise> _exerciseRepo;
    private readonly ILogger<AttemptService> _logger;

    public AttemptService(
        IGenericRepository<Attempt> attemptRepo,
        IGenericRepository<Exercise> exerciseRepo,
        ILogger<AttemptService> logger)
    {
        _attemptRepo = attemptRepo;
        _exerciseRepo = exerciseRepo;
        _logger = logger;
    }

    public async Task<AttemptDto> CreateAsync(CreateAttemptRequest request)
    {
        _logger.LogInformation("Creating attempt. UserId: {UserId}, ExerciseId: {ExerciseId}",
            request.UserId, request.ExerciseId);
        
        var entity = new Attempt
        {
            UserId = request.UserId,
            ExerciseId = request.ExerciseId,
            Score = request.Score,
            MaxScore = request.MaxScore,
            UserAnswerJson = request.UserAnswerJson,
            AiFeedback = request.AiFeedback,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _attemptRepo.AddAsync(entity);
        await _attemptRepo.SaveChangesAsync();

        _logger.LogInformation("Attempt created successfully. AttemptId: {AttemptId}, UserId: {UserId}, Score: {Score}",
            entity.Id, request.UserId, request.Score);

        return MapToDto(entity);
    }

    public async Task<AttemptDto?> GetByIdAsync(int id)
    {
        _logger.LogDebug("Getting attempt by ID: {AttemptId}", id);
        
        var entity = await _attemptRepo.GetByIdAsync(id);
        if (entity is null)
        {
            _logger.LogWarning("Attempt not found: {AttemptId}", id);
            return null;
        }

        return MapToDto(entity);
    }

    public async Task<PagedResponse<AttemptDto>> GetByUserPagedAsync(int userId, PagedRequest request)
    {
        _logger.LogInformation("Fetching paged attempts for UserId {UserId}. Page {PageNumber}, Size {PageSize}",
            userId, request.PageNumber, request.PageSize);

        var (items, totalCount) = await _attemptRepo.GetPagedAsync(
            request,
            filter: q => q.Include(a => a.Exercise).Where(a => a.UserId == userId && a.IsActive),
            orderBy: q => q.OrderByDescending(a => a.CreatedAt)
        );

        var dtos = new List<AttemptDto>();
        foreach (var item in items)
        {
            dtos.Add(MapToDto(item));
        }
        var response = new PagedResponse<AttemptDto>(dtos, totalCount, request);

        _logger.LogInformation("Retrieved {Count} attempts for UserId {UserId} (Page {PageNumber}/{TotalPages}, Total: {TotalCount})",
            dtos.Count, userId, response.PageNumber, response.TotalPages, totalCount);

        return response;
    }

    public async Task<PagedResponse<AttemptDto>> GetByUserAndSkillPagedAsync(int userId, string skill, PagedRequest request)
    {
        _logger.LogInformation("Fetching paged attempts for UserId {UserId}, Skill {Skill}. Page {PageNumber}, Size {PageSize}",
            userId, skill, request.PageNumber, request.PageSize);

        var (attempts, totalCount) = await _attemptRepo.GetPagedAsync(
            request,
            filter: q => q.Include(a => a.Exercise).Where(a => a.UserId == userId && a.IsActive),
            orderBy: q => q.OrderByDescending(a => a.CreatedAt)
        );

        // Filter by skill after querying (temporary fix until TPH works)
        var filteredAttempts = new List<Attempt>();
        foreach (var attempt in attempts)
        {
            var exercise = await _exerciseRepo.GetByIdAsync(attempt.ExerciseId);
            if (exercise?.Type == skill)
            {
                filteredAttempts.Add(attempt);
            }
        }

        var dtos = new List<AttemptDto>();
        foreach (var item in filteredAttempts)
        {
            dtos.Add(MapToDto(item));
        }
        var response = new PagedResponse<AttemptDto>(dtos, totalCount, request);

        _logger.LogInformation("Retrieved {Count} attempts for UserId {UserId}, Skill {Skill} (Page {PageNumber}/{TotalPages}, Total: {TotalCount})",
            dtos.Count, userId, skill, response.PageNumber, response.TotalPages, totalCount);

        return response;
    }

    public async Task<PagedResponse<AttemptDto>> GetByExercisePagedAsync(int exerciseId, PagedRequest request)
    {
        _logger.LogInformation("Fetching paged attempts for ExerciseId {ExerciseId}. Page {PageNumber}, Size {PageSize}",
            exerciseId, request.PageNumber, request.PageSize);

        var (attempts, totalCount) = await _attemptRepo.GetPagedAsync(
            request,
            filter: q => q.Include(a => a.Exercise).Where(a => a.ExerciseId == exerciseId && a.IsActive),
            orderBy: q => q.OrderByDescending(a => a.CreatedAt)
        );

        var dtos = new List<AttemptDto>();
        foreach (var item in attempts)
        {
            dtos.Add(MapToDto(item));
        }
        var response = new PagedResponse<AttemptDto>(dtos, totalCount, request);

        _logger.LogInformation("Retrieved {Count} attempts for ExerciseId {ExerciseId} (Page {PageNumber}/{TotalPages}, Total: {TotalCount})",
            dtos.Count, exerciseId, response.PageNumber, response.TotalPages, totalCount);

        return response;
    }

    public async Task<AttemptDto?> UpdateAsync(int id, UpdateAttemptRequest request)
    {
        _logger.LogInformation("Updating attempt: {AttemptId}", id);
        
        var entity = await _attemptRepo.GetByIdAsync(id);
        if (entity is null)
        {
            _logger.LogWarning("Attempt not found for update: {AttemptId}", id);
            return null;
        }

        entity.Score = request.Score;
        entity.MaxScore = request.MaxScore;
        entity.UserAnswerJson = request.UserAnswerJson;
        entity.AiFeedback = request.AiFeedback;
        entity.IsActive = request.IsActive;

        _attemptRepo.Update(entity);
        await _attemptRepo.SaveChangesAsync();

        _logger.LogInformation("Attempt updated successfully: {AttemptId}", id);
        return MapToDto(entity);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        _logger.LogInformation("Deleting attempt: {AttemptId}", id);
        
        var entity = await _attemptRepo.GetByIdAsync(id);
        if (entity is null)
        {
            _logger.LogWarning("Attempt not found for deletion: {AttemptId}", id);
            return false;
        }

        // soft delete
        entity.IsActive = false;
        _attemptRepo.Update(entity);
        await _attemptRepo.SaveChangesAsync();

        _logger.LogInformation("Attempt deleted successfully: {AttemptId}", id);
        return true;
    }

    private AttemptDto MapToDto(Attempt e)
    {
        return new AttemptDto
        {
            Id = e.Id,
            UserId = e.UserId,
            UserName = e.User?.FullName ?? string.Empty,
            Skill = e.Exercise?.Type ?? string.Empty,
            ExerciseId = e.ExerciseId,
            ExerciseTitle = e.Exercise?.Title ?? string.Empty,
            Score = e.Score,
            MaxScore = e.MaxScore,
            UserAnswerJson = e.UserAnswerJson,
            AiFeedback = e.AiFeedback,
            AdminFeedback = e.AdminFeedback,
            IsPassed = e.IsPassed,
            GradedBy = e.GradedBy,
            GradedAt = e.GradedAt,
            IsActive = e.IsActive,
            CreatedAt = e.CreatedAt,
            UpdatedAt = e.UpdatedAt
        };
    }

    public async Task<PagedAttemptResponseDto> GetAttemptsAsync(AttemptFiltersDto filters, int pageNumber = 1, int pageSize = 10)
    {
        _logger.LogInformation("Getting attempts with filters. Page: {Page}, Size: {Size}", pageNumber, pageSize);

        var query = _attemptRepo.GetAll()
            .Include(a => a.User)
            .Include(a => a.Exercise)
            .AsQueryable();

        // Apply filters
        if (filters.UserId.HasValue)
        {
            query = query.Where(a => a.UserId == filters.UserId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filters.Skill))
        {
            query = query.Where(a => a.Exercise != null && a.Exercise.Type == filters.Skill);
        }

        if (filters.ExerciseId.HasValue)
        {
            query = query.Where(a => a.ExerciseId == filters.ExerciseId.Value);
        }


        if (filters.IsGraded.HasValue)
        {
            query = filters.IsGraded.Value
                ? query.Where(a => !string.IsNullOrEmpty(a.GradedBy))
                : query.Where(a => string.IsNullOrEmpty(a.GradedBy));
        }

        if (filters.IsPassed.HasValue)
        {
            query = filters.IsPassed.Value
                ? query.Where(a => a.Score.HasValue && a.MaxScore.HasValue && (a.Score.Value / a.MaxScore.Value) >= 0.5)
                : query.Where(a => a.Score.HasValue && a.MaxScore.HasValue && (a.Score.Value / a.MaxScore.Value) < 0.5);
        }

        if (filters.MinScore.HasValue)
        {
            query = query.Where(a => a.Score >= filters.MinScore.Value);
        }

        if (filters.MaxScore.HasValue)
        {
            query = query.Where(a => a.Score <= filters.MaxScore.Value);
        }

        if (filters.FromDate.HasValue)
        {
            query = query.Where(a => a.CreatedAt >= filters.FromDate.Value);
        }

        if (filters.ToDate.HasValue)
        {
            query = query.Where(a => a.CreatedAt <= filters.ToDate.Value);
        }

        // Apply sorting - default by CreatedAt descending
        query = filters.SortDirection?.ToLower() == "asc"
            ? query.OrderBy(a => a.CreatedAt)
            : query.OrderByDescending(a => a.CreatedAt);

        var totalCount = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var dtos = new List<AttemptDto>();
        foreach (var item in items)
        {
            dtos.Add(MapToDto(item));
        }

        return new PagedAttemptResponseDto
        {
            Items = dtos,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages
        };
    }

    public async Task<AttemptDto?> GradeAttemptAsync(int attemptId, GradeAttemptRequestDto gradeRequest, string gradedBy)
    {
        _logger.LogInformation("Grading attempt {AttemptId} by {GradedBy}. Score: {Score}/{MaxScore}",
            attemptId, gradedBy, gradeRequest.Score, gradeRequest.MaxScore);

        var attempt = await _attemptRepo.GetByIdAsync(attemptId);
        if (attempt == null)
        {
            _logger.LogWarning("Attempt {AttemptId} not found for grading", attemptId);
            return null;
        }

        attempt.Score = gradeRequest.Score;
        attempt.AdminFeedback = gradeRequest.Feedback;
        attempt.IsPassed = gradeRequest.IsPassed;
        attempt.GradedBy = gradedBy;
        attempt.GradedAt = DateTime.UtcNow;
        attempt.GradingNotes = gradeRequest.Feedback; // Note: using feedback as grading notes for now
        attempt.UpdatedAt = DateTime.UtcNow;

        _attemptRepo.Update(attempt);
        await _attemptRepo.SaveChangesAsync();

        _logger.LogInformation("Attempt {AttemptId} graded successfully. Score: {Score}/{MaxScore}",
            attemptId, gradeRequest.Score, gradeRequest.MaxScore);

        return MapToDto(attempt);
    }
}