namespace IeltsSelfStudy.Domain.Entities;

public class ListeningExercise
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string AudioUrl { get; set; } = string.Empty;

    public string? Transcript { get; set; }

    public string Level { get; set; } = "Beginner";

    public int QuestionCount { get; set; }

    public int? DurationSeconds { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
