namespace IeltsSelfStudy.Application.DTOs.WritingExercises;

public class EvaluateWritingResponse
{
    public int AttemptId { get; set; }

    public double? Score { get; set; }

    public double? MaxScore { get; set; }

    public string? Feedback { get; set; }
}
