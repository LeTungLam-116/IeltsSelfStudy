namespace IeltsSelfStudy.Domain.Entities;

public class Attempt
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    // TPH: Direct reference to Exercise entity
    public int ExerciseId { get; set; }
    public Exercise Exercise { get; set; } = null!;

    public double? Score { get; set; }

    public double? MaxScore { get; set; }

    /// <summary>
    /// Lưu đáp án user (JSON string) - tùy bạn thiết kế cấu trúc
    /// </summary>
    public string? UserAnswerJson { get; set; }

    /// <summary>
    /// Feedback từ AI (text hoặc JSON)
    /// </summary>
    public string? AiFeedback { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
