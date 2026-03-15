namespace IeltsSelfStudy.Domain.Entities;

public class SystemSetting
{
    public int Id { get; set; }

    /// <summary>
    /// Unique identifier key (e.g., "AI_ApiKey")
    /// </summary>
    public string Key { get; set; } = string.Empty;

    /// <summary>
    /// Configuration value
    /// </summary>
    public string Value { get; set; } = string.Empty;

    /// <summary>
    /// Grouping for UI (e.g., "AI", "Payment", "General")
    /// </summary>
    public string Group { get; set; } = "General";

    /// <summary>
    /// Input type for UI (e.g., "string", "number", "boolean", "text", "password")
    /// </summary>
    public string Type { get; set; } = "string";

    /// <summary>
    /// User-friendly name or description
    /// </summary>
    public string? Description { get; set; }

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
