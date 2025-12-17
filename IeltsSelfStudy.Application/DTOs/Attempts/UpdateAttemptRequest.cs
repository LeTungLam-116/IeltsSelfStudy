using System.ComponentModel.DataAnnotations;

namespace IeltsSelfStudy.Application.DTOs.Attempts;

public class UpdateAttemptRequest
{
    [Required]
    public double? Score { get; set; }

    public double? MaxScore { get; set; }

    public string? UserAnswerJson { get; set; }

    public string? AiFeedback { get; set; }

    public bool IsActive { get; set; } = true;
}

