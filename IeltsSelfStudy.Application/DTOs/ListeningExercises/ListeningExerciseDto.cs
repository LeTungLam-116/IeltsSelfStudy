namespace IeltsSelfStudy.Application.DTOs.ListeningExercises;

public class ListeningExerciseDto
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string AudioUrl { get; set; } = string.Empty;

    public string? Transcript { get; set; }

    public string Level { get; set; } = string.Empty;

    public int QuestionCount { get; set; }

    public int? DurationSeconds { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }
}
