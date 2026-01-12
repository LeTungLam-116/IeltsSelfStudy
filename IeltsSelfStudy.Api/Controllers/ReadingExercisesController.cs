using IeltsSelfStudy.Application.DTOs.ReadingExercises;
using IeltsSelfStudy.Application.DTOs.Common;
using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Api.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IeltsSelfStudy.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReadingExercisesController : ControllerBase
{
    private readonly IReadingExerciseService _readingService;

    public ReadingExercisesController(IReadingExerciseService readingService)
    {
        _readingService = readingService;
    }

    // GET /api/readingexercises
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PagedRequest? request)
    {
        // Nếu không có pagination params, trả về tất cả (backward compatible)
        if (request == null || (request.PageNumber == 1 && request.PageSize == 10))
        {
            var list = await _readingService.GetAllAsync();
            return Ok(list);
        }

        var pagedResult = await _readingService.GetPagedAsync(request);
        return Ok(pagedResult);
    }

    // GET /api/readingexercises/5
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await _readingService.GetByIdAsync(id);
        if (item is null) return NotFound();
        return Ok(item);
    }

    // POST /api/readingexercises
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateReadingExerciseRequest request)
    {
        var created = await _readingService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    // PUT /api/readingexercises/5
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateReadingExerciseRequest request)
    {
        var updated = await _readingService.UpdateAsync(id, request);
        if (updated is null) return NotFound();
        return Ok(updated);
    }

    // DELETE /api/readingexercises/5
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _readingService.DeleteAsync(id);
        if (!success) return NotFound();
        return NoContent();
    }

    // POST /api/readingexercises/5/evaluate
    [HttpPost("{id:int}/evaluate")]
    [Authorize]
    public async Task<IActionResult> Evaluate(int id, [FromBody] EvaluateReadingRequest request)
    {
        // Lấy userId từ token thay vì từ body
        var userId = User.GetUserId();
        // Gán userId từ token vào request
        request.UserId = userId;
        var result = await _readingService.EvaluateAsync(id, request);
        return Ok(result);
    }
}