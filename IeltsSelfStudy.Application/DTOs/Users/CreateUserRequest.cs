using System.ComponentModel.DataAnnotations;

namespace IeltsSelfStudy.Application.DTOs.Users;

public class CreateUserRequest
{
    [Required(ErrorMessage = "Email không được để trống.")]
    [EmailAddress(ErrorMessage = "Email không đúng định dạng.")]
    [MaxLength(255, ErrorMessage = "Email tối đa 255 ký tự.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Họ tên không được để trống.")]
    [MaxLength(255, ErrorMessage = "Họ tên tối đa 255 ký tự.")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Mật khẩu không được để trống.")]
    [MinLength(6, ErrorMessage = "Mật khẩu phải có ít nhất 6 ký tự.")]
    public string Password { get; set; } = string.Empty;

    [MaxLength(50, ErrorMessage = "Role tối đa 50 ký tự.")]
    public string Role { get; set; } = "Student";

    public double? TargetBand { get; set; }
}
