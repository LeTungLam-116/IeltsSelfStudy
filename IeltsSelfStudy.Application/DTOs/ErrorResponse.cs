namespace IeltsSelfStudy.Api.DTOs;

public class ErrorResponse
{
    public string Message { get; set; } = string.Empty;
    public string? Detail { get; set; }
    public int StatusCode { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string? Path { get; set; }
}