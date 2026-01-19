namespace IeltsSelfStudy.Application.DTOs.Exercises;

public class ExercisePreview
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Level { get; set; } = "Beginner";
    public int QuestionCount { get; set; }
    public int EstimatedDuration { get; set; } // seconds
    public object? PreviewData { get; set; } // JSON data for preview
    public bool HasAudio { get; set; }
    public bool HasText { get; set; }
    public bool HasQuestions { get; set; }
}
