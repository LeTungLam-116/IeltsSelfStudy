using System.ComponentModel.DataAnnotations;

namespace IeltsSelfStudy.Application.DTOs.Courses;

public class UpdateCourseRequest
{
    [Required(ErrorMessage = "Tên khoá học không được để trống.")]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? ShortDescription { get; set; }

    [Required]
    [MaxLength(50)]
    public string Level { get; set; } = "Beginner";

    [Required]
    [MaxLength(50)]
    public string Skill { get; set; } = "All";

    public double? TargetBand { get; set; }

    public decimal? Price { get; set; }

    public bool IsActive { get; set; } = true;
}
