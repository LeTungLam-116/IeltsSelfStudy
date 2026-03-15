using IeltsSelfStudy.Application.DTOs.Courses;
using IeltsSelfStudy.Application.DTOs.Common;
using IeltsSelfStudy.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using IeltsSelfStudy.Api.Models;

namespace IeltsSelfStudy.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CoursesController : ControllerBase
{
    private readonly ICourseService _courseService;
    private readonly IFileService _fileService;
    private readonly IOutputCacheStore _cacheStore;

    // Tag dùng chung để đánh dấu tất cả cache liên quan đến danh sách Courses
    private const string CoursesCacheTag = "courses_list";

    public CoursesController(ICourseService courseService, IFileService fileService, IOutputCacheStore cacheStore)
    {
        _courseService = courseService;
        _fileService = fileService;
        _cacheStore = cacheStore;
    }

    [HttpGet]
    [OutputCache(Duration = 300, Tags = new[] { CoursesCacheTag })] // Cache 5 phút, gắn tag để có thể Evict chủ động
    public async Task<IActionResult> GetAll([FromQuery] PagedRequest? request)
    {
        // Nếu không có pagination params, trả về tất cả (backward compatible)
        if (request == null || (request.PageNumber == 1 && request.PageSize == 10))
        {
            var courses = await _courseService.GetAllAsync();
            return Ok(courses);
        }

        var pagedResult = await _courseService.GetPagedAsync(request);
        return Ok(pagedResult);
    }

    [HttpGet("my-enrolled-ids")]
    [Authorize]
    public async Task<IActionResult> GetMyEnrolledCourseIds()
    {
        var userIdStr = User.FindFirst("id")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
        {
            return Unauthorized(new { message = "User ID not found in token" });
        }

        var courseIds = await _courseService.GetEnrolledCourseIdsAsync(userId);
        return Ok(courseIds);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        int? userId = null;
        // Try to get user id from claims if authenticated
        var userIdClaim = User.FindFirst("id")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        
        if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out int uid))
        {
            userId = uid;
        }

        var course = await _courseService.GetByIdAsync(id, userId);
        if (course is null) return NotFound();
        return Ok(course);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateCourseRequest request, CancellationToken cancellationToken)
    {
        var created = await _courseService.CreateAsync(request);
        // Admin vừa thêm Course mới -> Xóa cache danh sách cũ để user thấy ngay
        await _cacheStore.EvictByTagAsync(CoursesCacheTag, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateCourseRequest request, CancellationToken cancellationToken)
    {
        var updated = await _courseService.UpdateAsync(id, request);
        if (updated is null) return NotFound();
        // Admin vừa sửa Course -> Xóa cache danh sách để user thấy dữ liệu mới nhất
        await _cacheStore.EvictByTagAsync(CoursesCacheTag, cancellationToken);
        return Ok(updated);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var success = await _courseService.DeleteAsync(id);
        if (!success) return NotFound();
        // Admin vừa xóa Course -> Xóa cache danh sách
        await _cacheStore.EvictByTagAsync(CoursesCacheTag, cancellationToken);
        return NoContent();
    }

    // Thêm Exercise vào Course
    [HttpPost("{courseId:int}/exercises")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AddExercise(int courseId, [FromBody] AddExerciseToCourseRequest request)
    {
        var result = await _courseService.AddExerciseToCourseAsync(courseId, request);
        return Ok(result);
    }

    // Lấy danh sách Exercises của Course
    [HttpGet("{courseId:int}/exercises")]
    public async Task<IActionResult> GetExercises(int courseId)
    {
        var exercises = await _courseService.GetCourseExercisesAsync(courseId);
        return Ok(exercises);
    }

    // Xóa Exercise khỏi Course
    [HttpDelete("{courseId:int}/exercises/{courseExerciseId:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RemoveExercise(int courseId, int courseExerciseId)
    {
        var success = await _courseService.RemoveExerciseFromCourseAsync(courseId, courseExerciseId);
        if (!success) return NotFound();
        return NoContent();
    }

    // Cập nhật thứ tự Exercise
    [HttpPut("{courseId:int}/exercises/{courseExerciseId:int}/order")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateExerciseOrder(
        int courseId, 
        int courseExerciseId, 
        [FromBody] int newOrder)
    {
        var success = await _courseService.UpdateExerciseOrderAsync(courseId, courseExerciseId, newOrder);
        if (!success) return NotFound();
        return Ok(new { message = "Order updated successfully." });
    }
    [HttpGet("test-upload")]
    public IActionResult TestUpload() => Ok("Upload route is reachable!");

    // POST /api/courses/upload-thumbnail
    [HttpPost("upload-thumbnail")]
    // [Authorize(Roles = "Admin")]
    // [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadThumbnail(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "No file uploaded." });
        }

        // Basic validation: only allow image types
        if (!file.ContentType.StartsWith("image/"))
        {
            return BadRequest(new { message = "Invalid file type. Only image files are allowed." });
        }

        try
        {
            // Use FileService to upload to Cloudinary
            var uploadResult = await _fileService.UploadFileAsync(file, "courses/thumbnails");

            return Ok(new { url = uploadResult.Url });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"UploadThumbnail error: {ex.Message}");
            return StatusCode(500, new { message = $"Failed to upload file: {ex.Message}" });
        }
    }
}