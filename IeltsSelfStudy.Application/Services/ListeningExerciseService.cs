using IeltsSelfStudy.Application.DTOs.ListeningExercises;
using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Domain.Entities;

namespace IeltsSelfStudy.Application.Services;

public class ListeningExerciseService : IListeningExerciseService
{
    private readonly IGenericRepository<ListeningExercise> _listeningRepo;

    public ListeningExerciseService(IGenericRepository<ListeningExercise> listeningRepo)
    {
        _listeningRepo = listeningRepo;
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
