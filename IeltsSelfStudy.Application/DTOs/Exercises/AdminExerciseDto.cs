namespace IeltsSelfStudy.Application.DTOs.Exercises;

public class AdminExerciseDto
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty; // "Listening", "Reading", "Writing", "Speaking"
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Level { get; set; } = "Beginner";
    public int QuestionCount { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }

    // Version tracking (for admin)
    public int Version { get; set; } = 1;
    public DateTime LastModifiedAt { get; set; }
    public string LastModifiedBy { get; set; } = "system";

    // Analytics (optional)
    public int TotalAttempts { get; set; } = 0;
    public double? AverageScore { get; set; }
    public double? PassRate { get; set; }

    // Type-specific fields (nullable)
    public string? AudioUrl { get; set; }
    public string? Transcript { get; set; }
    public int? DurationSeconds { get; set; }
    public string? PassageText { get; set; }
    public string? TaskType { get; set; }
    public string? Topic { get; set; }
    public int? MinWordCount { get; set; }
    public string? SampleAnswer { get; set; }
    public string? Part { get; set; }
    public string? Question { get; set; }
    public string? Tips { get; set; }
    public string? ChartType { get; set; } // Writing Task 1
    public string? EssayType { get; set; } // Writing Task 2
    public string? ImageUrl { get; set; } // Writing Task 1
    public string? CueCardJson { get; set; } // Speaking Part 2
}
