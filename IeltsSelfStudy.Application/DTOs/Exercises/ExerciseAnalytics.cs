namespace IeltsSelfStudy.Application.DTOs.Exercises;

public class ExerciseAnalytics
{
    public int ExerciseId { get; set; }
    public int TotalAttempts { get; set; }
    public double AverageScore { get; set; }
    public double PassRate { get; set; } // percentage
    public int AverageTimeSpent { get; set; } // seconds
    public DateTime LastAttemptAt { get; set; }
    public List<ScoreRange> PopularScoreRanges { get; set; } = new();

    public class ScoreRange
    {
        public string Range { get; set; } = string.Empty; // e.g. "0-2", "3-4", "5-6", "7-9"
        public int Count { get; set; }
    }
}
