using System.ComponentModel.DataAnnotations;

namespace IeltsSelfStudy.Application.DTOs.Courses;

public class AddExerciseToCourseRequest
{
    [Required(ErrorMessage = "ExerciseId không được để trống.")]
    [Range(1, int.MaxValue, ErrorMessage = "ExerciseId phải lớn hơn 0.")]
    public int ExerciseId { get; set; }
    
    [Required(ErrorMessage = "Order không được để trống.")]
    [Range(1, int.MaxValue, ErrorMessage = "Order phải lớn hơn 0.")]
    public int Order { get; set; }
    
    public int? LessonNumber { get; set; }
}