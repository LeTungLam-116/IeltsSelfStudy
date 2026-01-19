using IeltsSelfStudy.Application.DTOs.Attempts;
using IeltsSelfStudy.Application.DTOs.Common;

namespace IeltsSelfStudy.Application.Interfaces;

public interface IAttemptService
{
    Task<AttemptDto> CreateAsync(CreateAttemptRequest request);
    Task<AttemptDto?> GetByIdAsync(int id);

    Task<PagedResponse<AttemptDto>> GetByUserPagedAsync(int userId, PagedRequest request);
    Task<PagedResponse<AttemptDto>> GetByUserAndSkillPagedAsync(int userId, string skill, PagedRequest request);
    Task<PagedResponse<AttemptDto>> GetByExercisePagedAsync(int exerciseId, PagedRequest request);

    Task<AttemptDto?> UpdateAsync(int id, UpdateAttemptRequest request);
    Task<bool> DeleteAsync(int id);

    // Admin methods
    Task<PagedAttemptResponseDto> GetAttemptsAsync(AttemptFiltersDto filters, int pageNumber = 1, int pageSize = 10);
    Task<AttemptDto?> GradeAttemptAsync(int attemptId, GradeAttemptRequestDto gradeRequest, string gradedBy);
}