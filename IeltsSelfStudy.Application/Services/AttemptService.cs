using IeltsSelfStudy.Application.DTOs.Attempts;
using IeltsSelfStudy.Application.DTOs.Common;
using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Domain.Entities;
using Microsoft.Extensions.Logging;

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

        return await MapToDtoAsync(entity);
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

        return await MapToDtoAsync(entity);
    }

    public async Task<PagedResponse<AttemptDto>> GetByUserPagedAsync(int userId, PagedRequest request)
    {
        _logger.LogInformation("Fetching paged attempts for UserId {UserId}. Page {PageNumber}, Size {PageSize}",
            userId, request.PageNumber, request.PageSize);

        var (items, totalCount) = await _attemptRepo.GetPagedAsync(
            request,
            filter: q => q.Where(a => a.UserId == userId && a.IsActive),
            orderBy: q => q.OrderByDescending(a => a.CreatedAt)
        );

        var dtos = new List<AttemptDto>();
        foreach (var item in items)
        {
            dtos.Add(await MapToDtoAsync(item));
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
            filter: q => q.Where(a => a.UserId == userId && a.IsActive),
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
            dtos.Add(await MapToDtoAsync(item));
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
            filter: q => q.Where(a => a.ExerciseId == exerciseId && a.IsActive),
            orderBy: q => q.OrderByDescending(a => a.CreatedAt)
        );

        var dtos = new List<AttemptDto>();
        foreach (var item in attempts)
        {
            dtos.Add(await MapToDtoAsync(item));
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
        return await MapToDtoAsync(entity);
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

    private async Task<AttemptDto> MapToDtoAsync(Attempt e)
    {
        var exercise = await _exerciseRepo.GetByIdAsync(e.ExerciseId);
        return new AttemptDto
        {
            Id = e.Id,
            UserId = e.UserId,
            Skill = exercise?.Type ?? "Unknown",
            ExerciseId = e.ExerciseId,
            Score = e.Score,
            MaxScore = e.MaxScore,
            UserAnswerJson = e.UserAnswerJson,
            AiFeedback = e.AiFeedback,
            IsActive = e.IsActive,
            CreatedAt = e.CreatedAt
        };
    }
}