using IeltsSelfStudy.Application.DTOs.Common;
using IeltsSelfStudy.Application.DTOs.Reports;
using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text;

namespace IeltsSelfStudy.Application.Services;

public class ReportService : IReportService
{
    private readonly IGenericRepository<Transaction> _transactionRepo;
    private readonly IGenericRepository<Attempt> _attemptRepo;
    private readonly IGenericRepository<User> _userRepo;
    private readonly IGenericRepository<Course> _courseRepo;
    private readonly IGenericRepository<CourseExercise> _courseExerciseRepo;
    private readonly IGenericRepository<UserCourse> _userCourseRepo;
    private readonly ILogger<ReportService> _logger;

    public ReportService(
        IGenericRepository<User> userRepo,
        IGenericRepository<Course> courseRepo,
        IGenericRepository<CourseExercise> courseExerciseRepo,
        IGenericRepository<UserCourse> userCourseRepo,
        IGenericRepository<Transaction> transactionRepo,
        IGenericRepository<Attempt> attemptRepo,
        ILogger<ReportService> logger)
    {
        _userRepo = userRepo;
        _courseRepo = courseRepo;
        _courseExerciseRepo = courseExerciseRepo;
        _userCourseRepo = userCourseRepo;
        _transactionRepo = transactionRepo;
        _attemptRepo = attemptRepo;
        _logger = logger;
    }

