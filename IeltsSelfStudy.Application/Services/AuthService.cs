using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using IeltsSelfStudy.Application.DTOs.Auth;
using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Logging;

namespace IeltsSelfStudy.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepo;
    private readonly IGenericRepository<RefreshToken> _rtRepo;
    private readonly IConfiguration _config;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUserRepository userRepo,
        IGenericRepository<RefreshToken> rtRepo,
        IConfiguration config,
        ILogger<AuthService> logger)
    {
        _userRepo = userRepo;
        _rtRepo = rtRepo;
        _config = config;
        _logger = logger;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest req)
    {
        _logger.LogInformation("User registration attempt: {Email}", req.Email);

        // Validation
        if (string.IsNullOrWhiteSpace(req.Email))
        {
            _logger.LogWarning("Registration failed: Email is empty");
            throw new ArgumentException("Email không được để trống.");
        }
        if (string.IsNullOrWhiteSpace(req.Password))
        {
            _logger.LogWarning("Registration failed: Password is empty for {Email}", req.Email);
            throw new ArgumentException("Mật khẩu không được để trống.");
        }
        if (string.IsNullOrWhiteSpace(req.FullName))
        {
            _logger.LogWarning("Registration failed: FullName is empty for {Email}", req.Email);
            throw new ArgumentException("Họ tên không được để trống.");
        }

        var existing = await _userRepo.GetByEmailAsync(req.Email);
        if (existing != null)
        {
            _logger.LogWarning("Registration failed: Email {Email} already exists", req.Email);
            throw new InvalidOperationException("Email đã tồn tại.");
        }

        _logger.LogDebug("Hashing password for user: {Email}", req.Email);
        var hash = BCrypt.Net.BCrypt.HashPassword(req.Password);
        
        var user = new User
        {
            Email = req.Email,
            FullName = req.FullName,
            PasswordHash = hash,
            Role = string.IsNullOrWhiteSpace(req.Role) ? "Student" : req.Role,
            TargetBand = req.TargetBand,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        await _userRepo.AddAsync(user);
        await _userRepo.SaveChangesAsync();

        _logger.LogInformation("User registered successfully: ID {UserId}, Email {Email}, Role {Role}", 
            user.Id, user.Email, user.Role);

        return await IssueTokens(user);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest req)
    {
        _logger.LogInformation("Login attempt: {Email}", req.Email);

        // Validation
        if (string.IsNullOrWhiteSpace(req.Email))
        {
            _logger.LogWarning("Login failed: Email is empty");
            throw new ArgumentException("Email không được để trống.");
        }
        if (string.IsNullOrWhiteSpace(req.Password))
        {
            _logger.LogWarning("Login failed: Password is empty for {Email}", req.Email);
            throw new ArgumentException("Mật khẩu không được để trống.");
        }

        var user = await _userRepo.GetByEmailAsync(req.Email);
        if (user == null || !user.IsActive)
        {
            _logger.LogWarning("Login failed: User {Email} not found or inactive", req.Email);
            throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng.");
        }

        if (!BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
        {
            _logger.LogWarning("Login failed: Invalid password for user {Email}", req.Email);
            throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng.");
        }

        _logger.LogInformation("User logged in successfully: ID {UserId}, Email {Email}, Role {Role}", 
            user.Id, user.Email, user.Role);

        return await IssueTokens(user);
    }

    public async Task<AuthResponse> RefreshAsync(RefreshRequest req)
    {
        _logger.LogInformation("Refresh token attempt");

        // Validation
        if (string.IsNullOrWhiteSpace(req.RefreshToken))
        {
            _logger.LogWarning("Refresh failed: Token is empty");
            throw new ArgumentException("Refresh token không được để trống.");
        }

        var hashed = HashToken(req.RefreshToken);
        var all = await _rtRepo.GetAllAsync();
        var token = all.FirstOrDefault(t => t.TokenHash == hashed);

        if (token == null || !token.IsActive)
        {
            _logger.LogWarning("Refresh failed: Invalid or expired refresh token");
            throw new UnauthorizedAccessException("Refresh token không hợp lệ hoặc đã hết hạn.");
        }

        _logger.LogDebug("Refresh token found for UserId {UserId}, revoking old token", token.UserId);

        // Token rotation: revoke old token, create new one
        token.RevokedAt = DateTime.UtcNow;

        var (newPlainRt, newRtExp) = await CreateRefreshToken(token.UserId);
        token.ReplacedByTokenHash = HashToken(newPlainRt);

        _rtRepo.Update(token);
        await _rtRepo.SaveChangesAsync();

        var user = await _userRepo.GetByIdAsync(token.UserId)
            ?? throw new UnauthorizedAccessException("User không tồn tại.");

        var accessToken = GenerateAccessToken(user, out var accessExp);

        _logger.LogInformation("Tokens refreshed successfully for UserId {UserId}, Email {Email}", 
            user.Id, user.Email);

        return new AuthResponse
        {
            AccessToken = accessToken,
            AccessTokenExpiresAt = accessExp,
            RefreshToken = newPlainRt,
            RefreshTokenExpiresAt = newRtExp,
            User = ToUserInfo(user)
        };
    }

    public async Task RevokeRefreshTokenAsync(string refreshToken)
    {
        _logger.LogInformation("Revoke refresh token attempt");

        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            _logger.LogWarning("Revoke failed: Token is empty");
            return;
        }

        var hashed = HashToken(refreshToken);
        var all = await _rtRepo.GetAllAsync();
        var token = all.FirstOrDefault(t => t.TokenHash == hashed);

        if (token == null || !token.IsActive)
        {
            _logger.LogWarning("Revoke failed: Token not found or already revoked");
            return;
        }

        token.RevokedAt = DateTime.UtcNow;
        _rtRepo.Update(token);
        await _rtRepo.SaveChangesAsync();

        _logger.LogInformation("Refresh token revoked successfully for UserId {UserId}", token.UserId);
    }

    // ===== Private Helpers =====

    private async Task<AuthResponse> IssueTokens(User user)
    {
        _logger.LogDebug("Issuing tokens for UserId {UserId}, Email {Email}", user.Id, user.Email);

        var accessToken = GenerateAccessToken(user, out var accessExp);
        var (plainRt, rtExp) = await CreateRefreshToken(user.Id);

        _logger.LogDebug("Tokens issued: AccessToken expires at {AccessExpiry}, RefreshToken expires at {RefreshExpiry}", 
            accessExp, rtExp);

        return new AuthResponse
        {
            AccessToken = accessToken,
            AccessTokenExpiresAt = accessExp,
            RefreshToken = plainRt,
            RefreshTokenExpiresAt = rtExp,
            User = ToUserInfo(user)
        };
    }

    private (string PlainToken, string TokenHash, DateTime ExpiresAt) GenerateRefreshToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(64);
        var plain = Convert.ToBase64String(bytes);
        var hash = HashToken(plain);
        
        // Đọc config an toàn - không cần GetValue
        var daysStr = _config["JwtSettings:RefreshTokenDays"];
        var days = int.TryParse(daysStr, out var d) ? d : 7;

        _logger.LogDebug("Generated refresh token with {Days} days validity", days);
        
        return (plain, hash, DateTime.UtcNow.AddDays(days));
    }

    private async Task<(string PlainToken, DateTime ExpiresAt)> CreateRefreshToken(int userId)
    {
        _logger.LogDebug("Creating refresh token for UserId {UserId}", userId);

        var rt = GenerateRefreshToken();

        var entity = new RefreshToken
        {
            UserId = userId,
            TokenHash = rt.TokenHash,
            ExpiresAt = rt.ExpiresAt,
            CreatedAt = DateTime.UtcNow
        };

        await _rtRepo.AddAsync(entity);
        await _rtRepo.SaveChangesAsync();

        _logger.LogDebug("Refresh token created and saved to database for UserId {UserId}", userId);

        return (rt.PlainToken, rt.ExpiresAt);
    }

    private string GenerateAccessToken(User user, out DateTime expiresAt)
    {
        _logger.LogDebug("Generating access token for UserId {UserId}, Email {Email}, Role {Role}", 
            user.Id, user.Email, user.Role);

        var jwt = _config.GetSection("JwtSettings");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["SecretKey"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        // Đọc config an toàn - không cần GetValue
        var minutesStr = jwt["AccessTokenMinutes"];
        var minutes = int.TryParse(minutesStr, out var m) ? m : 15;
        
        expiresAt = DateTime.UtcNow.AddMinutes(minutes);

        var token = new JwtSecurityToken(
            issuer: jwt["Issuer"],
            audience: jwt["Audience"],
            claims: claims,
            expires: expiresAt,
            signingCredentials: creds
        );

        _logger.LogDebug("Access token generated with {Minutes} minutes validity, expires at {Expiry}", 
            minutes, expiresAt);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string HashToken(string token)
    {
        using var sha = SHA256.Create();
        return Convert.ToBase64String(sha.ComputeHash(Encoding.UTF8.GetBytes(token)));
    }

    private static UserInfoDto ToUserInfo(User u) => new()
    {
        Id = u.Id,
        Email = u.Email,
        FullName = u.FullName,
        Role = u.Role,
        TargetBand = u.TargetBand
    };
}