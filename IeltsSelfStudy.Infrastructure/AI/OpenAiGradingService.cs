using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Application.DTOs.AI;
using Microsoft.Extensions.Configuration;

namespace IeltsSelfStudy.Infrastructure.AI;

public class OpenAiGradingService : IOpenAiGradingService
{
    private readonly HttpClient _http;
    private readonly ISettingService _settingService;
    private readonly IConfiguration _configuration;

    public OpenAiGradingService(HttpClient http, ISettingService settingService, IConfiguration configuration)
    {
        _http = http;
        _settingService = settingService;
        _configuration = configuration;
        
        _http.BaseAddress = new Uri("https://api.openai.com/v1/");
        _http.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    }

    private async Task EnsureAuthorizedAsync()
    {
        // Fetch specific or default
        var apiKey = await _settingService.GetAsync("AI_ApiKey");
        if (string.IsNullOrEmpty(apiKey))
        {
             // Fallback to Env or Config
             apiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY") 
                      ?? _configuration["GoogleGemini:ApiKey"]; // Backwards compatibility if using Gemini key for OpenAI client standard
        }
        
        if (string.IsNullOrEmpty(apiKey)) throw new InvalidOperationException("API Key is missing.");

        _http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
    }

    private async Task<string> GetModelAsync()
    {
        return await _settingService.GetAsync("AI_Model", "gpt-4o-mini");
    }

