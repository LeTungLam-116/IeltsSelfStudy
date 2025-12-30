namespace IeltsSelfStudy.Application.DTOs.AI;

public class WritingFeedbackDto
{
    public double OverallBand { get; set; }

    public WritingCriteriaDto Criteria { get; set; } = new();   // tiêu chí chấm bài

    public List<string> Strengths { get; set; } = new();    // điểm mạnh
    public List<string> Improvements { get; set; } = new();     // điểm cần cải thiện

    public List<CorrectionDto> Corrections { get; set; } = new();   // lỗi sai

    public string BetterVersion { get; set; } = string.Empty;       // ví dụ câu trả lời tốt hơn
}

public class WritingCriteriaDto
{
    public double TR { get; set; }   // Task Response; đáp ứng yêu cầu bài viết
    public double CC { get; set; }   // Coherence & Cohesion: mạch lạc và liên kết
    public double LR { get; set; }   // Lexical Resource: vốn từ vựng
    public double GRA { get; set; }  // Grammar Range & Accuracy: ngữ pháp
}

public class CorrectionDto
{
    public string Original { get; set; } = string.Empty;    // câu gốc
    public string Corrected { get; set; } = string.Empty;   // câu đã sửa
    public string Reason { get; set; } = string.Empty;      // lý do sửa
}
