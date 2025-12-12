namespace IeltsSelfStudy.Application.DTOs.Courses;

public class CourseDto
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? ShortDescription { get; set; }

    public string Level { get; set; } = string.Empty;

    public string Skill { get; set; } = string.Empty;

    public double? TargetBand { get; set; }

    public decimal? Price { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }
}
