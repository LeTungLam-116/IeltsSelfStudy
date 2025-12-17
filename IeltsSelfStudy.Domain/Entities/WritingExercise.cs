namespace IeltsSelfStudy.Domain.Entities;

public class WritingExercise
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    /// <summary>
    /// Task1, Task2...
    /// </summary>
    public string TaskType { get; set; } = "Task2";

    /// <summary>
    /// Đề bài đầy đủ
    /// </summary>
    public string Question { get; set; } = string.Empty;

    /// <summary>
    /// Chủ đề: Education, Technology...
    /// </summary>
    public string? Topic { get; set; }

    public string Level { get; set; } = "Beginner";

    public int MinWordCount { get; set; } = 250;

    /// <summary>
    /// Bài mẫu (nếu có)
    /// </summary>
    public string? SampleAnswer { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
