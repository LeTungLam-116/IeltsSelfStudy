namespace IeltsSelfStudy.Application.DTOs.Exercises;

public class UpdateExerciseRequest
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? Level { get; set; }
    public int? QuestionCount { get; set; }
    public bool? IsActive { get; set; }

    // Type-specific fields
    public string? AudioUrl { get; set; }
    public string? Transcript { get; set; }
    public int? DurationSeconds { get; set; }
    public string? PassageText { get; set; }
    public string? TaskType { get; set; }
    public string? ChartType { get; set; } // For Writing Task 1
    public string? EssayType { get; set; } // For Writing Task 2
    public string? Topic { get; set; }
    public int? MinWordCount { get; set; }
    public string? SampleAnswer { get; set; }
    public string? Part { get; set; }
    public string? Question { get; set; }
    public string? CueCardJson { get; set; } // For Speaking Part 2
    public string? Tips { get; set; }
    public string? ImageUrl { get; set; } // For Writing Task 1 charts/graphs
}
