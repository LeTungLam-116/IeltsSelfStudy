using IeltsSelfStudy.Application.DTOs.ListeningExercises;
using IeltsSelfStudy.Application.Interfaces;
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
    public async Task<IActionResult> GetAll()
    {
        var list = await _listeningService.GetAllAsync();
        return Ok(list);
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
    public async Task<IActionResult> Create([FromBody] CreateListeningExerciseRequest request)
    {
        var created = await _listeningService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    // PUT /api/listeningexercises/5
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateListeningExerciseRequest request)
    {
        var updated = await _listeningService.UpdateAsync(id, request);
        if (updated is null) return NotFound();
        return Ok(updated);
    }

    // DELETE /api/listeningexercises/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _listeningService.DeleteAsync(id);
        if (!success) return NotFound();
        return NoContent();
    }
}
