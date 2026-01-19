namespace IeltsSelfStudy.Application.DTOs.Exercises;

public class ExerciseFilters
{
    public List<string>? Types { get; set; } // ["Listening", "Reading", ...]
    public List<string>? Levels { get; set; } // ["Beginner", "Intermediate", "Advanced"]
    public bool? IsActive { get; set; }
    public string? Search { get; set; } // Search in title/description
    public string? SortBy { get; set; } // "title", "type", "level", "createdAt", "totalAttempts", "averageScore"
    public string? SortDirection { get; set; } // "asc", "desc"
}
