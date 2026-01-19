using IeltsSelfStudy.Application.DTOs.Reports;
using IeltsSelfStudy.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace IeltsSelfStudy.Application.Services;

public class ReportService : IReportService
{
    private readonly IUserService _userService;
    private readonly ICourseService _courseService;
    private readonly IAttemptService _attemptService;
    private readonly ILogger<ReportService> _logger;

    public ReportService(
        IUserService userService,
        ICourseService courseService,
        IAttemptService attemptService,
        ILogger<ReportService> logger)
    {
        _userService = userService;
        _courseService = courseService;
        _attemptService = attemptService;
        _logger = logger;
    }

    public async Task<OverviewReportDto> GetOverviewReportAsync()
    {
        _logger.LogInformation("Generating overview report");

        try
        {
            // Get all users
            var allUsers = await _userService.GetAllAsync();
            var totalUsers = allUsers.Count;
            var activeUsers = allUsers.Count(u => u.IsActive);

            // Calculate user growth (simplified - compare to last month)
            var currentMonthUsers = allUsers.Count(u => u.CreatedAt.Month == DateTime.UtcNow.Month && u.CreatedAt.Year == DateTime.UtcNow.Year);
            var lastMonthUsers = allUsers.Count(u => u.CreatedAt.Month == DateTime.UtcNow.AddMonths(-1).Month && u.CreatedAt.Year == DateTime.UtcNow.AddMonths(-1).Year);
            var userGrowthPercentage = lastMonthUsers > 0 ? (decimal)(currentMonthUsers - lastMonthUsers) / lastMonthUsers * 100 : 0;

            // Get all courses
            var allCourses = await _courseService.GetAllAsync();
            var totalCourses = allCourses.Count;
            var activeCourses = allCourses.Count(c => c.IsActive);

            // Get total exercises (sum from all courses)
            var totalExercises = allCourses.Sum(c => c.Exercises?.Count ?? 0);

            // For now, use placeholder values for attempts and other metrics
            // In a real implementation, we'd need to add methods to get all attempts
            var totalAttempts = 0; // TODO: Add method to get total attempts count

            // Placeholder values for now
            var averageSessionTimeMinutes = 45.0m; // TODO: Calculate from attempt data
            var courseCompletionRatePercentage = 68.5m; // TODO: Calculate from course progress data

            // Revenue calculation (simplified)
            var totalRevenue = allCourses.Sum(c => c.Price ?? 0);
            var monthlyRecurringRevenue = totalRevenue * 12 / 12; // Simplified MRR calculation
            var revenueGrowthPercentage = 0m; // TODO: Calculate growth over time

            var report = new OverviewReportDto
            {
                TotalUsers = totalUsers,
                ActiveUsers = activeUsers,
                UserGrowthPercentage = Math.Round(userGrowthPercentage, 2),
                NewUsersThisMonth = currentMonthUsers,

                TotalCourses = totalCourses,
                TotalExercises = totalExercises,
                TotalAttempts = totalAttempts,

                AverageSessionTimeMinutes = averageSessionTimeMinutes,
                CourseCompletionRatePercentage = courseCompletionRatePercentage,

                MonthlyRecurringRevenue = monthlyRecurringRevenue,
                RevenueGrowthPercentage = revenueGrowthPercentage
            };

            _logger.LogInformation("Overview report generated successfully. TotalUsers: {TotalUsers}, ActiveUsers: {ActiveUsers}, TotalCourses: {TotalCourses}",
                totalUsers, activeUsers, totalCourses);

            return report;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating overview report");
            throw;
        }
    }

    public async Task<TrendReportDto> GetTrendsReportAsync(string metric, string range)
    {
        _logger.LogInformation("Generating trends report for metric: {Metric}, range: {Range}", metric, range);

        try
        {
            var data = new List<TrendDataPointDto>();
            var now = DateTime.UtcNow;

            // Generate mock trend data for demonstration
            // In a real implementation, this would query historical data from the database
            for (int i = 29; i >= 0; i--)
            {
                var date = now.AddDays(-i);
                decimal value = 0;

                switch (metric.ToLower())
                {
                    case "users":
                        // Simulate user growth with some randomness
                        value = 1200 + (29 - i) * 3 + new Random().Next(-10, 10);
                        break;
                    case "revenue":
                        // Simulate revenue growth
                        value = 12000 + (29 - i) * 50 + new Random().Next(-100, 100);
                        break;
                    case "courses":
                        // Simulate course additions
                        value = 40 + (29 - i) / 7; // About 1 course per week
                        break;
                    case "attempts":
                        // Simulate attempt growth
                        value = 5000 + (29 - i) * 10 + new Random().Next(-50, 50);
                        break;
                    default:
                        value = 100 + (29 - i) * 2;
                        break;
                }

                data.Add(new TrendDataPointDto
                {
                    Date = date.ToString("yyyy-MM-dd"),
                    Value = Math.Max(0, value),
                    Label = $"{metric} on {date:MMM dd}"
                });
            }

            var report = new TrendReportDto
            {
                Metric = metric,
                Range = range,
                Data = data
            };

            _logger.LogInformation("Trends report generated successfully for {Metric}", metric);

            return report;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating trends report for metric: {Metric}", metric);
            throw;
        }
    }
}
