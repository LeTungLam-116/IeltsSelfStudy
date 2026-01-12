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

    public QuestionsController(IQuestionService questionService)
    {
        _questionService = questionService;
    }

    // GET /api/questions
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PagedRequest? request)
    {
        // Nếu không có pagination params, trả về tất cả (backward compatible)
        if (request == null || (request.PageNumber == 1 && request.PageSize == 10))
        {
            var list = await _questionService.GetAllAsync();
            return Ok(list);
        }

        var pagedResult = await _questionService.GetPagedAsync(request);
        return Ok(pagedResult);
    }

    // GET /api/questions/exercise?skill=Listening&exerciseId=1
    [HttpGet("exercise")]
    public async Task<IActionResult> GetByExercise([FromQuery] string skill, [FromQuery] int exerciseId)
    {
        var list = await _questionService.GetByExerciseAsync(skill, exerciseId);
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