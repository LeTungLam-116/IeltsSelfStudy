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

    /// <summary>
    /// Manual feedback từ admin (text)
    /// </summary>
    public string? AdminFeedback { get; set; }

    /// <summary>
    /// Điểm pass/fail từ admin grading
    /// </summary>
    public bool? IsPassed { get; set; }

    /// <summary>
    /// Username của admin đã grade
    /// </summary>
    public string? GradedBy { get; set; }

    /// <summary>
    /// Thời gian admin grade
    /// </summary>
    public DateTime? GradedAt { get; set; }

    /// <summary>
    /// Internal notes cho admin khác
    /// </summary>
    public string? GradingNotes { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}
