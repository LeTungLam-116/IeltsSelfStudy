using System.ComponentModel.DataAnnotations;

namespace IeltsSelfStudy.Application.DTOs.Courses;

public class CreateCourseRequest
{
    [Required(ErrorMessage = "Tên khoá học không được để trống.")]
    [MaxLength(255, ErrorMessage = "Tên khoá học tối đa 255 ký tự.")]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500, ErrorMessage = "Mô tả ngắn tối đa 500 ký tự.")]
    public string? ShortDescription { get; set; }

    [Required(ErrorMessage = "Level không được để trống.")]
    [MaxLength(50)]
    public string Level { get; set; } = "Beginner";

    [Required(ErrorMessage = "Skill không được để trống.")]
    [MaxLength(50)]
    public string Skill { get; set; } = "All";

    public double? TargetBand { get; set; }

    public decimal? Price { get; set; }
}
