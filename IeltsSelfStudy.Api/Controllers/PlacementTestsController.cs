using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Application.DTOs.Placement;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace IeltsSelfStudy.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PlacementTestsController : ControllerBase
{
    private readonly IPlacementTestService _service;
    private readonly IFileService _fileService;

    public PlacementTestsController(IPlacementTestService service, IFileService fileService)
    {
        _service = service;
        _fileService = fileService;
    }

    [HttpGet]
    public async Task<IActionResult> GetPlacementTest()
    {
        var test = await _service.GetDefaultTestAsync();
        return Ok(test);
    }

    [HttpGet("level")]
    public async Task<IActionResult> GetUserLevel()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var level = await _service.GetUserLevelAsync(userId);
        return Ok(level);
    }
    
    [HttpGet("history")]
    public async Task<IActionResult> GetHistory()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var history = await _service.GetHistoryAsync(userId);
        return Ok(history);
    }
    
    [HttpGet("history/{id}")]
    public async Task<IActionResult> GetResultDetail(int id)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var detail = await _service.GetResultDetailAsync(id, userId);
        if (detail == null) return NotFound();
        return Ok(detail);
    }

    [HttpPost("submit")]
    [Consumes("multipart/form-data")]
    [ApiExplorerSettings(IgnoreApi = true)]
    public async Task<IActionResult> SubmitTest(
        [FromForm] string answersJson,
        [FromForm] string? writingEssay = null)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        
        // Use direct Request.Form.Files to avoid binding issues with some browsers
        var speakingAudio = Request.Form.Files.GetFile("speakingAudio") ?? Request.Form.Files.FirstOrDefault();
        
        var request = new PlacementTestSubmitRequest
        {
            AnswersJson = answersJson,
            WritingEssay = writingEssay
        };
        
        Stream? audioStream = null;
        string? audioFileName = null;
        
        if (speakingAudio != null && speakingAudio.Length > 0)
        {
            audioStream = speakingAudio.OpenReadStream();
            audioFileName = string.IsNullOrEmpty(speakingAudio.FileName) ? "speaking.webm" : speakingAudio.FileName;
            Console.WriteLine($"[Controller] Received file: {speakingAudio.Name} ({audioFileName}), Size: {speakingAudio.Length} bytes");
        }
        else
        {
            Console.WriteLine("[Controller] NO AUDIO FILE DETECTED in the request form.");
            if (Request.Form.Files.Count > 0) 
            {
               Console.WriteLine($"[Controller] Request has {Request.Form.Files.Count} files, but none were captured correctly.");
            }
        }
        
        try 
        {
            var result = await _service.SubmitTestAsync(userId, request, audioStream, audioFileName);
            return Ok(result);
        }
        finally
        {
            if (audioStream != null) await audioStream.DisposeAsync();
        }
    }

    // ==================== ADMIN ENDPOINTS ====================
    
    [HttpGet("admin/all")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllTests()
    {
        var tests = await _service.GetAllTestsAsync();
        return Ok(tests);
    }

    [HttpGet("admin/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetTestById(int id)
    {
        var test = await _service.GetTestByIdAsync(id);
        if (test == null) return NotFound();
        return Ok(test);
    }

    [HttpPost("admin")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateTest([FromBody] CreatePlacementTestRequest request)
    {
        var created = await _service.CreateTestAsync(request);
        return CreatedAtAction(nameof(GetTestById), new { id = created.Id }, created);
    }

    [HttpPut("admin/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateTest(int id, [FromBody] UpdatePlacementTestRequest request)
    {
        var updated = await _service.UpdateTestAsync(id, request);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("admin/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteTest(int id)
    {
        var result = await _service.DeleteTestAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpPut("admin/{id}/activate")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ActivateTest(int id)
    {
        var result = await _service.SetActiveTestAsync(id);
        if (!result) return NotFound();
        return Ok();
    }

    [HttpPost("admin/upload-audio")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UploadAudio(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded." });

        // Basic validation for audio
        if (!file.ContentType.StartsWith("audio/") && !file.ContentType.Equals("application/octet-stream"))
        {
             // Loose check
             return BadRequest(new { message = "Invalid file type. Only audio files are allowed." });
        }

        try
        {
            var result = await _fileService.UploadFileAsync(file, "audio");
            return Ok(new { url = result.Url });
        }
        catch (Exception ex)
        {
            // Log error
            return StatusCode(500, new { message = $"Upload failed: {ex.Message}" });
        }
    }
}
