using IeltsSelfStudy.Application.DTOs.ReadingExercises;

namespace IeltsSelfStudy.Application.Interfaces;

public interface IReadingExerciseService
{
    Task<List<ReadingExerciseDto>> GetAllAsync();
    Task<ReadingExerciseDto?> GetByIdAsync(int id);
    Task<ReadingExerciseDto> CreateAsync(CreateReadingExerciseRequest request);
    Task<ReadingExerciseDto?> UpdateAsync(int id, UpdateReadingExerciseRequest request);
    Task<bool> DeleteAsync(int id);
}
