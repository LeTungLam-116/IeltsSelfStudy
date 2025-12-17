using System.ComponentModel.DataAnnotations;

namespace IeltsSelfStudy.Application.DTOs.ReadingExercises;

public class CreateReadingExerciseRequest
{
    [Required, MaxLength(255)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    [Required]
    public string PassageText { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string Level { get; set; } = "Beginner";

    [Range(0, int.MaxValue)]
    public int QuestionCount { get; set; } = 0;
}
