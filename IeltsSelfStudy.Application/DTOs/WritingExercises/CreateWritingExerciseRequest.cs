using System.ComponentModel.DataAnnotations;

namespace IeltsSelfStudy.Application.DTOs.WritingExercises;

public class CreateWritingExerciseRequest
{
    [Required, MaxLength(255)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    [Required, MaxLength(20)]
    public string TaskType { get; set; } = "Task2";

    [Required]
    public string Question { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? Topic { get; set; }

    [Required, MaxLength(50)]
    public string Level { get; set; } = "Beginner";

    [Range(0, int.MaxValue)]
    public int MinWordCount { get; set; } = 250;

    public string? SampleAnswer { get; set; }
}
