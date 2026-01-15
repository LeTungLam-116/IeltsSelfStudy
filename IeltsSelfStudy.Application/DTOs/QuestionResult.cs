namespace IeltsSelfStudy.Application.DTOs;

public class QuestionResult
{
    public int QuestionId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string UserAnswer { get; set; } = string.Empty;
    public string CorrectAnswer { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public double Points { get; set; }
}
