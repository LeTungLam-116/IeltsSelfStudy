using System.ComponentModel.DataAnnotations;

namespace IeltsSelfStudy.Application.DTOs.SpeakingExercises;

public class EvaluateSpeakingRequest
{
    [Required]
    public int UserId { get; set; }

    [Required]
    public string AnswerText { get; set; } = string.Empty;

    public double? TargetBand { get; set; }
}
