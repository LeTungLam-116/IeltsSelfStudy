namespace IeltsSelfStudy.Domain.Entities;

public class RefreshToken
{
    public int Id { get; set; }
    public int UserId { get; set; }
    
    // Thêm navigation property này
    public User User { get; set; } = null!;
    
    public string TokenHash { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? RevokedAt { get; set; }
    public string? ReplacedByTokenHash { get; set; }
    
    // Hash của refresh token mới thay thế token này khi token cũ được sử dụng
    // Giúp server biết token cũ đã bị revoke và không còn hợp lệ
    public bool IsActive => RevokedAt == null && DateTime.UtcNow <= ExpiresAt;
}