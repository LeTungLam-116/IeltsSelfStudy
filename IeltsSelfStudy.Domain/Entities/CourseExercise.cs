namespace IeltsSelfStudy.Domain.Entities;

public class CourseExercise
{
    public int Id { get; set; }
    
    public int CourseId { get; set; }
    public Course Course { get; set; } = null!;

    // TPH: Direct reference to Exercise entity
    public int ExerciseId { get; set; }
    public Exercise Exercise { get; set; } = null!;
    
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