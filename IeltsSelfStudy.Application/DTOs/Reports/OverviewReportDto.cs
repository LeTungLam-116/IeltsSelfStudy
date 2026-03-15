namespace IeltsSelfStudy.Application.DTOs.Reports;

public class OverviewReportDto
{
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public decimal UserGrowthPercentage { get; set; }
    public int NewUsersThisMonth { get; set; }

    public int TotalCourses { get; set; }
    public int TotalExercises { get; set; }
    public int TotalAttempts { get; set; }

    public decimal AverageSessionTimeMinutes { get; set; }
    public decimal CourseCompletionRatePercentage { get; set; }

    public decimal MonthlyRecurringRevenue { get; set; }
    public decimal RevenueGrowthPercentage { get; set; }



    public List<RecentTransactionDto> RecentTransactions { get; set; } = new();
    public Dictionary<string, double> AverageScoresBySkill { get; set; } = new();
    public List<TopStudentDto> TopStudents { get; set; } = new();
    public List<DifficultExerciseDto> DifficultExercises { get; set; } = new();
}
