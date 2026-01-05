using IeltsSelfStudy.Application.DTOs.Attempts;
using IeltsSelfStudy.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace IeltsSelfStudy.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AttemptsController : ControllerBase
{
    private readonly IAttemptService _attemptService;

    public AttemptsController(IAttemptService attemptService)
    {
        _attemptService = attemptService;
    }

    // POST /api/attempts
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAttemptRequest request)
    {
        var created = await _attemptService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    // GET /api/attempts/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await _attemptService.GetByIdAsync(id);
        if (item is null) return NotFound();
        return Ok(item);
    }

    // GET /api/attempts/by-user/3
    [HttpGet("by-user/{userId:int}")]
    public async Task<IActionResult> GetByUser(int userId)
    {
        var list = await _attemptService.GetByUserAsync(userId);
        return Ok(list);
    }

    // GET /api/attempts/by-user-skill?userId=1&skill=Listening
    [HttpGet("by-user-skill")]
    public async Task<IActionResult> GetByUserAndSkill([FromQuery] int userId, [FromQuery] string skill)
    {
        var list = await _attemptService.GetByUserAndSkillAsync(userId, skill);
        return Ok(list);
    }

    // GET /api/attempts/by-exercise
    // /api/attempts/by-exercise?skill=Listening&exerciseId=5
    [HttpGet("by-exercise")]
    public async Task<IActionResult> GetByExercise([FromQuery] string skill, [FromQuery] int exerciseId)
    {
        var list = await _attemptService.GetByExerciseAsync(skill, exerciseId);
        return Ok(list);
    }

    // PUT /api/attempts/{id}
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateAttemptRequest request)
    {
        var updated = await _attemptService.UpdateAsync(id, request);
        if (updated is null) return NotFound();
        return Ok(updated);
    }

    // DELETE /api/attempts/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _attemptService.DeleteAsync(id);
        if (!success) return NotFound();
        return NoContent();
    }
}
