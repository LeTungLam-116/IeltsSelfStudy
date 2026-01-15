namespace IeltsSelfStudy.Domain.Entities;

public class Exercise
{
    public int Id { get; set; }

    // TPH Discriminator
    public string Type { get; set; } = string.Empty; // "Listening", "Reading", "Writing", "Speaking"

    // Common fields for all exercise types
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Level { get; set; } = "Beginner";
    public int QuestionCount { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Listening-specific fields (nullable)
    public string? AudioUrl { get; set; }
    public string? Transcript { get; set; }
    public int? DurationSeconds { get; set; }

    // Reading-specific fields (nullable)
    public string? PassageText { get; set; }

    // Writing-specific fields (nullable)
    public string? TaskType { get; set; }
    public string? Topic { get; set; }
    public int? MinWordCount { get; set; }
    public string? SampleAnswer { get; set; }

    // Speaking-specific fields (nullable)
    public string? Part { get; set; }
    public string? Question { get; set; }
    public string? Tips { get; set; }
}
