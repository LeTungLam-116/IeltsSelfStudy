namespace IeltsSelfStudy.Application.DTOs.Courses;

public class CourseExerciseDto
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public string Skill { get; set; } = string.Empty;
    public int ExerciseId { get; set; }
    public int Order { get; set; }
    public int? LessonNumber { get; set; }
    public DateTime CreatedAt { get; set; }
    
    // Thông tin exercise (optional, có thể load sau)
    public object? Exercise { get; set; }
}