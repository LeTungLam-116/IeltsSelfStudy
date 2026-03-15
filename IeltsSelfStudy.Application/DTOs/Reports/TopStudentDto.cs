namespace IeltsSelfStudy.Application.DTOs.Reports;

public class TopStudentDto
{
    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public int CompletedAttempts { get; set; }
    public double AverageScore { get; set; }
}
