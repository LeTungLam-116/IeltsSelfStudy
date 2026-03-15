namespace IeltsSelfStudy.Domain.Entities;

public class PlacementTest
{
    public int Id { get; set; }
    
    public string Title { get; set; } = string.Empty;
    
    public int DurationSeconds { get; set; } = 900; // 15 mins default
    
    /// <summary>
    /// Stores the array of Multiple Choice questions in JSON format.
    /// Simplified structure for Placement Test.
    /// Example: [{ "id": 1, "text": "...", "options": [...], "correct": "..." }]
    /// </summary>
    public string QuestionsJson { get; set; } = "[]";
    
    public bool IsActive { get; set; } = false;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
