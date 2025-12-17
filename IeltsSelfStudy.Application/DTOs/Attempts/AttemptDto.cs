namespace IeltsSelfStudy.Application.DTOs.Attempts;

public class AttemptDto
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string Skill { get; set; } = string.Empty;

    public int ExerciseId { get; set; }

    public double? Score { get; set; }

    public double? MaxScore { get; set; }

    public string? UserAnswerJson { get; set; }

    public string? AiFeedback { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }
}
