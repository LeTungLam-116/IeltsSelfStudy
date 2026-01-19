using IeltsSelfStudy.Application.DTOs.Common;
using IeltsSelfStudy.Application.DTOs.Exercises;

namespace IeltsSelfStudy.Application.Interfaces;

public interface IExerciseService
{
    Task<List<AdminExerciseDto>> GetAllAsync();
    Task<PagedResponse<AdminExerciseDto>> GetPagedAsync(PagedRequest request, ExerciseFilters? filters = null);
    Task<AdminExerciseDto?> GetByIdAsync(int id);
    Task<AdminExerciseDto> CreateAsync(CreateExerciseRequest request);
    Task<AdminExerciseDto?> UpdateAsync(int id, UpdateExerciseRequest request);
    Task<bool> DeleteAsync(int id);
    Task<BulkExerciseResult> BulkUpdateAsync(BulkExerciseOperation operation);

    // Additional admin methods
    Task<ExercisePreview> GetExercisePreviewAsync(int exerciseId);
    Task<ExerciseAnalytics> GetExerciseAnalyticsAsync(int exerciseId);
    Task<List<ExerciseVersion>> GetExerciseVersionsAsync(int exerciseId);
}
