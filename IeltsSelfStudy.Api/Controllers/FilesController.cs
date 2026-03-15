using IeltsSelfStudy.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IeltsSelfStudy.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class FilesController : ControllerBase
{
    private readonly IFileService _fileService;

    public FilesController(IFileService fileService)
    {
        _fileService = fileService;
    }

    [HttpPost("upload")]
    public async Task<IActionResult> UploadWithUrl(IFormFile file, string folder = "common")
    {
        try
        {
            var result = await _fileService.UploadFileAsync(file, folder);
            return Ok(result); // { url, fileName }
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
    
    // For TinyMCE or other editors which expect { location: "url" }
    [HttpPost("upload-image")]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        try
        {
            var result = await _fileService.UploadFileAsync(file, "images");
            return Ok(new { location = result.Url });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("import-questions")]
    public async Task<IActionResult> ImportQuestions(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded" });

        try
        {
            using var stream = file.OpenReadStream();
            var questions = await _fileService.ImportQuestionsFromExcelAsync(stream);
            return Ok(questions);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = $"Import failed: {ex.Message}" });
        }
    }
}
