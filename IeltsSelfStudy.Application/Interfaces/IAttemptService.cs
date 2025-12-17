using IeltsSelfStudy.Application.DTOs.Attempts;

namespace IeltsSelfStudy.Application.Interfaces;

public interface IAttemptService
{
    Task<AttemptDto> CreateAsync(CreateAttemptRequest request);

    Task<AttemptDto?> GetByIdAsync(int id);

    Task<List<AttemptDto>> GetByUserAsync(int userId);

    Task<List<AttemptDto>> GetByExerciseAsync(string skill, int exerciseId);

    Task<AttemptDto?> UpdateAsync(int id, UpdateAttemptRequest request);

    Task<bool> DeleteAsync(int id);
}
