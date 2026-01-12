namespace IeltsSelfStudy.Domain.Entities;

public class CourseExercise
{
    public int Id { get; set; }
    
    public int CourseId { get; set; }

    public Course Course { get; set; } = null!;

    public string Skill { get; set; } = string.Empty;
    
    public int ExerciseId { get; set; }
    
    /// <summary>
    /// Thứ tự trong khóa học (1, 2, 3...)
    /// </summary>
    public int Order { get; set; }
    
    /// <summary>
    /// Lesson/Module số mấy (nếu có, có thể null)
    /// </summary>
    public int? LessonNumber { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}