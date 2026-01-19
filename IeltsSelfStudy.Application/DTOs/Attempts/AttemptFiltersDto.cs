using System;

namespace IeltsSelfStudy.Application.DTOs.Attempts;

public class AttemptFiltersDto
{
    public int? UserId { get; set; }

    public string? Skill { get; set; } // Listening, Reading, Writing, Speaking

    public int? ExerciseId { get; set; }

    public int? CourseId { get; set; }

    public bool? IsGraded { get; set; }

    public bool? IsPassed { get; set; }

    public double? MinScore { get; set; }

    public double? MaxScore { get; set; }

    public DateTime? FromDate { get; set; }

    public DateTime? ToDate { get; set; }

    public string? SortBy { get; set; } = "CreatedAt";

    public string? SortDirection { get; set; } = "desc";
}
