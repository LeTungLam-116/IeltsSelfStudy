namespace IeltsSelfStudy.Domain.Entities;

public class Course
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? ShortDescription { get; set; }

    public string Level { get; set; } = string.Empty;   // Beginner, Intermediate...

    public string Skill { get; set; } = "All";          // Listening, Reading, Writing, Speaking, All

    public double? TargetBand { get; set; }             // map float -> double?

    public decimal? Price { get; set; }                 // null hoặc 0 = free

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
