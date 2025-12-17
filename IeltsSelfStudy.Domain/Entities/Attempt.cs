namespace IeltsSelfStudy.Domain.Entities;

public class Attempt
{
    public int Id { get; set; }

    public int UserId { get; set; }

    /// <summary>
    /// Listening / Reading / Writing / Speaking
    /// </summary>
    public string Skill { get; set; } = string.Empty;

    /// <summary>
    /// Id của bài luyện (ListeningExercise.Id, ReadingExercise.Id, ...)
    /// </summary>
    public int ExerciseId { get; set; }

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
