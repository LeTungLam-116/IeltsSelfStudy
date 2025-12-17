using IeltsSelfStudy.Application.DTOs.WritingExercises;
using IeltsSelfStudy.Application.Interfaces;
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
    public async Task<IActionResult> GetAll()
    {
        var list = await _writingService.GetAllAsync();
        return Ok(list);
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
    public async Task<IActionResult> Create([FromBody] CreateWritingExerciseRequest request)
    {
        var created = await _writingService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    // POST /api/writingexercises/5/evaluate
    [HttpPost("{id:int}/evaluate")]
    public async Task<IActionResult> Evaluate(
    int id,
    [FromBody] EvaluateWritingRequest request)
    {
        try
        {
            var result = await _writingService.EvaluateAsync(id, request);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // PUT /api/writingexercises/5
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateWritingExerciseRequest request)
    {
        var updated = await _writingService.UpdateAsync(id, request);
        if (updated is null) return NotFound();
        return Ok(updated);
    }

    // DELETE /api/writingexercises/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _writingService.DeleteAsync(id);
        if (!success) return NotFound();
        return NoContent();
    }
}
