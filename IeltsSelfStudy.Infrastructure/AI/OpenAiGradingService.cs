using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using IeltsSelfStudy.Application.Abstractions;
using IeltsSelfStudy.Application.DTOs.AI;

namespace IeltsSelfStudy.Infrastructure.AI;

public class OpenAiGradingService : IOpenAiGradingService
{
    private readonly HttpClient _http;
    private readonly string _apiKey;

    public OpenAiGradingService(HttpClient http)
    {
        _http = http;
        _apiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY")
                  ?? throw new InvalidOperationException("Missing OPENAI_API_KEY environment variable.");

        _http.BaseAddress = new Uri("https://api.openai.com/v1/");
        _http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
        _http.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    }

    public async Task<WritingFeedbackDto> GradeWritingAsync(string prompt, CancellationToken ct = default)
    {
        // Structured Outputs: text.format json_schema strict=true :contentReference[oaicite:4]{index=4}
        var body = new
        {
            model = "gpt-4o-mini", // dùng model hỗ trợ json_schema (Structured Outputs) :contentReference[oaicite:5]{index=5}
            input = new object[]
            {
                new { role = "system", content = "You are an IELTS Writing examiner. Give beginner-friendly feedback." },
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

        // Responses API trả output[] -> message -> content[] -> output_text.text :contentReference[oaicite:6]{index=6}
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
        var body = new
        {
            model = "gpt-4o-mini",
            input = new object[]
            {
                new { role = "system", content = "You are an IELTS Speaking examiner. Give beginner-friendly feedback." },
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
}
