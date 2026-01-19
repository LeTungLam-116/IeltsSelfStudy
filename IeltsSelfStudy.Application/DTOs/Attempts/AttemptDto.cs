namespace IeltsSelfStudy.Application.DTOs.Attempts;

public class AttemptDto
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;

    public string Skill { get; set; } = string.Empty;

    public int ExerciseId { get; set; }
    public string ExerciseTitle { get; set; } = string.Empty;
    public int? CourseId { get; set; }
    public string? CourseTitle { get; set; }

    public double? Score { get; set; }
    public double? MaxScore { get; set; }

    public string? UserAnswerJson { get; set; }
    public string? AiFeedback { get; set; }
    public string? AdminFeedback { get; set; }

    public bool IsGraded { get; set; }
    public bool? IsPassed { get; set; }

    public string? GradedBy { get; set; }
    public DateTime? GradedAt { get; set; }
    public string? GradingNotes { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
