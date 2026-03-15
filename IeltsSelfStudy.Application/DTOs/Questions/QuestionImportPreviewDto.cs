namespace IeltsSelfStudy.Application.DTOs.Questions;

public class QuestionImportPreviewDto
{
    public int QuestionNumber { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string QuestionType { get; set; } = "MultipleChoice";
    public string CorrectAnswer { get; set; } = string.Empty;
    public double Points { get; set; } = 1.0;
    public string? OptionsJson { get; set; }
    public bool IsValid { get; set; } = true;
    public string ErrorMessage { get; set; } = string.Empty;
}

public class ConfirmImportRequest
{
    public int ExerciseId { get; set; }
    public List<QuestionImportPreviewDto> Questions { get; set; } = new();
}
