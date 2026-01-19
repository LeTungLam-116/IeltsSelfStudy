namespace IeltsSelfStudy.Application.DTOs.Exercises;

public class BulkExerciseResult
{
    public int Success { get; set; }
    public int Failed { get; set; }
    public List<BulkExerciseError> Errors { get; set; } = new();

    public class BulkExerciseError
    {
        public int ExerciseId { get; set; }
        public string Error { get; set; } = string.Empty;
    }
}
