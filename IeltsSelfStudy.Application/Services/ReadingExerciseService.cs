using IeltsSelfStudy.Application.DTOs.ReadingExercises;
using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Domain.Entities;

namespace IeltsSelfStudy.Application.Services;

public class ReadingExerciseService : IReadingExerciseService
{
    private readonly IGenericRepository<ReadingExercise> _readingRepo;

    public ReadingExerciseService(IGenericRepository<ReadingExercise> readingRepo)
    {
        _readingRepo = readingRepo;
    }

    public async Task<List<ReadingExerciseDto>> GetAllAsync()
    {
        var list = await _readingRepo.GetAllAsync();
        return list.Where(x => x.IsActive).Select(MapToDto).ToList();
    }

    public async Task<ReadingExerciseDto?> GetByIdAsync(int id)
    {
        var entity = await _readingRepo.GetByIdAsync(id);
        return entity is null ? null : MapToDto(entity);
    }

    public async Task<ReadingExerciseDto> CreateAsync(CreateReadingExerciseRequest request)
    {
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

        return MapToDto(entity);
    }

    public async Task<ReadingExerciseDto?> UpdateAsync(int id, UpdateReadingExerciseRequest request)
    {
        var entity = await _readingRepo.GetByIdAsync(id);
        if (entity is null) return null;

        entity.Title = request.Title;
        entity.Description = request.Description;
        entity.PassageText = request.PassageText;
        entity.Level = request.Level;
        entity.QuestionCount = request.QuestionCount;
        entity.IsActive = request.IsActive;

        _readingRepo.Update(entity);
        await _readingRepo.SaveChangesAsync();

        return MapToDto(entity);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var entity = await _readingRepo.GetByIdAsync(id);
        if (entity is null) return false;

        // Soft delete
        entity.IsActive = false;

        _readingRepo.Update(entity);
        await _readingRepo.SaveChangesAsync();

        return true;
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
