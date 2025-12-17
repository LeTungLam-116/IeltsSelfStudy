using IeltsSelfStudy.Application.DTOs.WritingExercises;

namespace IeltsSelfStudy.Application.Interfaces;

public interface IWritingExerciseService
{
    Task<List<WritingExerciseDto>> GetAllAsync();
    Task<WritingExerciseDto?> GetByIdAsync(int id);
    Task<WritingExerciseDto> CreateAsync(CreateWritingExerciseRequest request);
    Task<WritingExerciseDto?> UpdateAsync(int id, UpdateWritingExerciseRequest request);
    Task<bool> DeleteAsync(int id);
    Task<EvaluateWritingResponse> EvaluateAsync(int writingExerciseId, EvaluateWritingRequest request);
}
