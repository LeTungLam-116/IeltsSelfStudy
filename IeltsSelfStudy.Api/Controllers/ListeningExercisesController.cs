using IeltsSelfStudy.Application.DTOs.ListeningExercises;
using IeltsSelfStudy.Application.DTOs.Common;
using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Api.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IeltsSelfStudy.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ListeningExercisesController : ControllerBase
{
    private readonly IListeningExerciseService _listeningService;

    public ListeningExercisesController(IListeningExerciseService listeningService)
    {
        _listeningService = listeningService;
    }

    // GET /api/listeningexercises
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PagedRequest? request)
    {
        // Nếu không có pagination params, trả về tất cả (backward compatible)
        if (request == null || (request.PageNumber == 1 && request.PageSize == 10))
        {
            var list = await _listeningService.GetAllAsync();
            return Ok(list);
        }

        var pagedResult = await _listeningService.GetPagedAsync(request);
        return Ok(pagedResult);
    }

    // GET /api/listeningexercises/5
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await _listeningService.GetByIdAsync(id);
        if (item is null) return NotFound();
        return Ok(item);
    }

    // POST /api/listeningexercises
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateListeningExerciseRequest request)
    {
        var created = await _listeningService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    // PUT /api/listeningexercises/5
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateListeningExerciseRequest request)
    {
        var updated = await _listeningService.UpdateAsync(id, request);
        if (updated is null) return NotFound();
        return Ok(updated);
    }

    // DELETE /api/listeningexercises/5
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _listeningService.DeleteAsync(id);
        if (!success) return NotFound();
        return NoContent();
    }

    // POST /api/listeningexercises/5/evaluate
    [HttpPost("{id:int}/evaluate")]
    [Authorize]
    public async Task<IActionResult> Evaluate(int id, [FromBody] EvaluateListeningRequest request)
    {
        // Lấy userId từ token thay vì từ body
        var userId = User.GetUserId();
        request.UserId = userId;
        var result = await _listeningService.EvaluateAsync(id, request);
        return Ok(result);
    }
}
