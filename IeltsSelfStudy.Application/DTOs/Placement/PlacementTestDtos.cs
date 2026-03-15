using System.Text.Json.Serialization;

namespace IeltsSelfStudy.Application.DTOs.Placement;

public class PlacementTestSubmitRequest
{
    public string AnswersJson { get; set; } = "{}";
    public string? WritingEssay { get; set; }
}

public class PlacementTestResultDto
{
    public double OverallBand { get; set; }
    public double GrammarScore { get; set; }
    public double ListeningScore { get; set; }
    public double SpeakingScore { get; set; }
    public double WritingScore { get; set; }
    public string RoadmapJson { get; set; } = "{}";
}

// === ADMIN CRUD DTOS ===

public class PlacementTestListDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public int DurationSeconds { get; set; }
    public int QuestionCount { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class PlacementTestDetailDto : PlacementTestListDto
{
    public List<QuestionDto> Questions { get; set; } = new();
}

public class CreatePlacementTestRequest
{
    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;
    
    [JsonPropertyName("durationSeconds")]
    public int DurationSeconds { get; set; } = 900;
    
    [JsonPropertyName("questions")]
    public List<QuestionDto> Questions { get; set; } = new();
}

public class UpdatePlacementTestRequest
{
    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;
    
    [JsonPropertyName("durationSeconds")]
    public int DurationSeconds { get; set; }
    
    [JsonPropertyName("questions")]
    public List<QuestionDto> Questions { get; set; } = new();
    
    [JsonPropertyName("isActive")]
    public bool IsActive { get; set; }
}

public class QuestionDto
{
    [JsonPropertyName("id")]
    public int Id { get; set; }
    
    [JsonPropertyName("text")]
    public string Text { get; set; } = string.Empty;
    
    [JsonPropertyName("type")]
    public string Type { get; set; } = "Grammar"; // Grammar, Vocab, Listening, Speaking, Writing
    
    [JsonPropertyName("options")]
    public string[] Options { get; set; } = Array.Empty<string>();
    
    [JsonPropertyName("correctAnswer")]
    public string CorrectAnswer { get; set; } = string.Empty;

    [JsonPropertyName("audioUrl")]
    public string? AudioUrl { get; set; }

    [JsonPropertyName("imageUrl")]
    public string? ImageUrl { get; set; }

    [JsonPropertyName("explanation")]
    public string? Explanation { get; set; }
}

// === HISTORY & REVIEW DTOS ===

public class PlacementTestHistoryDto
{
    public int Id { get; set; }
    public DateTime TestedAt { get; set; }
    public double OverallBand { get; set; }
    public string TestTitle { get; set; } = string.Empty;
}

public class PlacementTestResultDetailDto
{
    public int Id { get; set; }
    public DateTime TestedAt { get; set; }
    public double OverallBand { get; set; }
    public double GrammarScore { get; set; }
    public double ListeningScore { get; set; }
    public double SpeakingScore { get; set; }
    public double WritingScore { get; set; }
    
    public string? RoadmapJson { get; set; }
    public string? AnswersJson { get; set; }
    public string? WritingEssay { get; set; }
    public string? SpeakingAudioUrl { get; set; }
    public string? AiFeedbackJson { get; set; }
    
    public List<QuestionDto> Questions { get; set; } = new();
}
