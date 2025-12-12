using System.ComponentModel.DataAnnotations;

namespace IeltsSelfStudy.Application.DTOs.Users;

public class UpdateUserRequest
{
    [Required(ErrorMessage = "Họ tên không được để trống.")]
    [MaxLength(255, ErrorMessage = "Họ tên tối đa 255 ký tự.")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Role không được để trống.")]
    [MaxLength(50, ErrorMessage = "Role tối đa 50 ký tự.")]
    public string Role { get; set; } = "Student";

    public double? TargetBand { get; set; }

    public bool IsActive { get; set; } = true;
}
