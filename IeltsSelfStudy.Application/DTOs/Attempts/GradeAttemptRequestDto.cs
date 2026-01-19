using System.ComponentModel.DataAnnotations;

namespace IeltsSelfStudy.Application.DTOs.Attempts;

public class GradeAttemptRequestDto
{
    [Required]
    [Range(0, 9)]
    public double Score { get; set; }

    [Required]
    [Range(0, 9)]
    public double MaxScore { get; set; } = 9;

    [StringLength(2000)]
    public string? Feedback { get; set; }

    [Required]
    public bool IsPassed { get; set; }

    [StringLength(500)]
    public string? InternalNotes { get; set; }
}
