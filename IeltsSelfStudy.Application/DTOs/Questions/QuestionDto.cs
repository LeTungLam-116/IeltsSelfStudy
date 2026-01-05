namespace IeltsSelfStudy.Application.DTOs.Questions;

public class QuestionDto
{
    public int Id { get; set; }
    public string Skill { get; set; } = string.Empty;
    public int ExerciseId { get; set; }
    public int QuestionNumber { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string QuestionType { get; set; } = string.Empty;
    public string CorrectAnswer { get; set; } = string.Empty;
    public double Points { get; set; }
    public string? OptionsJson { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}