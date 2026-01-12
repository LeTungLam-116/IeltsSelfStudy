using IeltsSelfStudy.Application.DTOs.Courses;
using IeltsSelfStudy.Application.DTOs.Common;
using IeltsSelfStudy.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IeltsSelfStudy.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CoursesController : ControllerBase
{
    private readonly ICourseService _courseService;

    public CoursesController(ICourseService courseService)
    {
        _courseService = courseService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PagedRequest? request)
    {
        // Nếu không có pagination params, trả về tất cả (backward compatible)
        if (request == null || (request.PageNumber == 1 && request.PageSize == 10))
        {
            var courses = await _courseService.GetAllAsync();
            return Ok(courses);
        }

        var pagedResult = await _courseService.GetPagedAsync(request);
        return Ok(pagedResult);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var course = await _courseService.GetByIdAsync(id);
        if (course is null) return NotFound();
        return Ok(course);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateCourseRequest request)
    {
        var created = await _courseService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateCourseRequest request)
    {
        var updated = await _courseService.UpdateAsync(id, request);
        if (updated is null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _courseService.DeleteAsync(id);
        if (!success) return NotFound();
        return NoContent();
    }

    // Thêm Exercise vào Course
    [HttpPost("{courseId:int}/exercises")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AddExercise(int courseId, [FromBody] AddExerciseToCourseRequest request)
    {
        var result = await _courseService.AddExerciseToCourseAsync(courseId, request);
        return Ok(result);
    }

    // Lấy danh sách Exercises của Course
    [HttpGet("{courseId:int}/exercises")]
    public async Task<IActionResult> GetExercises(int courseId)
    {
        var exercises = await _courseService.GetCourseExercisesAsync(courseId);
        return Ok(exercises);
    }

    // Xóa Exercise khỏi Course
    [HttpDelete("{courseId:int}/exercises/{courseExerciseId:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RemoveExercise(int courseId, int courseExerciseId)
    {
        var success = await _courseService.RemoveExerciseFromCourseAsync(courseId, courseExerciseId);
        if (!success) return NotFound();
        return NoContent();
    }

    // Cập nhật thứ tự Exercise
    [HttpPut("{courseId:int}/exercises/{courseExerciseId:int}/order")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateExerciseOrder(
        int courseId, 
        int courseExerciseId, 
        [FromBody] int newOrder)
    {
        var success = await _courseService.UpdateExerciseOrderAsync(courseId, courseExerciseId, newOrder);
        if (!success) return NotFound();
        return Ok(new { message = "Order updated successfully." });
    }
}