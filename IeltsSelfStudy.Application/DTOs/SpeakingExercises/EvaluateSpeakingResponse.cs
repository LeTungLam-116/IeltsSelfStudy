namespace IeltsSelfStudy.Application.DTOs.SpeakingExercises;

public class EvaluateSpeakingResponse
{
    public int AttemptId { get; set; }
    public double? Score { get; set; }
    public double? MaxScore { get; set; }
    public string? Feedback { get; set; }
}
