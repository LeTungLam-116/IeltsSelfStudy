namespace IeltsSelfStudy.Application.DTOs.ReadingExercises;

public class ReadingExerciseDto
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string PassageText { get; set; } = string.Empty;

    public string Level { get; set; } = string.Empty;

    public int QuestionCount { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }
}
