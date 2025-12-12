using IeltsSelfStudy.Application.DTOs.Courses;
using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Domain.Entities;

namespace IeltsSelfStudy.Application.Services;

public class CourseService : ICourseService
{
    private readonly IGenericRepository<Course> _courseRepo;

    public CourseService(IGenericRepository<Course> courseRepo)
    {
        _courseRepo = courseRepo;
    }

    public async Task<List<CourseDto>> GetAllAsync()
    {
        var courses = await _courseRepo.GetAllAsync();
        return courses.Select(MapToDto).ToList();
    }

    public async Task<CourseDto?> GetByIdAsync(int id)
    {
        var course = await _courseRepo.GetByIdAsync(id);
        return course is null ? null : MapToDto(course);
    }

    public async Task<CourseDto> CreateAsync(CreateCourseRequest request)
    {
        var course = new Course
        {
            Name = request.Name,
            ShortDescription = request.ShortDescription,
            Level = request.Level,
            Skill = request.Skill,
            TargetBand = request.TargetBand,
            Price = request.Price,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _courseRepo.AddAsync(course);
        await _courseRepo.SaveChangesAsync();

        return MapToDto(course);
    }

    public async Task<CourseDto?> UpdateAsync(int id, UpdateCourseRequest request)
    {
        var course = await _courseRepo.GetByIdAsync(id);
        if (course is null) return null;

        course.Name = request.Name;
        course.ShortDescription = request.ShortDescription;
        course.Level = request.Level;
        course.Skill = request.Skill;
        course.TargetBand = request.TargetBand;
        course.Price = request.Price;
        course.IsActive = request.IsActive;

        _courseRepo.Update(course);
        await _courseRepo.SaveChangesAsync();

        return MapToDto(course);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var course = await _courseRepo.GetByIdAsync(id);
        if (course is null) return false;

        // XÓA MỀM: chỉ đánh dấu không còn active
        course.IsActive = false;
        _courseRepo.Update(course);
        await _courseRepo.SaveChangesAsync();

        return true;
    }

    private static CourseDto MapToDto(Course c) =>
        new()
        {
            Id = c.Id,
            Name = c.Name,
            ShortDescription = c.ShortDescription,
            Level = c.Level,
            Skill = c.Skill,
            TargetBand = c.TargetBand,
            Price = c.Price,
            IsActive = c.IsActive,
            CreatedAt = c.CreatedAt
        };
}
