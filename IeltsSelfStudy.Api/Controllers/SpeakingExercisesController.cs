using IeltsSelfStudy.Application.DTOs.SpeakingExercises;
using IeltsSelfStudy.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace IeltsSelfStudy.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SpeakingExercisesController : ControllerBase
{
    private readonly ISpeakingExerciseService _speakingService;

    public SpeakingExercisesController(ISpeakingExerciseService speakingService)
    {
        _speakingService = speakingService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
        => Ok(await _speakingService.GetAllAsync());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await _speakingService.GetByIdAsync(id);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSpeakingExerciseRequest request)
    {
        var created = await _speakingService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateSpeakingExerciseRequest request)
    {
        var updated = await _speakingService.UpdateAsync(id, request);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var ok = await _speakingService.DeleteAsync(id);
        return ok ? NoContent() : NotFound();
    }

    // ✅ Evaluate endpoint
    [HttpPost("{id:int}/evaluate")]
    public async Task<IActionResult> Evaluate(int id, [FromBody] EvaluateSpeakingRequest request)
    {
        try
        {
            var result = await _speakingService.EvaluateAsync(id, request);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
