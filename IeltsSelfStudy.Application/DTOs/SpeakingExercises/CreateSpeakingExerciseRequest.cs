using System.ComponentModel.DataAnnotations;

namespace IeltsSelfStudy.Application.DTOs.SpeakingExercises;

public class CreateSpeakingExerciseRequest
{
    [Required, MaxLength(255)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    [Required, MaxLength(10)]
    public string Part { get; set; } = "Part1";

    [Required]
    public string Question { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? Topic { get; set; }

    [Required, MaxLength(50)]
    public string Level { get; set; } = "Beginner";

    public string? Tips { get; set; }
}
