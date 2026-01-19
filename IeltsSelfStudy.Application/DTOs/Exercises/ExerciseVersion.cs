namespace IeltsSelfStudy.Application.DTOs.Exercises;

public class ExerciseVersion
{
    public int Id { get; set; }
    public int ExerciseId { get; set; }
    public int Version { get; set; }
    public string Data { get; set; } = string.Empty; // JSON string of the exercise data
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public string? ChangeNotes { get; set; }
}
