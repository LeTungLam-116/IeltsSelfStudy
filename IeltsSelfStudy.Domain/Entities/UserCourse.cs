using System;

namespace IeltsSelfStudy.Domain.Entities;

public class UserCourse
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int CourseId { get; set; }
    public Course Course { get; set; } = null!;

    public DateTime EnrollmentDate { get; set; } = DateTime.UtcNow;

    // "Active", "Expired", "Completed"
    public string Status { get; set; } = "Active";

    public double? ProgressPercentage { get; set; } = 0;
    
    public DateTime? CompletedAt { get; set; }
}
