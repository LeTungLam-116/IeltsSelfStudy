namespace IeltsSelfStudy.Application.DTOs.Courses;

public class CourseDto
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? ShortDescription { get; set; }
    
    public string? ThumbnailUrl { get; set; }

    public string Level { get; set; } = string.Empty;

    public string Skill { get; set; } = string.Empty;

    public double? TargetBand { get; set; }

    public decimal? Price { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public List<CourseExerciseDto>? Exercises { get; set; }

    public bool IsEnrolled { get; set; }

    // Course progress (filled when user is authenticated)
    // "Completed" = exercise has TrophyCount >= 2 (score >= 80%)
    public int TotalExercises { get; set; }
    public int CompletedExercises { get; set; }

    /// <summary>Percentage of exercises completed (0-100)</summary>
    public double ProgressPercent { get; set; }

    /// <summary>True when ALL exercises reach >= 2 trophies</summary>
    public bool IsCompleted { get; set; }
}
