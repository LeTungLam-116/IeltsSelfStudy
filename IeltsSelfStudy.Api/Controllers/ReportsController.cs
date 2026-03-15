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

    // GET: api/reports/overview?startDate=...&endDate=...
    [HttpGet("overview")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetOverviewReport([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        try
        {
            var report = await _reportService.GetOverviewReportAsync(startDate, endDate);
            return Ok(report);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while generating the report." });
        }
    }

    // GET: api/reports/trends?metric=users&range=30d&startDate=...&endDate=...
    [HttpGet("trends")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetTrendsReport(
        [FromQuery] string metric, 
        [FromQuery] string range = "30d",
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
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

            var report = await _reportService.GetTrendsReportAsync(metric, range, startDate, endDate);
            return Ok(report);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while generating the trends report." });
        }
    }

    // GET: api/reports/export/revenue?startDate=...&endDate=...
    [HttpGet("export/revenue")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ExportRevenue([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        try
        {
            var bytes = await _reportService.ExportRevenueToCsvAsync(startDate, endDate);
            var fileName = $"RevenueReport_{DateTime.Now:yyyyMMdd}.csv";
            return File(bytes, "text/csv", fileName);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while exporting the report." });
        }
    }
}
