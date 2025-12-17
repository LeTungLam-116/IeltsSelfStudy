using System.ComponentModel.DataAnnotations;

namespace IeltsSelfStudy.Application.DTOs.ListeningExercises;

public class UpdateListeningExerciseRequest
{
    [Required, MaxLength(255)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    [Required, MaxLength(500)]
    public string AudioUrl { get; set; } = string.Empty;

    public string? Transcript { get; set; }

    [Required, MaxLength(50)]
    public string Level { get; set; } = "Beginner";

    [Range(0, int.MaxValue)]
    public int QuestionCount { get; set; } = 0;

    [Range(0, int.MaxValue)]
    public int? DurationSeconds { get; set; }

    public bool IsActive { get; set; } = true;
}
