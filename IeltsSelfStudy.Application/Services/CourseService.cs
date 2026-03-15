using IeltsSelfStudy.Application.DTOs.Courses;
using IeltsSelfStudy.Application.DTOs.Common;
using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Domain.Entities;
using Microsoft.Extensions.Logging;
using System.Linq;

namespace IeltsSelfStudy.Application.Services;

public class CourseService : ICourseService
{
    private readonly IGenericRepository<Course> _courseRepo;
    private readonly IGenericRepository<CourseExercise> _courseExerciseRepo;
    private readonly IGenericRepository<Exercise> _exerciseRepo;
    private readonly IGenericRepository<UserCourse> _userCourseRepo;
    private readonly IGenericRepository<Attempt> _attemptRepo;
    private readonly ILogger<CourseService> _logger;

    public CourseService(
        IGenericRepository<Course> courseRepo,
        IGenericRepository<CourseExercise> courseExerciseRepo,
        IGenericRepository<Exercise> exerciseRepo,
        IGenericRepository<UserCourse> userCourseRepo,
        IGenericRepository<Attempt> attemptRepo,
        ILogger<CourseService> logger)
    {
        _courseRepo = courseRepo;
        _courseExerciseRepo = courseExerciseRepo;
        _exerciseRepo = exerciseRepo;
        _userCourseRepo = userCourseRepo;
        _attemptRepo = attemptRepo;
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

    public async Task<CourseDto?> GetByIdAsync(int id, int? userId = null)
    {
        _logger.LogInformation("Getting course by ID: {CourseId}", id);
        
        var course = await _courseRepo.GetByIdAsync(id);
        if (course is null || !course.IsActive)
        {
            _logger.LogWarning("Course not found or inactive: {CourseId}", id);
            return null;
        }
        
        var dto = MapToDto(course);
        
        // Check Enrollment
        if (userId.HasValue)
        {
            var allUserCourses = await _userCourseRepo.GetAllAsync();
            var isEnrolled = allUserCourses.Any(uc => uc.CourseId == id && uc.UserId == userId.Value && uc.Status == "Active");
            dto.IsEnrolled = isEnrolled;
        }
        
        // Load exercises (with progress if user is authenticated)
        var exercises = userId.HasValue
            ? await GetCourseExercisesWithProgressAsync(id, userId.Value, course.TargetBand)
            : await GetCourseExercisesAsync(id);
        dto.Exercises = exercises;

        // Compute course progress
        dto.TotalExercises = exercises.Count;
        if (userId.HasValue && exercises.Count > 0)
        {
            // An exercise is "completed" when the learner earns >= 2 trophies (score >= 80%)
            dto.CompletedExercises = exercises.Count(e => e.TrophyCount >= 2);
            dto.ProgressPercent = Math.Round((double)dto.CompletedExercises / dto.TotalExercises * 100, 1);
            dto.IsCompleted = dto.CompletedExercises == dto.TotalExercises;
        }
        
        _logger.LogInformation("Retrieved course {CourseId} with {ExerciseCount} exercises, progress {Progress}%",
            id, exercises.Count, dto.ProgressPercent);
        return dto;
    }

    public async Task<CourseDto> CreateAsync(CreateCourseRequest request)
    {
        _logger.LogInformation("Creating new course: {CourseName}", request.Name);
        
        var course = new Course
        {
            Name = request.Name,
            ShortDescription = request.ShortDescription,
            ThumbnailUrl = request.ThumbnailUrl,
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
        course.ThumbnailUrl = request.ThumbnailUrl;
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

    public async Task<List<int>> GetEnrolledCourseIdsAsync(int userId)
    {
        _logger.LogInformation("Getting enrolled course IDs for UserId: {UserId}", userId);
        var userCourses = await _userCourseRepo.GetAllAsync();
        return userCourses
            .Where(uc => uc.UserId == userId && uc.Status == "Active")
            .Select(uc => uc.CourseId)
            .ToList();
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

    // Lấy danh sách Exercises của Course (không có tiến độ người dùng)
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

    // Bộ skill dùng chấm theo band score (AI-graded)
    private static readonly HashSet<string> BandScoredSkills = new(StringComparer.OrdinalIgnoreCase)
    {
        "Writing", "Speaking"
    };

    // Lấy danh sách Exercises kèm tiến độ (trophies) của người dùng
    private async Task<List<CourseExerciseDto>> GetCourseExercisesWithProgressAsync(
        int courseId, int userId, double? targetBand)
    {
        _logger.LogDebug("Getting exercises with progress for course: {CourseId}, user: {UserId}, targetBand: {TargetBand}",
            courseId, userId, targetBand);

        var courseExercises = await _courseExerciseRepo.GetAllAsync();
        var filteredExercises = courseExercises
            .Where(ce => ce.CourseId == courseId)
            .OrderBy(ce => ce.Order)
            .ToList();

        // Lấy toàn bộ attempts của user một lần, sau đó lọc theo exerciseId
        var allAttempts = await _attemptRepo.GetAllAsync();
        var userAttempts = allAttempts
            .Where(a => a.UserId == userId && a.IsActive)
            .ToList();

        var result = new List<CourseExerciseDto>();
        foreach (var ce in filteredExercises)
        {
            var dto = await MapToCourseExerciseDtoAsync(ce);

            var exerciseAttempts = userAttempts
                .Where(a => a.ExerciseId == ce.ExerciseId && a.Score.HasValue)
                .ToList();

            if (exerciseAttempts.Any())
            {
                bool isBandScored = BandScoredSkills.Contains(dto.Skill);

                if (isBandScored)
                {
                    // ── Writing / Speaking: chấm theo band score vs targetBand ──
                    // Score = band score từ AI (ví dụ: 5.5), MaxScore = 9.0
                    var best = exerciseAttempts
                        .OrderByDescending(a => a.Score ?? 0)
                        .First();

                    double bandScore = best.Score ?? 0;
                    dto.HighestBandScore = Math.Round(bandScore, 1);

                    if (targetBand.HasValue && targetBand.Value > 0)
                    {
                        dto.TrophyCount = bandScore >= targetBand.Value        ? 3  // Đạt mục tiêu
                                        : bandScore >= targetBand.Value - 0.5  ? 2  // Gần đạt mục tiêu
                                        : bandScore > 0                        ? 1  // Đã thử nhưng chưa đủ
                                        : 0;
                    }
                    else
                    {
                        // Không có targetBand → fallback: 3 cúp nếu band >= 7.5 (xuất sắc)
                        dto.TrophyCount = bandScore >= 7.5 ? 3
                                        : bandScore >= 6.0 ? 2
                                        : bandScore >= 4.5 ? 1
                                        : 0;
                    }
                }
                else
                {
                    // ── Listening / Reading / Grammar / Vocab: chấm theo % câu đúng ──
                    var attemptsWithMax = exerciseAttempts
                        .Where(a => a.MaxScore.HasValue && a.MaxScore.Value > 0)
                        .ToList();

                    if (attemptsWithMax.Any())
                    {
                        var best = attemptsWithMax
                            .OrderByDescending(a => (a.Score ?? 0) / a.MaxScore!.Value)
                            .First();

                        double pct = (best.Score ?? 0) / best.MaxScore!.Value * 100.0;
                        dto.HighestScorePercent = Math.Round(pct, 1);
                        dto.TrophyCount = pct >= 100.0 ? 3
                                        : pct >= 75.0  ? 2
                                        : pct >= 50.0  ? 1
                                        : 0;
                    }
                }
            }

            result.Add(dto);
        }

        _logger.LogDebug("Retrieved {Count} exercises with progress for course {CourseId}", result.Count, courseId);
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
            ThumbnailUrl = c.ThumbnailUrl,
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