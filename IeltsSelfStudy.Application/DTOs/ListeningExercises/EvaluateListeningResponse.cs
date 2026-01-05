namespace IeltsSelfStudy.Application.DTOs.ListeningExercises;

public class EvaluateListeningResponse
{
    public int AttemptId { get; set; }
    public double? Score { get; set; }
    public double? MaxScore { get; set; }
    public int CorrectCount { get; set; }
    public int TotalQuestions { get; set; }
    public Dictionary<int, bool> QuestionResults { get; set; } = new(); // QuestionNumber -> IsCorrect
    public string? Feedback { get; set; }
}