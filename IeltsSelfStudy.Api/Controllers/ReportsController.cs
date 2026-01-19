using IeltsSelfStudy.Application.DTOs.Reports;
using IeltsSelfStudy.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IeltsSelfStudy.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    // GET: api/reports/overview
    [HttpGet("overview")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetOverviewReport()
    {
        try
        {
            var report = await _reportService.GetOverviewReportAsync();
            return Ok(report);
        }
        catch (Exception ex)
        {
            // Log error here if needed
            return StatusCode(500, new { message = "An error occurred while generating the report." });
        }
    }

    // GET: api/reports/trends?metric=users&range=30d
    [HttpGet("trends")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetTrendsReport([FromQuery] string metric, [FromQuery] string range = "30d")
    {
        try
        {
            if (string.IsNullOrWhiteSpace(metric))
            {
                return BadRequest(new { message = "Metric parameter is required." });
            }

            var validMetrics = new[] { "users", "courses", "attempts", "revenue" };
            if (!validMetrics.Contains(metric.ToLower()))
            {
                return BadRequest(new { message = $"Invalid metric. Valid options: {string.Join(", ", validMetrics)}" });
            }

            var report = await _reportService.GetTrendsReportAsync(metric, range);
            return Ok(report);
        }
        catch (Exception ex)
        {
            // Log error here if needed
            return StatusCode(500, new { message = "An error occurred while generating the trends report." });
        }
    }
}
