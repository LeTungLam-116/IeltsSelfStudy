using IeltsSelfStudy.Application.DTOs.ListeningExercises;

namespace IeltsSelfStudy.Application.Interfaces;

public interface IListeningExerciseService
{
    Task<List<ListeningExerciseDto>> GetAllAsync();
    Task<ListeningExerciseDto?> GetByIdAsync(int id);
    Task<ListeningExerciseDto> CreateAsync(CreateListeningExerciseRequest request);
    Task<ListeningExerciseDto?> UpdateAsync(int id, UpdateListeningExerciseRequest request);
    Task<bool> DeleteAsync(int id);
}
