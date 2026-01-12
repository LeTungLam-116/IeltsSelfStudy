using IeltsSelfStudy.Application.DTOs.Auth;

namespace IeltsSelfStudy.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<AuthResponse> RefreshAsync(RefreshRequest request);
    Task RevokeRefreshTokenAsync(string refreshToken);
}