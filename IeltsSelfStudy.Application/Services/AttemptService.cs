using IeltsSelfStudy.Application.DTOs.Attempts;
using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Domain.Entities;

namespace IeltsSelfStudy.Application.Services;

public class AttemptService : IAttemptService
{
    private readonly IGenericRepository<Attempt> _attemptRepo;

    public AttemptService(IGenericRepository<Attempt> attemptRepo)
    {
        _attemptRepo = attemptRepo;
    }

    public async Task<AttemptDto> CreateAsync(CreateAttemptRequest request)
    {
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

        return MapToDto(entity);
    }

    public async Task<AttemptDto?> GetByIdAsync(int id)
    {
        var entity = await _attemptRepo.GetByIdAsync(id);
        return entity is null ? null : MapToDto(entity);
    }

    public async Task<List<AttemptDto>> GetByUserAsync(int userId)
    {
        var list = await _attemptRepo.GetAllAsync();
        return list
            .Where(a => a.UserId == userId && a.IsActive)
            .OrderByDescending(a => a.CreatedAt)
            .Select(MapToDto)
            .ToList();
    }

    public async Task<List<AttemptDto>> GetByExerciseAsync(string skill, int exerciseId)
    {
        var list = await _attemptRepo.GetAllAsync();
        return list
            .Where(a => a.Skill == skill && a.ExerciseId == exerciseId && a.IsActive)
            .OrderByDescending(a => a.CreatedAt)
            .Select(MapToDto)
            .ToList();
    }

    public async Task<AttemptDto?> UpdateAsync(int id, UpdateAttemptRequest request)
    {
        var entity = await _attemptRepo.GetByIdAsync(id);
        if (entity is null) return null;

        entity.Score = request.Score;
        entity.MaxScore = request.MaxScore;
        entity.UserAnswerJson = request.UserAnswerJson;
        entity.AiFeedback = request.AiFeedback;
        entity.IsActive = request.IsActive;

        _attemptRepo.Update(entity);
        await _attemptRepo.SaveChangesAsync();

        return MapToDto(entity);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var entity = await _attemptRepo.GetByIdAsync(id);
        if (entity is null) return false;

        // soft delete
        entity.IsActive = false;
        _attemptRepo.Update(entity);
        await _attemptRepo.SaveChangesAsync();

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
