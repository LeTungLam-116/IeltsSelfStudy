using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IeltsSelfStudy.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class SettingsController : ControllerBase
{
    private readonly ISettingService _settingService;

    public SettingsController(ISettingService settingService)
    {
        _settingService = settingService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var settings = await _settingService.GetAllSettingsAsync();
        return Ok(settings);
    }
    
    [HttpGet("{key}")]
    public async Task<IActionResult> GetByKey(string key)
    {
        var value = await _settingService.GetAsync(key);
        return Ok(new { Key = key, Value = value });
    }

    [HttpPut]
    public async Task<IActionResult> UpdateSettings([FromBody] List<SystemSetting> settings)
    {
        if (settings == null || !settings.Any()) return BadRequest("No settings to update");

        await _settingService.UpdateSettingsAsync(settings);
        return Ok(new { message = "Settings updated successfully" });
    }
}
