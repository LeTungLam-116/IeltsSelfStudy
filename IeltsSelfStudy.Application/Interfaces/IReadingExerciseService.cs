using IeltsSelfStudy.Application.DTOs.ReadingExercises;
using IeltsSelfStudy.Application.DTOs.Common;

namespace IeltsSelfStudy.Application.Interfaces;

public interface IReadingExerciseService
{
    Task<List<ReadingExerciseDto>> GetAllAsync();
    Task<PagedResponse<ReadingExerciseDto>> GetPagedAsync(PagedRequest request);
    Task<ReadingExerciseDto?> GetByIdAsync(int id);
    Task<ReadingExerciseDto> CreateAsync(CreateReadingExerciseRequest request);
    Task<ReadingExerciseDto?> UpdateAsync(int id, UpdateReadingExerciseRequest request);
    Task<bool> DeleteAsync(int id);
    Task<EvaluateReadingResponse> EvaluateAsync(int readingExerciseId, EvaluateReadingRequest request);
}
