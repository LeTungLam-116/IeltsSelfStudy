using System.ComponentModel.DataAnnotations;

namespace IeltsSelfStudy.Application.DTOs.WritingExercises;

public class UpdateWritingExerciseRequest
{
    [Required, MaxLength(255)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    [Required, MaxLength(20)]
    public string TaskType { get; set; } = "Task2";

    [MaxLength(50)]
    public string? ChartType { get; set; }

    [MaxLength(50)]
    public string? EssayType { get; set; }

    [Required]
    public string Question { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? Topic { get; set; }

    [Required, MaxLength(50)]
    public string Level { get; set; } = "Beginner";

    [Range(0, int.MaxValue)]
    public int MinWordCount { get; set; } = 250;

    public string? SampleAnswer { get; set; }

    /// <summary>
    /// URL hình ảnh cho Task 1 (Line Graph, Bar Chart, Pie Chart, Map, etc.)
    /// </summary>
    [MaxLength(500)]
    public string? ImageUrl { get; set; }

    public bool IsActive { get; set; } = true;
}
