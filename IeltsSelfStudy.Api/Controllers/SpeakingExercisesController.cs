using IeltsSelfStudy.Application.DTOs.SpeakingExercises;
using IeltsSelfStudy.Application.DTOs.Common;
using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Api.Extensions;
using Microsoft.AspNetCore.Authorization;
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
    public async Task<IActionResult> GetAll([FromQuery] PagedRequest? request)
    {
        // Nếu không có pagination params, trả về tất cả (backward compatible)
        if (request == null || (request.PageNumber == 1 && request.PageSize == 10))
        {
            var list = await _speakingService.GetAllAsync();
            return Ok(list);
        }

        var pagedResult = await _speakingService.GetPagedAsync(request);
        return Ok(pagedResult);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await _speakingService.GetByIdAsync(id);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateSpeakingExerciseRequest request)
    {
        var created = await _speakingService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateSpeakingExerciseRequest request)
    {
        var updated = await _speakingService.UpdateAsync(id, request);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var ok = await _speakingService.DeleteAsync(id);
        return ok ? NoContent() : NotFound();
    }

    // ✅ Evaluate endpoint
    [HttpPost("{id:int}/evaluate")]
    [Authorize]
    public async Task<IActionResult> Evaluate(int id, [FromBody] EvaluateSpeakingRequest request)
    {
        // Lấy userId từ token thay vì từ body
        var userId = User.GetUserId();
        request.UserId = userId;
        var result = await _speakingService.EvaluateAsync(id, request);
        return Ok(result);
    }
}
