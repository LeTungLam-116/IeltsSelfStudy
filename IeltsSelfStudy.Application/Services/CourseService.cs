using IeltsSelfStudy.Application.DTOs.Courses;
using IeltsSelfStudy.Application.DTOs.Common;
using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace IeltsSelfStudy.Application.Services;

public class CourseService : ICourseService
{
    private readonly IGenericRepository<Course> _courseRepo;
    private readonly IGenericRepository<CourseExercise> _courseExerciseRepo;
    private readonly IGenericRepository<Exercise> _exerciseRepo;
    private readonly ILogger<CourseService> _logger;

    public CourseService(
        IGenericRepository<Course> courseRepo,
        IGenericRepository<CourseExercise> courseExerciseRepo,
        IGenericRepository<Exercise> exerciseRepo,
        ILogger<CourseService> logger)
    {
        _courseRepo = courseRepo;
        _courseExerciseRepo = courseExerciseRepo;
        _exerciseRepo = exerciseRepo;
        _logger = logger;
    }

    public async Task<List<CourseDto>> GetAllAsync()
    {
        _logger.LogInformation("Getting all active courses");

        var courses = await _courseRepo.GetAllAsync();
        var result = courses
            .Where(c => c.IsActive)
            .Select(MapToDto)
            .ToList();
            
        _logger.LogInformation("Retrieved {Count} active courses", result.Count);
        return result;
    }

    public async Task<PagedResponse<CourseDto>> GetPagedAsync(PagedRequest request)
    {
        _logger.LogInformation("Getting paged courses. PageNumber: {PageNumber}, PageSize: {PageSize}", 
            request.PageNumber, request.PageSize);

        var (items, totalCount) = await _courseRepo.GetPagedAsync(
            request,
            filter: q => q.Where(c => c.IsActive),
            orderBy: q => q.OrderByDescending(c => c.CreatedAt)
        );

        var dtos = items.Select(MapToDto).ToList();
        
        _logger.LogInformation("Retrieved {Count} courses (Page {PageNumber}/{TotalPages})", 
            dtos.Count, request.PageNumber, (int)Math.Ceiling(totalCount / (double)request.PageSize));

        return new PagedResponse<CourseDto>(dtos, totalCount, request);
    }

    public async Task<CourseDto?> GetByIdAsync(int id)
    {
        _logger.LogInformation("Getting course by ID: {CourseId}", id);
        
        var course = await _courseRepo.GetByIdAsync(id);
        if (course is null || !course.IsActive)
        {
            _logger.LogWarning("Course not found or inactive: {CourseId}", id);
            return null;
        }
        
        var dto = MapToDto(course);
        
        // Load exercises
        var exercises = await GetCourseExercisesAsync(id);
        dto.Exercises = exercises;
        
        _logger.LogInformation("Retrieved course {CourseId} with {ExerciseCount} exercises", id, exercises.Count);
        return dto;
    }

    public async Task<CourseDto> CreateAsync(CreateCourseRequest request)
    {
        _logger.LogInformation("Creating new course: {CourseName}", request.Name);
        
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

        _logger.LogInformation("Course created successfully: {CourseId}, Name: {CourseName}", course.Id, course.Name);
        return MapToDto(course);
    }

    public async Task<CourseDto?> UpdateAsync(int id, UpdateCourseRequest request)
    {
        _logger.LogInformation("Updating course: {CourseId}", id);
        
        var course = await _courseRepo.GetByIdAsync(id);
        if (course is null)
        {
            _logger.LogWarning("Course not found for update: {CourseId}", id);
            return null;
        }

        course.Name = request.Name;
        course.ShortDescription = request.ShortDescription;
        course.Level = request.Level;
        course.Skill = request.Skill;
        course.TargetBand = request.TargetBand;
        course.Price = request.Price;
        course.IsActive = request.IsActive;

        _courseRepo.Update(course);
        await _courseRepo.SaveChangesAsync();

        _logger.LogInformation("Course updated successfully: {CourseId}", id);
        return MapToDto(course);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        _logger.LogInformation("Deleting (soft delete) course: {CourseId}", id);
        
        var course = await _courseRepo.GetByIdAsync(id);
        if (course is null)
        {
            _logger.LogWarning("Course not found for deletion: {CourseId}", id);
            return false;
        }

        course.IsActive = false;
        _courseRepo.Update(course);
        await _courseRepo.SaveChangesAsync();

        _logger.LogInformation("Course deleted (soft) successfully: {CourseId}", id);
        return true;
    }

