using IeltsSelfStudy.Application.DTOs.Questions;
using IeltsSelfStudy.Application.DTOs.Common;
using IeltsSelfStudy.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IeltsSelfStudy.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class QuestionsController : ControllerBase
{
    private readonly IQuestionService _questionService;
    private readonly IFileService _fileService;

    public QuestionsController(IQuestionService questionService, IFileService fileService)
    {
        _questionService = questionService;
        _fileService = fileService;
    }

    // GET /api/questions
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PagedRequest? request)
    {
        // Standardize API: always return a PagedResponse shape.
        if (request == null)
        {
            var list = await _questionService.GetAllAsync();
            var paged = new PagedResponse<QuestionDto>(list, list.Count, new PagedRequest { PageNumber = 1, PageSize = list.Count == 0 ? 10 : list.Count });
            return Ok(paged);
        }

        var pagedResult = await _questionService.GetPagedAsync(request);
        return Ok(pagedResult);
    }

    // GET /api/questions/exercise?exerciseId=1
    [HttpGet("exercise")]
    public async Task<IActionResult> GetByExercise([FromQuery] int exerciseId)
    {
        var list = await _questionService.GetByExerciseAsync(exerciseId); // TPH: Updated signature
        return Ok(list);
    }

    // GET /api/questions/5
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await _questionService.GetByIdAsync(id);
        return item is null ? NotFound() : Ok(item);
    }

    // POST /api/questions
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateQuestionRequest request)
    {
        var created = await _questionService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    // POST /api/questions/import/5
    [HttpPost("import/{exerciseId:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ImportFromExcel(int exerciseId, IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded.");

        if (!file.FileName.EndsWith(".xlsx", StringComparison.OrdinalIgnoreCase))
            return BadRequest("Invalid file format. Please upload an .xlsx file.");

        using var stream = new MemoryStream();
        await file.CopyToAsync(stream);
        stream.Position = 0;

        try
        {
            var importedCount = await _fileService.ImportQuestionsForExerciseAsync(exerciseId, stream);
            return Ok(new { message = $"Successfully imported {importedCount} questions." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // POST /api/questions/import/preview/5
    [HttpPost("import/preview/{exerciseId:int}")]
    [Authorize(Roles = "Admin")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> PreviewImportFromExcel(int exerciseId, IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded." });

        if (!file.FileName.EndsWith(".xlsx", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "Invalid file format. Please upload an .xlsx file." });

        using var stream = new MemoryStream();
        await file.CopyToAsync(stream);
        stream.Position = 0;

        var preview = await _questionService.PreviewImportFromExcelAsync(exerciseId, stream);
        return Ok(preview);
    }

    // POST /api/questions/import/confirm
    [HttpPost("import/confirm")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ConfirmImport([FromBody] ConfirmImportRequest request)
    {
        if (request == null || !request.Questions.Any()) return BadRequest(new { message = "Dữ liệu không hợp lệ." });
        
        var (count, error) = await _questionService.ConfirmImportAsync(request);
        if (!string.IsNullOrEmpty(error))
        {
            return BadRequest(new { message = error });
        }
        return Ok(new { message = $"Đã nhập thành công {count} câu hỏi.", count });
    }

    // PUT /api/questions/5
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateQuestionRequest request)
    {
        var updated = await _questionService.UpdateAsync(id, request);
        return updated is null ? NotFound() : Ok(updated);
    }

    // DELETE /api/questions/5
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _questionService.DeleteAsync(id);
        return success ? NoContent() : NotFound();
    }
}