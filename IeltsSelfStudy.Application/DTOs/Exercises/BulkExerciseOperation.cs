namespace IeltsSelfStudy.Application.DTOs.Exercises;

public class BulkExerciseOperation
{
    public required string Operation { get; set; } // "activate", "deactivate", "delete"
    public required List<int> ExerciseIds { get; set; }
}
