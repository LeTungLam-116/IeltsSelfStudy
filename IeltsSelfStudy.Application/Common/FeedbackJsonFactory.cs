using System.Text.Json;

namespace IeltsSelfStudy.Application.Common;

public static class FeedbackJsonFactory
{
    public static string CreateWriting(double overallBand)
    {
        var obj = new
        {
            skill = "Writing",
            overallBand,
            criteria = new      // tiêu chí chấm bài
            {
                taskResponse = 5,   // đáp ứng yêu cầu bài viết
                coherenceCohesion = 4,  // mạch lạc và liên kết
                lexicalResource = 4,    // vốn từ vựng
                grammar = 4         // ngữ pháp
            },
            strengths = new[]   // điểm mạnh
            {
                "Your ideas are understandable and you answer the question.",
                "You use some basic linking words (for example: however, because)."
            },
            improvements = new[]    // điểm cần cải thiện
            {
                "Add clearer topic sentences for each paragraph.",
                "Reduce grammar mistakes with subject–verb agreement and articles."
            },
            betterVersion = "A better version example: Firstly, ... Secondly, ... In conclusion, ...",  // ví dụ câu trả lời tốt hơn
            mistakes = new[]    // lỗi sai
            {
                new { from = "She go to school", to = "She goes to school", reason = "Subject–verb agreement" },
                new { from = "in the internet", to = "on the internet", reason = "Correct preposition" }
            }
        };

        return JsonSerializer.Serialize(obj, new JsonSerializerOptions { WriteIndented = true });
    }

    public static string CreateSpeaking(double overallBand)
    {
        var obj = new
        {
            skill = "Speaking",
            overallBand,
            criteria = new  // tiêu chí chấm bài
            {
                fluency = 4,    // trôi chảy
                lexical = 4,    // từ vựng
                grammar = 4,    // ngữ pháp
                pronunciation = 4   // phát âm
            },
            strengths = new[]   // điểm mạnh
            {
                "You can answer the question and keep talking.",
                "You use some everyday vocabulary correctly."
            },
            improvements = new[]    // điểm cần cải thiện
            {
                "Try to speak with fewer pauses (use simple fillers like 'well', 'actually').",
                "Use more complex sentences sometimes (because/although)."
            },
            betterAnswer = "A better answer example: Well, I’d like to talk about ...", // ví dụ câu trả lời tốt hơn
            mistakes = new[]    // lỗi sai
            {
                new { from = "He like it", to = "He likes it", reason = "Subject–verb agreement" },
                new { from = "more better", to = "better", reason = "Comparative form" }
            }
        };

        return JsonSerializer.Serialize(obj, new JsonSerializerOptions { WriteIndented = true });
    }
}