    public async Task<OverviewReportDto> GetOverviewReportAsync(DateTime? startDate = null, DateTime? endDate = null)
    {
        _logger.LogInformation("Generating overview report from {Start} to {End}", startDate, endDate);

        try
        {
            var now = DateTime.UtcNow;
            var start = startDate.HasValue
                ? startDate.Value.Date                              // Start = đầu ngày (00:00:00)
                : new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

            // Fix: endDate từ frontend chỉ có phần ngày (2026-03-03T00:00:00)
            // Nếu dùng đó thẳng, thì giao dịch lúc 20:29 trong ngày đó sẽ bị loại
            // Phải đẩy end về cuối ngày (23:59:59.9999999)
            var end = endDate.HasValue
                ? endDate.Value.Date.AddDays(1).AddTicks(-1)        // End = cuối ngày (23:59:59.9999999)
                : now;

            // --- Users Stats ---
            var totalUsers = await _userRepo.GetAll().CountAsync();
            var activeUsers = await _userRepo.GetAll().CountAsync(u => u.IsActive);

            // User Growth (Compare current period vs previous same-length period)
            var duration = end - start;
            var prevStart = start.Subtract(duration);
            var prevEnd = start.AddSeconds(-1);

            var currentUsers = await _userRepo.GetAll().CountAsync(u => u.CreatedAt >= start && u.CreatedAt <= end);
            var prevUsers = await _userRepo.GetAll().CountAsync(u => u.CreatedAt >= prevStart && u.CreatedAt <= prevEnd);

            var userGrowthPercentage = prevUsers > 0
                ? (decimal)(currentUsers - prevUsers) / prevUsers * 100
                : (currentUsers > 0 ? 100m : 0m);

            // --- Courses Stats ---
            var totalCourses = await _courseRepo.GetAll().CountAsync();
            var totalExercises = await _courseExerciseRepo.GetAll().CountAsync();

            // --- Attempts Stats ---
            var totalAttempts = await _attemptRepo.GetAll().CountAsync(a => a.CreatedAt >= start && a.CreatedAt <= end);

            var completedTimes = await _attemptRepo.GetAll()
                .Where(a => a.UpdatedAt != null && a.CreatedAt >= start && a.CreatedAt <= end)
                .Select(a => new { a.CreatedAt, a.UpdatedAt })
                .ToListAsync();

            var validDurations = completedTimes
                .Select(a => (a.UpdatedAt!.Value - a.CreatedAt).TotalMinutes)
                .Where(m => m > 0.5 && m < 180)
                .ToList();

            var averageSessionTimeMinutes = validDurations.Any()
                ? (decimal)validDurations.Average()
                : 0m;

            // Real Course Completion Rate
            var activeCourseEnrollments = await _userCourseRepo.GetAll()
                .Select(uc => new { uc.Status, uc.ProgressPercentage })
                .ToListAsync();

            var courseCompletionRatePercentage = activeCourseEnrollments.Any()
                ? (decimal)activeCourseEnrollments.Count(uc => uc.Status == "Completed" || (uc.ProgressPercentage >= 100)) / activeCourseEnrollments.Count * 100
                : 0m;

            // --- Revenue Stats ---
            var currentRevenue = await _transactionRepo.GetAll()
                .Where(t => t.Status == "Success" && t.CreatedAt >= start && t.CreatedAt <= end)
                .SumAsync(t => t.Amount);

            var prevRevenue = await _transactionRepo.GetAll()
                .Where(t => t.Status == "Success" && t.CreatedAt >= prevStart && t.CreatedAt <= prevEnd)
                .SumAsync(t => t.Amount);

            var revenueGrowthPercentage = prevRevenue > 0
                ? (decimal)(currentRevenue - prevRevenue) / prevRevenue * 100
                : (currentRevenue > 0 ? 100m : 0m);

            // --- Recent Transactions ---
            var (recentItems, _) = await _transactionRepo.GetPagedAsync(
                new PagedRequest { PageNumber = 1, PageSize = 5 },
                filter: q => q.Include(t => t.User).Include(t => t.Course),
                orderBy: q => q.OrderByDescending(t => t.CreatedAt)
            );

            var recentTransactions = recentItems.Select(t => new RecentTransactionDto
            {
                Id = t.Id,
                TransactionRef = t.TransactionRef,
                UserName = t.User?.FullName ?? "Unknown",
                CourseName = t.Course?.Name ?? "Unknown",
                Amount = t.Amount,
                Status = t.Status,
                CreatedAt = t.CreatedAt,
                PaymentMethod = t.PaymentMethod
            }).ToList();

            // --- Top Students ---
            var topStudents = await _attemptRepo.GetAll()
                .Include(a => a.User)
                .Where(a => a.Score.HasValue && a.CreatedAt >= start && a.CreatedAt <= end)
                .GroupBy(a => new { a.UserId, a.User.FullName })
                .Select(g => new TopStudentDto
                {
                    UserId = g.Key.UserId,
                    FullName = g.Key.FullName,
                    CompletedAttempts = g.Count(),
                    AverageScore = g.Average(a => a.Score!.Value)
                })
                .OrderByDescending(s => s.AverageScore)
                .Take(5)
                .ToListAsync();

            // --- Difficult Exercises ---
            var difficultExercises = await _attemptRepo.GetAll()
                .Include(a => a.Exercise)
                .Where(a => a.Score.HasValue && a.CreatedAt >= start && a.CreatedAt <= end)
                .GroupBy(a => new { a.ExerciseId, a.Exercise.Title, a.Exercise.Type })
                .Select(g => new DifficultExerciseDto
                {
                    ExerciseId = g.Key.ExerciseId,
                    Title = g.Key.Title,
                    Type = g.Key.Type,
                    TotalAttempts = g.Count(),
                    AverageScore = g.Average(a => a.Score!.Value)
                })
                .OrderBy(e => e.AverageScore)
                .Take(5)
                .ToListAsync();

            // --- Average Scores By Skill ---
            var avgScoresData = await _attemptRepo.GetAll()
                .Include(a => a.Exercise)
                .Where(a => a.Exercise != null && a.Score.HasValue)
                .GroupBy(a => a.Exercise.Type)
                .Select(g => new { Skill = g.Key, AvgScore = g.Average(a => a.Score!.Value) })
                .ToListAsync();

            var avgScores = avgScoresData.ToDictionary(
                x => x.Skill,
                x => Math.Round(x.AvgScore, 1)
            );

            return new OverviewReportDto
            {
                TotalUsers = totalUsers,
                ActiveUsers = activeUsers,
                UserGrowthPercentage = Math.Round(userGrowthPercentage, 2),
                NewUsersThisMonth = currentUsers,
                TotalCourses = totalCourses,
                TotalExercises = totalExercises,
                TotalAttempts = totalAttempts,
                AverageSessionTimeMinutes = Math.Round(averageSessionTimeMinutes, 1),
                CourseCompletionRatePercentage = Math.Round(courseCompletionRatePercentage, 1),
                MonthlyRecurringRevenue = currentRevenue,
                RevenueGrowthPercentage = Math.Round(revenueGrowthPercentage, 2),
                RecentTransactions = recentTransactions,
                AverageScoresBySkill = avgScores,
                TopStudents = topStudents,
                DifficultExercises = difficultExercises
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating overview report");
            throw;
        }
    }

    public async Task<TrendReportDto> GetTrendsReportAsync(string metric, string range, DateTime? startDate = null, DateTime? endDate = null)
    {
        _logger.LogInformation("Generating trends report for metric: {Metric}", metric);

        try
        {
            var end = endDate.HasValue
                ? endDate.Value.Date.AddDays(1).AddTicks(-1)        // Cuối ngày (23:59:59.9999999)
                : DateTime.UtcNow.Date.AddDays(1).AddTicks(-1);
            var start = startDate.HasValue
                ? startDate.Value.Date
                : end.Date.AddDays(-29);

            var data = new List<TrendDataPointDto>();  // Khai báo list kết quả
            Dictionary<DateTime, decimal> dailyData = new();

            switch (metric.ToLower())
            {
                case "users":
                    var userDates = await _userRepo.GetAll()
                        .Where(u => u.CreatedAt <= end)
                        .Select(u => u.CreatedAt.Date)
                        .ToListAsync();

                    for (var dt = start; dt <= end; dt = dt.AddDays(1))
                    {
                        dailyData[dt] = userDates.Count(d => d <= dt);
                    }
                    break;

                case "revenue":
                    var revenueData = await _transactionRepo.GetAll()
                        .Where(t => t.Status == "Success" && t.CreatedAt >= start && t.CreatedAt <= end)
                        .Select(t => new { t.CreatedAt, t.Amount })
                        .ToListAsync();

                    dailyData = revenueData
                        .GroupBy(t => t.CreatedAt.Date)
                        .ToDictionary(g => g.Key, g => g.Sum(t => t.Amount));
                    break;

                case "attempts":
                    var attemptDates = await _attemptRepo.GetAll()
                        .Where(a => a.CreatedAt >= start && a.CreatedAt <= end)
                        .Select(a => a.CreatedAt.Date)
                        .ToListAsync();

                    dailyData = attemptDates
                        .GroupBy(d => d)
                        .ToDictionary(g => g.Key, g => (decimal)g.Count());
                    break;
            }

            for (var dt = start; dt <= end; dt = dt.AddDays(1))
            {
                data.Add(new TrendDataPointDto
                {
                    Date = dt.ToString("yyyy-MM-dd"),
                    Value = dailyData.ContainsKey(dt) ? dailyData[dt] : 0,
                    Label = $"{metric} on {dt:MMM dd}"
                });
            }

            return new TrendReportDto { Metric = metric, Range = range, Data = data };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating trends report");
            throw;
        }
    }

    public async Task<byte[]> ExportRevenueToCsvAsync(DateTime? startDate = null, DateTime? endDate = null)
    {
        var start = startDate ?? DateTime.UtcNow.AddMonths(-1);
        var end = endDate ?? DateTime.UtcNow;

        var transactions = await _transactionRepo.GetAll()
            .Include(t => t.User)
            .Include(t => t.Course)
            .Where(t => t.Status == "Success" && t.CreatedAt >= start && t.CreatedAt <= end)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        var csv = new StringBuilder();
        csv.AppendLine("TransactionRef,Date,User,Course,Amount,PaymentMethod");

        foreach (var t in transactions)
        {
            csv.AppendLine($"{t.TransactionRef},{t.CreatedAt:yyyy-MM-dd HH:mm:ss},\"{t.User?.FullName}\",\"{t.Course?.Name}\",{t.Amount},{t.PaymentMethod}");
        }

        return Encoding.UTF8.GetBytes(csv.ToString());
    }
}
