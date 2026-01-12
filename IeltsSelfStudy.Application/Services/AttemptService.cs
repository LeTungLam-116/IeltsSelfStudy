using IeltsSelfStudy.Application.DTOs.Attempts;
using IeltsSelfStudy.Application.DTOs.Common;
using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace IeltsSelfStudy.Application.Services;

public class AttemptService : IAttemptService
{
    private readonly IGenericRepository<Attempt> _attemptRepo;
    private readonly ILogger<AttemptService> _logger;

    public AttemptService(
        IGenericRepository<Attempt> attemptRepo,
        ILogger<AttemptService> logger)
    {
        _attemptRepo = attemptRepo;
        _logger = logger;
    }

    public async Task<AttemptDto> CreateAsync(CreateAttemptRequest request)
    {
        _logger.LogInformation("Creating attempt. UserId: {UserId}, Skill: {Skill}, ExerciseId: {ExerciseId}", 
            request.UserId, request.Skill, request.ExerciseId);
        
        var entity = new Attempt
        {
            UserId = request.UserId,
            Skill = request.Skill,
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
            filter: q => q.Where(a => a.UserId == userId && a.IsActive),
            orderBy: q => q.OrderByDescending(a => a.CreatedAt)
        );

        var dtos = items.Select(MapToDto).ToList();
        var response = new PagedResponse<AttemptDto>(dtos, totalCount, request);

        _logger.LogInformation("Retrieved {Count} attempts for UserId {UserId} (Page {PageNumber}/{TotalPages}, Total: {TotalCount})",
            dtos.Count, userId, response.PageNumber, response.TotalPages, totalCount);

        return response;
    }

    public async Task<PagedResponse<AttemptDto>> GetByUserAndSkillPagedAsync(int userId, string skill, PagedRequest request)
    {
        _logger.LogInformation("Fetching paged attempts for UserId {UserId}, Skill {Skill}. Page {PageNumber}, Size {PageSize}",
            userId, skill, request.PageNumber, request.PageSize);

        var (items, totalCount) = await _attemptRepo.GetPagedAsync(
            request,
            filter: q => q.Where(a => a.UserId == userId && a.Skill == skill && a.IsActive),
            orderBy: q => q.OrderByDescending(a => a.CreatedAt)
        );

        var dtos = items.Select(MapToDto).ToList();
        var response = new PagedResponse<AttemptDto>(dtos, totalCount, request);

        _logger.LogInformation("Retrieved {Count} attempts for UserId {UserId}, Skill {Skill} (Page {PageNumber}/{TotalPages}, Total: {TotalCount})",
            dtos.Count, userId, skill, response.PageNumber, response.TotalPages, totalCount);

        return response;
    }

    public async Task<PagedResponse<AttemptDto>> GetByExercisePagedAsync(string skill, int exerciseId, PagedRequest request)
    {
        _logger.LogInformation("Fetching paged attempts for Skill {Skill}, ExerciseId {ExerciseId}. Page {PageNumber}, Size {PageSize}",
            skill, exerciseId, request.PageNumber, request.PageSize);

        var (items, totalCount) = await _attemptRepo.GetPagedAsync(
            request,
            filter: q => q.Where(a => a.Skill == skill && a.ExerciseId == exerciseId && a.IsActive),
            orderBy: q => q.OrderByDescending(a => a.CreatedAt)
        );

        var dtos = items.Select(MapToDto).ToList();
        var response = new PagedResponse<AttemptDto>(dtos, totalCount, request);

        _logger.LogInformation("Retrieved {Count} attempts for Skill {Skill}, ExerciseId {ExerciseId} (Page {PageNumber}/{TotalPages}, Total: {TotalCount})",
            dtos.Count, skill, exerciseId, response.PageNumber, response.TotalPages, totalCount);

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

    private static AttemptDto MapToDto(Attempt e) =>
        new()
        {
            Id = e.Id,
            UserId = e.UserId,
            Skill = e.Skill,
            ExerciseId = e.ExerciseId,
            Score = e.Score,
            MaxScore = e.MaxScore,
            UserAnswerJson = e.UserAnswerJson,
            AiFeedback = e.AiFeedback,
            IsActive = e.IsActive,
            CreatedAt = e.CreatedAt
        };
}