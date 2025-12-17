using System.ComponentModel.DataAnnotations;

namespace IeltsSelfStudy.Application.DTOs.Attempts;

public class CreateAttemptRequest
{
    [Required]
    public int UserId { get; set; }

    [Required, MaxLength(50)]
    public string Skill { get; set; } = string.Empty; // "Listening", "Reading", ...

    [Required]
    public int ExerciseId { get; set; }

    public double? Score { get; set; }

    public double? MaxScore { get; set; }

    public string? UserAnswerJson { get; set; }

    public string? AiFeedback { get; set; }
}