    public async Task<WritingFeedbackDto> GradeWritingAsync(string prompt, CancellationToken ct = default)
    {
        await EnsureAuthorizedAsync();
        var model = await GetModelAsync();
        var systemPrompt = await _settingService.GetAsync("AI_Prompt_Writing", 
            "You are an IELTS Writing examiner. Evaluate the student's essay based on IELTS criteria. IMPORTANT: Check if the essay answers the specific question asked. If it is off-topic or irrelevant, penalize the Task Response score heavily.");

        var body = new
        {
            model = model, 
            input = new object[]
            {
                new { role = "system", content = systemPrompt },
                new { role = "user", content = prompt }
            },
            text = new
            {
                format = new
                {
                    type = "json_schema",
                    name = "writing_feedback",
                    strict = true,
                    schema = WritingSchema()
                }
            },
            temperature = 0.2
        };

        using var req = new HttpRequestMessage(HttpMethod.Post, "responses")
        {
            Content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json")
        };

        using var res = await _http.SendAsync(req, ct);
        var raw = await res.Content.ReadAsStringAsync(ct);

        if (!res.IsSuccessStatusCode)
            throw new InvalidOperationException($"OpenAI error {(int)res.StatusCode}: {raw}");

        var jsonText = ExtractFirstOutputText(raw);
        if (string.IsNullOrWhiteSpace(jsonText))
            throw new InvalidOperationException("OpenAI response missing output_text.");

        var dto = JsonSerializer.Deserialize<WritingFeedbackDto>(jsonText, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        return dto ?? throw new InvalidOperationException("Failed to parse WritingFeedbackDto.");
    }

    public async Task<SpeakingFeedbackDto> GradeSpeakingAsync(string prompt, CancellationToken ct = default)
    {
        await EnsureAuthorizedAsync();
        var model = await GetModelAsync();
        var systemPrompt = await _settingService.GetAsync("AI_Prompt_Speaking", 
            "You are an IELTS Speaking examiner. Evaluate the student's answer based on IELTS criteria. IMPORTANT: Check if the answer addresses the specific question asked. If it is off-topic, penalize the score.");

        var body = new
        {
            model = model,
            input = new object[]
            {
                new { role = "system", content = systemPrompt },
                new { role = "user", content = prompt }
            },
            text = new
            {
                format = new
                {
                    type = "json_schema",
                    name = "speaking_feedback",
                    strict = true,
                    schema = SpeakingSchema()
                }
            },
            temperature = 0.2
        };

        using var req = new HttpRequestMessage(HttpMethod.Post, "responses")
        {
            Content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json")
        };

        using var res = await _http.SendAsync(req, ct);
        var raw = await res.Content.ReadAsStringAsync(ct);

        if (!res.IsSuccessStatusCode)
            throw new InvalidOperationException($"OpenAI error {(int)res.StatusCode}: {raw}");

        var jsonText = ExtractFirstOutputText(raw);
        if (string.IsNullOrWhiteSpace(jsonText))
            throw new InvalidOperationException("OpenAI response missing output_text.");

        var dto = JsonSerializer.Deserialize<SpeakingFeedbackDto>(jsonText, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        return dto ?? throw new InvalidOperationException("Failed to parse SpeakingFeedbackDto.");
    }

    public async Task<string> TranscribeAudioAsync(Stream audioStream, string fileName, CancellationToken ct = default)
    {
        await EnsureAuthorizedAsync();
        // Whisper model is different, usually fixed or separate config
        var model = "whisper-1"; 

        using var content = new MultipartFormDataContent();
        
        var streamContent = new StreamContent(audioStream);
        var mimeType = fileName.EndsWith(".webm", StringComparison.OrdinalIgnoreCase) ? "audio/webm" : "audio/mpeg";
        streamContent.Headers.ContentType = new MediaTypeHeaderValue(mimeType);
        content.Add(streamContent, "file", fileName);
        content.Add(new StringContent(model), "model");

        using var req = new HttpRequestMessage(HttpMethod.Post, "audio/transcriptions")
        {
            Content = content
        };

        using var res = await _http.SendAsync(req, ct);
        var raw = await res.Content.ReadAsStringAsync(ct);

        if (!res.IsSuccessStatusCode)
            throw new InvalidOperationException($"OpenAI Audio error {(int)res.StatusCode}: {raw}");

        var doc = JsonDocument.Parse(raw);
        if (doc.RootElement.TryGetProperty("text", out var textEl))
        {
            return textEl.GetString() ?? string.Empty;
        }

        throw new InvalidOperationException("OpenAI response missing 'text' field.");
    }

    // Schema definitions
    private static object WritingSchema() => new
    {
        type = "object",
        additionalProperties = false,
        required = new[] { "overallBand", "criteria", "strengths", "improvements", "corrections", "betterVersion" },
        properties = new
        {
            overallBand = new { type = "number" },
            criteria = new
            {
                type = "object",
                additionalProperties = false,
                required = new[] { "tr", "cc", "lr", "gra" },
                properties = new
                {
                    tr = new { type = "number" },
                    cc = new { type = "number" },
                    lr = new { type = "number" },
                    gra = new { type = "number" }
                }
            },
            strengths = new { type = "array", items = new { type = "string" } },
            improvements = new { type = "array", items = new { type = "string" } },
            corrections = new
            {
                type = "array",
                items = new
                {
                    type = "object",
                    additionalProperties = false,
                    required = new[] { "original", "corrected", "reason" },
                    properties = new
                    {
                        original = new { type = "string" },
                        corrected = new { type = "string" },
                        reason = new { type = "string" }
                    }
                }
            },
            betterVersion = new { type = "string" }
        }
    };

    private static object SpeakingSchema() => new
    {
        type = "object",
        additionalProperties = false,
        required = new[] { "overallBand", "criteria", "strengths", "improvements", "corrections", "betterAnswer" },
        properties = new
        {
            overallBand = new { type = "number" },
            criteria = new
            {
                type = "object",
                additionalProperties = false,
                required = new[] { "fluency", "lexical", "grammar", "pronunciation" },
                properties = new
                {
                    fluency = new { type = "number" },
                    lexical = new { type = "number" },
                    grammar = new { type = "number" },
                    pronunciation = new { type = "number" }
                }
            },
            strengths = new { type = "array", items = new { type = "string" } },
            improvements = new { type = "array", items = new { type = "string" } },
            corrections = new
            {
                type = "array",
                items = new
                {
                    type = "object",
                    additionalProperties = false,
                    required = new[] { "original", "corrected", "reason" },
                    properties = new
                    {
                        original = new { type = "string" },
                        corrected = new { type = "string" },
                        reason = new { type = "string" }
                    }
                }
            },
            betterAnswer = new { type = "string" }
        }
    };

    private static string ExtractFirstOutputText(string rawJson)
    {
        using var doc = JsonDocument.Parse(rawJson);

        if (!doc.RootElement.TryGetProperty("output", out var output) || output.ValueKind != JsonValueKind.Array)
            return "";

        foreach (var item in output.EnumerateArray())
        {
            if (item.TryGetProperty("type", out var typeEl) && typeEl.GetString() == "message")
            {
                if (!item.TryGetProperty("content", out var content) || content.ValueKind != JsonValueKind.Array)
                    continue;

                foreach (var c in content.EnumerateArray())
                {
                    if (c.TryGetProperty("type", out var ct) && ct.GetString() == "output_text"
                        && c.TryGetProperty("text", out var textEl))
                    {
                        return textEl.GetString() ?? "";
                    }
                }
            }
        }
        return "";
    }
    
    public async Task<string> GenerateRoadmapAsync(double overallBand, double grammar, double listening, double speaking, double writing, string availableCoursesInfo, CancellationToken ct = default)
    {
        await EnsureAuthorizedAsync();
        var model = await GetModelAsync();

        var prompt = $@"
Bạn là Giám khảo & Gia sư cấp cao IELTS (IELTS Expert). Dựa trên kết quả test đầu vào:
- Band tổng thể: {overallBand} (Ngữ pháp/Từ vựng: {grammar} | Nghe: {listening} | Nói: {speaking} | Viết: {writing})

Danh sách khóa học hiện có trên nền tảng:
{availableCoursesInfo}

Nhiệm vụ của bạn là tạo một lộ trình CÁ NHÂN HÓA CAO ĐỘ (Premium Level) mang tính thực chiến:
1. Phân tích điểm mạnh/yếu: Cực kỳ cụ thể, BẮT BUỘC chỉ đích danh kỹ năng yếu nhất (có điểm thấp nhất) và lý do tại sao nó kéo điểm tổng xuống. Khen ngợi kỹ năng tốt nhất (2-3 câu).
2. Lộ trình 3 tháng (3 Giai đoạn, mỗi giai đoạn 1 tháng/4 tuần):
   - KHÔNG dùng từ ngữ chung chung như ""củng cố"", ""mở rộng"". 
   - BẮT BUỘC áp dụng các PHƯƠNG PHÁP HỌC HÀNG ĐẦU (ví dụ: Shadowing cho Nói, Dictation/Nghe chép chính tả cho Nghe, Active Recall, Spaced Repetition, Pomodoro).
   - Đưa ra định lượng rõ ràng (Vd: Dành 30p mỗi sáng, học 20 từ vựng/ngày, Viết 1 đoạn 150 chữ/tuần).
   - Tháng đầu tiên PHẢI tập trung giải quyết kỹ năng đang yếu nhất.
3. 3 Lời khuyên vàng: 3 hành động cụ thể có thể làm MỖI NGÀY để tạo thói quen tốt.
4. Một câu khích lệ mạnh mẽ, truyền động lực.
5. Đề xuất 1-2 khóa học PHÙ HỢP NHẤT từ danh sách dựa trên kỹ năng yếu nhất để lấp lỗ hổng. Giải thích lý do chọn khóa học đó.

QUAN TRỌNG: Tất cả nội dung PHẢI bằng tiếng Việt. Độ dài vừa phải, súc tích, văn phong chuyên nghiệp, truyền cảm hứng. Trả về JSON hợp lệ theo schema sau.";

        var schema = new
        {
            type = "object",
            additionalProperties = false,
            required = new[] { "analysis", "roadmap", "recommendations", "encouragement", "suggestedCourses" },
            properties = new
            {
                analysis = new { type = "string", description = "Phân tích điểm mạnh/yếu (tiếng Việt)" },
                roadmap = new
                {
                    type = "array",
                    minItems = 3, maxItems = 3,
                    items = new
                    {
                        type = "object",
                        additionalProperties = false,
                        required = new[] { "phase", "duration", "focus" },
                        properties = new
                        {
                            phase    = new { type = "string", description = "Ví dụ: Tháng 1" },
                            duration = new { type = "string", description = "Ví dụ: 4 tuần (tuần 1-4)" },
                            focus    = new { type = "string", description = "Nội dung học trọng tâm (tiếng Việt)" }
                        }
                    }
                },
                recommendations = new
                {
                    type = "array",
                    minItems = 3, maxItems = 3,
                    items = new { type = "string", description = "Lời khuyên bằng tiếng Việt" }
                },
                encouragement = new { type = "string", description = "Câu khích lệ tiếng Việt" },
                suggestedCourses = new
                {
                    type = "array",
                    maxItems = 2,
                    items = new
                    {
                        type = "object",
                        additionalProperties = false,
                        required = new[] { "courseId", "courseName", "reason" },
                        properties = new
                        {
                            courseId   = new { type = "integer", description = "ID khóa học từ danh sách trên" },
                            courseName = new { type = "string" },
                            reason     = new { type = "string", description = "Lý do đề xuất (tiếng Việt)" }
                        }
                    }
                }
            }
        };

        var body = new
        {
            model = model,
            input = new object[]
            {
                new { role = "system", content = "Bạn là gia sư IELTS. Trả lời hoàn toàn bằng tiếng Việt. Output JSON hợp lệ theo schema được cung cấp." },
                new { role = "user", content = prompt }
            },
            text = new
            {
                format = new
                {
                    type   = "json_schema",
                    name   = "ielts_roadmap",
                    strict = true,
                    schema = schema
                }
            },
            temperature = 0.6
        };

        using var req = new HttpRequestMessage(HttpMethod.Post, "responses")
        {
            Content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json")
        };

        using var res = await _http.SendAsync(req, ct);
        var raw = await res.Content.ReadAsStringAsync(ct);

        if (!res.IsSuccessStatusCode)
            throw new InvalidOperationException($"OpenAI error {(int)res.StatusCode}: {raw}");

        var jsonText = ExtractFirstOutputText(raw);
        if (string.IsNullOrWhiteSpace(jsonText))
            throw new InvalidOperationException("OpenAI response missing output_text.");

        return jsonText;
    }
}