    // Thêm Exercise vào Course
    public async Task<CourseExerciseDto> AddExerciseToCourseAsync(int courseId, AddExerciseToCourseRequest request)
    {
        _logger.LogInformation("Adding exercise to course. CourseId: {CourseId}, ExerciseId: {ExerciseId}",
            courseId, request.ExerciseId);

        // Kiểm tra course tồn tại
        var course = await _courseRepo.GetByIdAsync(courseId);
        if (course is null)
        {
            _logger.LogError("Course not found when adding exercise: {CourseId}", courseId);
            throw new InvalidOperationException("Course not found.");
        }

        // Kiểm tra exercise tồn tại
        var exercise = await _exerciseRepo.GetByIdAsync(request.ExerciseId);
        if (exercise is null)
        {
            _logger.LogError("Exercise not found: {ExerciseId}", request.ExerciseId);
            throw new InvalidOperationException("Exercise not found.");
        }

        // Kiểm tra exercise đã tồn tại trong course chưa
        var allCourseExercises = await _courseExerciseRepo.GetAllAsync();
        var existing = allCourseExercises.Where(ce => ce.CourseId == courseId && ce.ExerciseId == request.ExerciseId).ToList();

        if (existing.Any())
        {
            _logger.LogWarning("Exercise already exists in course. CourseId: {CourseId}, ExerciseId: {ExerciseId}",
                courseId, request.ExerciseId);
            throw new InvalidOperationException("Exercise already exists in this course.");
        }

        // Tạo CourseExercise
        var courseExercise = new CourseExercise
        {
            CourseId = courseId,
            ExerciseId = request.ExerciseId,
            Order = request.Order,
            LessonNumber = request.LessonNumber,
            CreatedAt = DateTime.UtcNow
        };

        await _courseExerciseRepo.AddAsync(courseExercise);
        await _courseExerciseRepo.SaveChangesAsync();

        // Create DTO
        var courseExerciseDto = new CourseExerciseDto
        {
            Id = courseExercise.Id,
            CourseId = courseExercise.CourseId,
            Skill = exercise?.Type ?? "Unknown",
            ExerciseId = courseExercise.ExerciseId,
            Order = courseExercise.Order,
            LessonNumber = courseExercise.LessonNumber,
            CreatedAt = courseExercise.CreatedAt
        };

        return courseExerciseDto;
    }

    // Lấy danh sách Exercises của Course
    public async Task<List<CourseExerciseDto>> GetCourseExercisesAsync(int courseId)
    {
        _logger.LogDebug("Getting exercises for course: {CourseId}", courseId);
        var courseExercises = await _courseExerciseRepo.GetAllAsync();
        var filteredExercises = courseExercises
            .Where(ce => ce.CourseId == courseId)
            .OrderBy(ce => ce.Order)
            .ToList();

        var result = new List<CourseExerciseDto>();
        foreach (var ce in filteredExercises)
        {
            result.Add(await MapToCourseExerciseDtoAsync(ce));
        }
        
        _logger.LogDebug("Retrieved {Count} exercises for course {CourseId}", result.Count, courseId);
        return result;
    }

    // Xóa Exercise khỏi Course
    public async Task<bool> RemoveExerciseFromCourseAsync(int courseId, int courseExerciseId)
    {
        _logger.LogInformation("Removing exercise from course. CourseId: {CourseId}, CourseExerciseId: {CourseExerciseId}", 
            courseId, courseExerciseId);
        
        var courseExercise = await _courseExerciseRepo.GetByIdAsync(courseExerciseId);
        if (courseExercise is null || courseExercise.CourseId != courseId)
        {
            _logger.LogWarning("CourseExercise not found or mismatch. CourseId: {CourseId}, CourseExerciseId: {CourseExerciseId}", 
                courseId, courseExerciseId);
            return false;
        }

        _courseExerciseRepo.Delete(courseExercise);
        await _courseExerciseRepo.SaveChangesAsync();

        _logger.LogInformation("Exercise removed from course successfully. CourseId: {CourseId}, CourseExerciseId: {CourseExerciseId}", 
            courseId, courseExerciseId);
        return true;
    }

    // Cập nhật thứ tự Exercise
    public async Task<bool> UpdateExerciseOrderAsync(int courseId, int courseExerciseId, int newOrder)
    {
        _logger.LogInformation("Updating exercise order. CourseId: {CourseId}, CourseExerciseId: {CourseExerciseId}, NewOrder: {NewOrder}", 
            courseId, courseExerciseId, newOrder);
        
        var courseExercise = await _courseExerciseRepo.GetByIdAsync(courseExerciseId);
        if (courseExercise is null || courseExercise.CourseId != courseId)
        {
            _logger.LogWarning("CourseExercise not found or mismatch for order update. CourseId: {CourseId}, CourseExerciseId: {CourseExerciseId}", 
                courseId, courseExerciseId);
            return false;
        }

        courseExercise.Order = newOrder;
        _courseExerciseRepo.Update(courseExercise);
        await _courseExerciseRepo.SaveChangesAsync();

        _logger.LogInformation("Exercise order updated successfully. CourseId: {CourseId}, CourseExerciseId: {CourseExerciseId}, NewOrder: {NewOrder}", 
            courseId, courseExerciseId, newOrder);
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

    private async Task<CourseExerciseDto> MapToCourseExerciseDtoAsync(CourseExercise ce)
    {
        var exercise = await _exerciseRepo.GetByIdAsync(ce.ExerciseId);
        return new CourseExerciseDto
        {
            Id = ce.Id,
            CourseId = ce.CourseId,
            Skill = exercise?.Type ?? "Unknown",
            ExerciseId = ce.ExerciseId,
            Order = ce.Order,
            LessonNumber = ce.LessonNumber,
            CreatedAt = ce.CreatedAt,
            // Populate basic exercise info
            Exercise = exercise != null ? new
            {
                Id = exercise.Id,
                Title = exercise.Title,
                Type = exercise.Type,
                Level = exercise.Level,
                QuestionCount = exercise.QuestionCount
            } : null
        };
    }
}