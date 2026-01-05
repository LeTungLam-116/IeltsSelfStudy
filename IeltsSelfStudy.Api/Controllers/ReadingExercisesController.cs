using IeltsSelfStudy.Application.DTOs.ReadingExercises;
using IeltsSelfStudy.Application.Interfaces;
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
    public async Task<IActionResult> GetAll()
    {
        var list = await _readingService.GetAllAsync();
        return Ok(list);
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
    public async Task<IActionResult> Create([FromBody] CreateReadingExerciseRequest request)
    {
        var created = await _readingService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    // PUT /api/readingexercises/5
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateReadingExerciseRequest request)
    {
        var updated = await _readingService.UpdateAsync(id, request);
        if (updated is null) return NotFound();
        return Ok(updated);
    }

    // DELETE /api/readingexercises/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _readingService.DeleteAsync(id);
        if (!success) return NotFound();
        return NoContent();
    }

    // POST /api/readingexercises/5/evaluate
    [HttpPost("{id:int}/evaluate")]
    public async Task<IActionResult> Evaluate(int id, [FromBody] EvaluateReadingRequest request)
    {
        var result = await _readingService.EvaluateAsync(id, request);
        return Ok(result);
    }
}