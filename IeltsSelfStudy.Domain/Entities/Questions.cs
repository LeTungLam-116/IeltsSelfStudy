namespace IeltsSelfStudy.Domain.Entities;

public class Question
{
    public int Id { get; set; }

    // TPH: Direct reference to Exercise entity
    public int ExerciseId { get; set; }
    public Exercise Exercise { get; set; } = null!;
    
    // Số thứ tự câu hỏi trong bài
    public int QuestionNumber { get; set; }

    // Nội dung câu hỏi
    public string QuestionText { get; set; } = string.Empty;

    // Loại câu hỏi: MultipleChoice, TrueFalse, FillInBlank, Matching, ...
    public string QuestionType { get; set; } = "MultipleChoice";

    // Đáp án đúng (có thể là JSON nếu là multiple answers)
    public string CorrectAnswer { get; set; } = string.Empty;

    // Điểm số cho câu hỏi này
    public double Points { get; set; } = 1.0;

    /// <summary>
    /// Các lựa chọn (JSON array) - chỉ dùng cho MultipleChoice
    /// Format: [{"label": "A", "text": "Option 1"}, {"label": "B", "text": "Option 2"}]
    /// </summary>
    public string? OptionsJson { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}