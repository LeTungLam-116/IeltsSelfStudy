namespace IeltsSelfStudy.Domain.Entities;

public class ReadingExercise
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string PassageText { get; set; } = string.Empty;

    public string Level { get; set; } = "Beginner";

    public int QuestionCount { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
