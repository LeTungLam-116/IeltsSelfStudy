using IeltsSelfStudy.Application.DTOs.Courses;

namespace IeltsSelfStudy.Application.Interfaces;

public interface ICourseService
{
    Task<List<CourseDto>> GetAllAsync();
    Task<CourseDto?> GetByIdAsync(int id);
    Task<CourseDto> CreateAsync(CreateCourseRequest request);
    Task<CourseDto?> UpdateAsync(int id, UpdateCourseRequest request);
    Task<bool> DeleteAsync(int id);
}
