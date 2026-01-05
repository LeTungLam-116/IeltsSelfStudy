using System.ComponentModel.DataAnnotations;

namespace IeltsSelfStudy.Application.DTOs.ReadingExercises;

public class EvaluateReadingRequest
{
    [Required]
    public int UserId { get; set; }

    /// <summary>
    /// Dictionary với key là QuestionNumber (string), value là đáp án (string)
    /// Ví dụ: { "1": "A", "2": "B", "3": "C" }
    /// </summary>
    [Required]
    public Dictionary<string, string> Answers { get; set; } = new();
}