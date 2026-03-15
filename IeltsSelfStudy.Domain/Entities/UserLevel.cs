namespace IeltsSelfStudy.Domain.Entities;

public class UserLevel
{
    public int Id { get; set; }
    
    public int UserId { get; set; }
    public User? User { get; set; }
    
    public double GrammarScore { get; set; }
    public double ListeningScore { get; set; }
    public double SpeakingScore { get; set; }
    public double WritingScore { get; set; }
    
    public double OverallBand { get; set; }
    
    /// <summary>
    /// Stores the AI-generated roadmap and advice in JSON format.
    /// </summary>
    public string RoadmapJson { get; set; } = "{}";

    // New fields for detailed history review
    public string? AnswersJson { get; set; }        // Stores user selected options (key-value)
    public string? WritingEssay { get; set; }       // Stores user essay text
    public string? SpeakingAudioUrl { get; set; }   // Path/URL to stored audio file
    public string? AiFeedbackJson { get; set; }     // Detailed AI feedback (Writing & Speaking)
    
    public int? PlacementTestId { get; set; }       // Link to the specific test version
    public PlacementTest? PlacementTest { get; set; }

    public DateTime TestedAt { get; set; } = DateTime.UtcNow;
}
