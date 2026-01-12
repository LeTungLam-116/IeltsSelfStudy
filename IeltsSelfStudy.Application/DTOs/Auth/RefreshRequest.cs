using System.ComponentModel.DataAnnotations;

namespace IeltsSelfStudy.Application.DTOs.Auth;

public class RefreshRequest
{
    [Required(ErrorMessage = "Refresh token không được để trống.")]
    public string RefreshToken { get; set; } = string.Empty;
}