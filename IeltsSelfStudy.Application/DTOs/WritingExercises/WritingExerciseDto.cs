namespace IeltsSelfStudy.Application.DTOs.WritingExercises;

public class WritingExerciseDto
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string TaskType { get; set; } = string.Empty;

    public string? ChartType { get; set; }

    public string? EssayType { get; set; }

    public string Question { get; set; } = string.Empty;

    public string? Topic { get; set; }

    public string Level { get; set; } = string.Empty;

    public int MinWordCount { get; set; }

    public string? SampleAnswer { get; set; }

    /// <summary>
    /// URL hình ảnh cho Task 1 (Line Graph, Bar Chart, Pie Chart, Map, etc.)
    /// </summary>
    public string? ImageUrl { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }
}
