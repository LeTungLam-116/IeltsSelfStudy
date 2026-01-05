using System.ComponentModel.DataAnnotations;

namespace IeltsSelfStudy.Application.DTOs.Questions;

public class CreateQuestionRequest
{
    [Required, MaxLength(50)]
    public string Skill { get; set; } = string.Empty;

    [Required]
    public int ExerciseId { get; set; }

    [Required]
    [Range(1, int.MaxValue)]
    public int QuestionNumber { get; set; }

    [Required]
    public string QuestionText { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string QuestionType { get; set; } = "MultipleChoice";

    [Required, MaxLength(500)]
    public string CorrectAnswer { get; set; } = string.Empty;

    [Range(0, double.MaxValue)]
    public double Points { get; set; } = 1.0;

    public string? OptionsJson { get; set; }
}