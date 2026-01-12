using IeltsSelfStudy.Application.DTOs.Users;
using IeltsSelfStudy.Application.DTOs.Common;
using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Api.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IeltsSelfStudy.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    // READ: GET all
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll([FromQuery] PagedRequest? request)
    {
        // Nếu không có pagination params, trả về tất cả (backward compatible)
        if (request == null || (request.PageNumber == 1 && request.PageSize == 10))
        {
            var users = await _userService.GetAllAsync();
            return Ok(users);
        }

        var pagedResult = await _userService.GetPagedAsync(request);
        return Ok(pagedResult);
    }

    // READ: GET by id
    [HttpGet("{id:int}")]
    [Authorize]
    public async Task<IActionResult> GetById(int id)
    {
        var userId = User.GetUserId();
        
        // Chỉ user đó hoặc Admin mới xem được
        if (id != userId && !User.IsInRole("Admin"))
            return Forbid();
            
        var user = await _userService.GetByIdAsync(id);
        if (user is null) return NotFound();
        return Ok(user);
    }

    // CREATE
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
    {
        var created = await _userService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);  
    }

    // UPDATE
    [HttpPut("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateUserRequest request)
    {
        var userId = User.GetUserId();
        
        // Chỉ user đó hoặc Admin mới update được
        if (id != userId && !User.IsInRole("Admin"))
            return Forbid();
        
        var updated = await _userService.UpdateAsync(id, request);
        if (updated is null) return NotFound();
        return Ok(updated);
    }

    // DELETE
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _userService.DeleteAsync(id);
        if (!success) return NotFound();
        return NoContent();
    }
}
