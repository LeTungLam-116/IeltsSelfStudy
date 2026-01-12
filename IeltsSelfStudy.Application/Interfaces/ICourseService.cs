using IeltsSelfStudy.Application.DTOs.Courses;
using IeltsSelfStudy.Application.DTOs.Common;

namespace IeltsSelfStudy.Application.Interfaces;

public interface ICourseService
{
    Task<List<CourseDto>> GetAllAsync();
    Task<PagedResponse<CourseDto>> GetPagedAsync(PagedRequest request);
    Task<CourseDto?> GetByIdAsync(int id);
    Task<CourseDto> CreateAsync(CreateCourseRequest request);
    Task<CourseDto?> UpdateAsync(int id, UpdateCourseRequest request);
    Task<bool> DeleteAsync(int id);

    // Exercise methods
    Task<CourseExerciseDto> AddExerciseToCourseAsync(int courseId, AddExerciseToCourseRequest request);
    Task<List<CourseExerciseDto>> GetCourseExercisesAsync(int courseId);
    Task<bool> RemoveExerciseFromCourseAsync(int courseId, int courseExerciseId);
    Task<bool> UpdateExerciseOrderAsync(int courseId, int courseExerciseId, int newOrder);
}
