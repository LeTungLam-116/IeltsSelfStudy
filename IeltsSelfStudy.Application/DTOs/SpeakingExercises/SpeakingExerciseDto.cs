namespace IeltsSelfStudy.Application.DTOs.SpeakingExercises;

public class SpeakingExerciseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Part { get; set; } = string.Empty;
    public string Question { get; set; } = string.Empty;
    public string? Topic { get; set; }
    public string Level { get; set; } = string.Empty;
    public string? Tips { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
