using IeltsSelfStudy.Application.DTOs.WritingExercises;
using IeltsSelfStudy.Application.DTOs.Common;

namespace IeltsSelfStudy.Application.Interfaces;

public interface IWritingExerciseService
{
    Task<List<WritingExerciseDto>> GetAllAsync();
    Task<PagedResponse<WritingExerciseDto>> GetPagedAsync(PagedRequest request);
    Task<WritingExerciseDto?> GetByIdAsync(int id);
    Task<WritingExerciseDto> CreateAsync(CreateWritingExerciseRequest request);
    Task<WritingExerciseDto?> UpdateAsync(int id, UpdateWritingExerciseRequest request);
    Task<bool> DeleteAsync(int id);
    Task<EvaluateWritingResponse> EvaluateAsync(int writingExerciseId, EvaluateWritingRequest request);
}
