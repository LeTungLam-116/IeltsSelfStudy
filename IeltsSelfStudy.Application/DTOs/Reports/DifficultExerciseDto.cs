namespace IeltsSelfStudy.Application.DTOs.Reports;

public class DifficultExerciseDto
{
    public int ExerciseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public int TotalAttempts { get; set; }
    public double AverageScore { get; set; }
}
