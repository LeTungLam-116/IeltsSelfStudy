namespace IeltsSelfStudy.Domain.Entities;

public class SpeakingExercise
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    // Part1 / Part2 / Part3
    public string Part { get; set; } = "Part1";

    // Câu hỏi / cue card
    public string Question { get; set; } = string.Empty;

    public string? Topic { get; set; }

    public string Level { get; set; } = "Beginner";

    public string? Tips { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
