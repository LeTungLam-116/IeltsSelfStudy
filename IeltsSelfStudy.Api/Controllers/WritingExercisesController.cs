using IeltsSelfStudy.Application.DTOs.WritingExercises;
using IeltsSelfStudy.Application.DTOs.Common;
using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Api.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IeltsSelfStudy.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WritingExercisesController : ControllerBase
{
    private readonly IWritingExerciseService _writingService;

    public WritingExercisesController(IWritingExerciseService writingService)
    {
        _writingService = writingService;
    }

    // GET /api/writingexercises
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PagedRequest? request)
    {
        // Nếu không có pagination params, trả về tất cả (backward compatible)
        if (request == null || (request.PageNumber == 1 && request.PageSize == 10))
        {
            var list = await _writingService.GetAllAsync();
            return Ok(list);
        }

        var pagedResult = await _writingService.GetPagedAsync(request);
        return Ok(pagedResult);
    }

    // GET /api/writingexercises/5
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await _writingService.GetByIdAsync(id);
        if (item is null) return NotFound();
        return Ok(item);
    }

    // POST /api/writingexercises
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateWritingExerciseRequest request)
    {
        var created = await _writingService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    // POST /api/writingexercises/5/evaluate
    [HttpPost("{id:int}/evaluate")]
    [Authorize]
    public async Task<IActionResult> Evaluate(
    int id,
    [FromBody] EvaluateWritingRequest request)
    {
        // Lấy userId từ token thay vì từ body
        var userId = User.GetUserId();
        request.UserId = userId; // Gán userId từ token vào request
        
        var result = await _writingService.EvaluateAsync(id, request);
        return Ok(result);
    }

    // PUT /api/writingexercises/5
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateWritingExerciseRequest request)
    {
        var updated = await _writingService.UpdateAsync(id, request);
        if (updated is null) return NotFound();
        return Ok(updated);
    }

    // DELETE /api/writingexercises/5
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _writingService.DeleteAsync(id);
        if (!success) return NotFound();
        return NoContent();
    }
}
