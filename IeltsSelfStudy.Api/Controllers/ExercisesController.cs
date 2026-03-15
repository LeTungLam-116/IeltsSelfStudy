using IeltsSelfStudy.Application.DTOs.Common;
using IeltsSelfStudy.Application.DTOs.Exercises;
using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Api.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using IeltsSelfStudy.Api.Models;

namespace IeltsSelfStudy.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
// [Authorize(Roles = "Admin")] // Temporarily disabled for testing
public class ExercisesController : ControllerBase
{
    private readonly IExerciseService _exerciseService;
    private readonly IFileService _fileService;
    private readonly IOutputCacheStore _cacheStore;

    // Tag dùng chung để đánh dấu tất cả cache liên quan đến danh sách Exercises
    private const string ExercisesCacheTag = "exercises_list";

    public ExercisesController(IExerciseService exerciseService, IFileService fileService, IOutputCacheStore cacheStore)
    {
        _exerciseService = exerciseService;
        _fileService = fileService;
        _cacheStore = cacheStore;
    }

    // UploadAudioRequest DTO moved to IeltsSelfStudy.Api.Models.UploadAudioRequest

    // GET /api/exercises
    [HttpGet]
    [OutputCache(Duration = 300, Tags = new[] { ExercisesCacheTag })] // Cache 5 phút, gắn tag để có thể Evict chủ động
    public async Task<IActionResult> GetAll([FromQuery] PagedRequest? request, [FromQuery] ExerciseFilters? filters)
    {
        if (request == null || (request.PageNumber == 1 && request.PageSize == 10))
        {
            // Return all exercises in consistent paged response format
            var list = await _exerciseService.GetAllAsync();
            var result = new
            {
                items = list,
                pageNumber = 1,
                pageSize = list.Count,
                totalCount = list.Count,
                totalPages = 1,
                hasNextPage = false,
                hasPreviousPage = false
            };
            return Ok(result);
        }

        var pagedResult = await _exerciseService.GetPagedAsync(request, filters);
        return Ok(pagedResult);
    }

    // GET /api/exercises/5
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await _exerciseService.GetByIdAsync(id);
        if (item == null) return NotFound();
        return Ok(item);
    }

    // POST /api/exercises
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateExerciseRequest request, CancellationToken cancellationToken)
    {
        var created = await _exerciseService.CreateAsync(request);
        // Admin vừa tạo Exercise mới -> Xóa cache danh sách cũ
        await _cacheStore.EvictByTagAsync(ExercisesCacheTag, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    // PUT /api/exercises/5
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateExerciseRequest request, CancellationToken cancellationToken)
    {
        var updated = await _exerciseService.UpdateAsync(id, request);
        if (updated == null) return NotFound();
        // Admin vừa sửa Exercise -> Xóa cache danh sách
        await _cacheStore.EvictByTagAsync(ExercisesCacheTag, cancellationToken);
        return Ok(updated);
    }

    // DELETE /api/exercises/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var success = await _exerciseService.DeleteAsync(id);
        if (!success) return NotFound();
        // Admin vừa xóa Exercise -> Xóa cache danh sách
        await _cacheStore.EvictByTagAsync(ExercisesCacheTag, cancellationToken);
        return NoContent();
    }

    // POST /api/exercises/bulk
    [HttpPost("bulk")]
    public async Task<IActionResult> BulkUpdate([FromBody] BulkExerciseOperation operation, CancellationToken cancellationToken)
    {
        var result = await _exerciseService.BulkUpdateAsync(operation);
        // Bulk update có thể thay đổi nhiều Exercise -> Xóa cache danh sách
        await _cacheStore.EvictByTagAsync(ExercisesCacheTag, cancellationToken);
        return Ok(result);
    }

    // GET /api/exercises/{id}/preview
    [HttpGet("{id:int}/preview")]
    public async Task<IActionResult> GetPreview(int id)
    {
        try
        {
            var preview = await _exerciseService.GetExercisePreviewAsync(id);
            return Ok(preview);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting exercise preview for ID {id}: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return BadRequest($"Error getting exercise preview: {ex.Message}");
        }
    }

    // GET /api/exercises/{id}/analytics
    [HttpGet("{id:int}/analytics")]
    public async Task<IActionResult> GetAnalytics(int id)
    {
        var analytics = await _exerciseService.GetExerciseAnalyticsAsync(id);
        return Ok(analytics);
    }

    // GET /api/exercises/{id}/versions
    [HttpGet("{id:int}/versions")]
    public async Task<IActionResult> GetVersions(int id)
    {
        var versions = await _exerciseService.GetExerciseVersionsAsync(id);
        return Ok(versions);
    }

    // Additional admin endpoints can be added here as needed:
    // - POST /api/exercises/{id}/versions/{versionId}/revert
    // - POST /api/exercises/import
    // - GET /api/exercises/export
    //
    // POST /api/exercises/upload-audio
    [HttpPost("upload-audio")]
    [Consumes("multipart/form-data")]

    public async Task<IActionResult> UploadAudio([FromForm] UploadAudioRequest request)
    {
        var file = request?.File;
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "No file uploaded." });
        }

        // Basic validation: only allow audio types
        if (!file.ContentType.StartsWith("audio/"))
        {
            return BadRequest(new { message = "Invalid file type. Only audio files are allowed." });
        }

        try
        {
            var uploadsRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "audio");
            if (!Directory.Exists(uploadsRoot))
            {
                Directory.CreateDirectory(uploadsRoot);
            }

            // Use a unique filename
            var ext = Path.GetExtension(file.FileName);
            var fileName = $"{Guid.NewGuid():N}{ext}";
            var filePath = Path.Combine(uploadsRoot, fileName);

            await using (var stream = System.IO.File.Create(filePath))
            {
                await file.CopyToAsync(stream);
            }

            // Construct public URL
            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var publicUrl = $"{baseUrl}/uploads/audio/{fileName}";

            // Note: duration extraction could be added via FFmpeg/mediainfo on the server.
            return Ok(new { url = publicUrl, durationSeconds = (int?)null });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"UploadAudio error: {ex.Message}");
            return StatusCode(500, new { message = "Failed to upload file." });
        }
    }

    // POST /api/exercises/{id}/import-questions
    // Import questions from Excel file for a specific exercise
    [HttpPost("{id:int}/import-questions")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> ImportQuestions(int id, IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded." });

        // Validate file extension
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (ext != ".xlsx" && ext != ".xls")
            return BadRequest(new { message = "Invalid file type. Only Excel files (.xlsx, .xls) are allowed." });

        // Check if exercise exists
        var exercise = await _exerciseService.GetByIdAsync(id);
        if (exercise == null)
            return NotFound(new { message = $"Exercise with ID {id} not found." });

        try
        {
            using var stream = file.OpenReadStream();
            var importedCount = await _fileService.ImportQuestionsForExerciseAsync(id, stream);
            return Ok(new { message = $"Successfully imported {importedCount} questions.", count = importedCount });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"ImportQuestions error: {ex.Message}");
            return StatusCode(500, new { message = $"Failed to import questions: {ex.Message}" });
        }
    }
}
