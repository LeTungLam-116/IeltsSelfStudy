namespace IeltsSelfStudy.Application.DTOs.AI;

public class SpeakingFeedbackDto
{
    public double OverallBand { get; set; }

    public SpeakingCriteriaDto Criteria { get; set; } = new();   // tiêu chí chấm bài

    public List<string> Strengths { get; set; } = new();    // điểm mạnh
    public List<string> Improvements { get; set; } = new();     // điểm cần cải thiện

    public List<CorrectionDto> Corrections { get; set; } = new();   // lỗi sai

    public string BetterAnswer { get; set; } = string.Empty;       // ví dụ câu trả lời tốt hơn
}

public class SpeakingCriteriaDto
{
    public double Fluency { get; set; }      // Fluency & Coherence: trôi chảy và mạch lạc
    public double Lexical { get; set; }      // Lexical Resource: vốn từ vựng
    public double Grammar { get; set; }       // Grammatical Range & Accuracy: ngữ pháp
    public double Pronunciation { get; set; }  // Pronunciation: phát âm
}