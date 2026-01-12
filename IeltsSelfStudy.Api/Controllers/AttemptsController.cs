using IeltsSelfStudy.Application.DTOs.Attempts;
using IeltsSelfStudy.Application.DTOs.Common;
using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Api.Extensions;
using Microsoft.AspNetCore.Authorization;
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
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateAttemptRequest request)
    {
        // Lấy userId từ token thay vì từ body
        var userId = User.GetUserId();
        request.UserId = userId; // Gán userId từ token vào request

        var created = await _attemptService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    // GET /api/attempts/{id}
    [HttpGet("{id:int}")]
    [Authorize]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await _attemptService.GetByIdAsync(id);
        if (item is null) return NotFound();

        // Kiểm tra: chỉ user sở hữu attempt mới xem được
        var userId = User.GetUserId();
        if (item.UserId != userId && !User.IsInRole("Admin"))
            return Forbid();
        return Ok(item);
    }

    // GET /api/attempts/by-user
    [HttpGet("by-user")]
    [Authorize]
    public async Task<IActionResult> GetByUserPaged([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        var userId = User.GetUserId();
        var request = new PagedRequest { PageNumber = pageNumber, PageSize = pageSize };
        var result = await _attemptService.GetByUserPagedAsync(userId, request);
        return Ok(result);
    }

    // GET /api/attempts/skill=Listening
    [HttpGet("by-user-skill")]
    [Authorize]
    public async Task<IActionResult> GetByUserAndSkillPaged([FromQuery] string skill, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        var userId = User.GetUserId();
        var request = new PagedRequest { PageNumber = pageNumber, PageSize = pageSize };
        var result = await _attemptService.GetByUserAndSkillPagedAsync(userId, skill, request);
        return Ok(result);
    }

    // GET /api/attempts/by-exercise
    // /api/attempts/by-exercise?skill=Listening&exerciseId=5
    [HttpGet("by-exercise")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetByExercisePaged([FromQuery] string skill, [FromQuery] int exerciseId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        var request = new PagedRequest { PageNumber = pageNumber, PageSize = pageSize };
        var result = await _attemptService.GetByExercisePagedAsync(skill, exerciseId, request);
        return Ok(result);
    }

    // PUT /api/attempts/{id}
    [HttpPut("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateAttemptRequest request)
    {
        // Kiểm tra quyền: chỉ user sở hữu hoặc Admin mới update được
        var existing = await _attemptService.GetByIdAsync(id);
        if (existing is null) return NotFound();
        
        var userId = User.GetUserId();
        if (existing.UserId != userId && !User.IsInRole("Admin"))
            return Forbid();
        
        var updated = await _attemptService.UpdateAsync(id, request);
        if (updated is null) return NotFound();
        return Ok(updated);
    }

    // DELETE /api/attempts/{id}
    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        // Kiểm tra quyền: chỉ user sở hữu hoặc Admin mới xóa được
        var existing = await _attemptService.GetByIdAsync(id);
        if (existing is null) return NotFound();
        
        var userId = User.GetUserId();
        if (existing.UserId != userId && !User.IsInRole("Admin"))
            return Forbid();
        
        var success = await _attemptService.DeleteAsync(id);
        if (!success) return NotFound();
        return NoContent();
    }
}
