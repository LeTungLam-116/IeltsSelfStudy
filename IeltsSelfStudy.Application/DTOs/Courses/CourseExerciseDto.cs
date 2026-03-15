namespace IeltsSelfStudy.Application.DTOs.Courses;

public class CourseExerciseDto
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public string Skill { get; set; } = string.Empty;
    public int ExerciseId { get; set; }
    public int Order { get; set; }
    public int? LessonNumber { get; set; }
    public DateTime CreatedAt { get; set; }
    
    // Thông tin exercise (optional, có thể load sau)
    public object? Exercise { get; set; }

    // ── Trophy / Cup data (only filled when user is authenticated) ──────────

    /// <summary>
    /// FOR Listening / Reading / Grammar / Vocabulary:
    /// Best attempt score as a percentage: Score / MaxScore * 100
    /// </summary>
    public double? HighestScorePercent { get; set; }

    /// <summary>
    /// FOR Writing / Speaking (AI-graded):
    /// Best IELTS band score achieved (0.0 – 9.0)
    /// </summary>
    public double? HighestBandScore { get; set; }

    /// <summary>
    /// Number of trophies (0-3).
    ///
    /// Writing / Speaking  (band-based, compared to course targetBand):
    ///   3 = achieved >= targetBand
    ///   2 = achieved >= targetBand - 0.5
    ///   1 = any attempt (score > 0)
    ///   0 = not attempted
    ///
    /// Listening / Reading / Grammar / Vocab  (% of correct answers):
    ///   3 = 100%
    ///   2 = >= 75%
    ///   1 = >= 50%
    ///   0 = not attempted or less than 50%
    /// </summary>
    public int TrophyCount { get; set; } = 0;
}