using IeltsSelfStudy.Application.DTOs.AI; // Added for correct type resolution (WritingFeedbackDto)
using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Application.DTOs.Placement;
using IeltsSelfStudy.Domain.Entities;
using IeltsSelfStudy.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.IO;

namespace IeltsSelfStudy.Infrastructure.Services;

public class PlacementTestService : IPlacementTestService
{
    private readonly IeltsDbContext _context;
    private readonly IOpenAiGradingService _aiService;
    private readonly IFileService _fileService;

    public PlacementTestService(IeltsDbContext context, IOpenAiGradingService aiService, IFileService fileService)
    {
        _context = context;
        _aiService = aiService;
        _fileService = fileService;
    }

    public async Task<PlacementTest?> GetDefaultTestAsync()
    {
        // Strictly return only the active placement test
        return await _context.PlacementTests
            .Where(t => t.IsActive)
            .FirstOrDefaultAsync();
    }

    public async Task<UserLevel?> GetUserLevelAsync(int userId)
    {
        return await _context.UserLevels
            .Where(l => l.UserId == userId)
            .OrderByDescending(l => l.TestedAt)
            .FirstOrDefaultAsync();
    }

    public async Task<List<PlacementTestHistoryDto>> GetHistoryAsync(int userId)
    {
        var history = await _context.UserLevels
            .Where(ul => ul.UserId == userId)
            .OrderByDescending(ul => ul.TestedAt)
            .Select(ul => new PlacementTestHistoryDto
            {
                Id = ul.Id,
                TestedAt = ul.TestedAt,
                OverallBand = ul.OverallBand,
                TestTitle = ul.PlacementTest != null ? ul.PlacementTest.Title : "Placement Test"
            })
            .ToListAsync();
        
        return history;
    }

    public async Task<PlacementTestResultDetailDto?> GetResultDetailAsync(int id, int userId)
    {
        var userLevel = await _context.UserLevels
            .Include(ul => ul.PlacementTest)
            .FirstOrDefaultAsync(ul => ul.Id == id && ul.UserId == userId);

        if (userLevel == null) return null;

        var questions = new List<QuestionDto>();
        if (userLevel.PlacementTest != null && !string.IsNullOrEmpty(userLevel.PlacementTest.QuestionsJson))
        {
             try 
             {
                questions = JsonSerializer.Deserialize<List<QuestionDto>>(userLevel.PlacementTest.QuestionsJson) ?? new();
             } catch {}
        }
        else 
        {
            // If test not linked or no questions, return empty
            questions = new List<QuestionDto>();
        }

        return new PlacementTestResultDetailDto
        {
            Id = userLevel.Id,
            TestedAt = userLevel.TestedAt,
            OverallBand = userLevel.OverallBand,
            GrammarScore = userLevel.GrammarScore,
            ListeningScore = userLevel.ListeningScore,
            SpeakingScore = userLevel.SpeakingScore,
            WritingScore = userLevel.WritingScore,
            RoadmapJson = userLevel.RoadmapJson,
            AnswersJson = userLevel.AnswersJson,
            WritingEssay = userLevel.WritingEssay,
            SpeakingAudioUrl = userLevel.SpeakingAudioUrl,
            AiFeedbackJson = userLevel.AiFeedbackJson,
            Questions = questions
        };
    }

    public async Task<PlacementTestResultDto> SubmitTestAsync(int userId, PlacementTestSubmitRequest request, Stream? audioStream = null, string? audioFileName = null)
    {
        // 1. Get the Test Definition (to link it)
        var test = await GetDefaultTestAsync();
        
        // 2. Calculate Foundation Scores — Grammar and Listening scored SEPARATELY by question type
        var answers = JsonSerializer.Deserialize<Dictionary<string, string>>(request.AnswersJson) ?? new();

        var (gCorrect, gTotal) = CalculateScoreForTypes(answers, test, new[] { "Grammar", "Vocab" });
        var (lCorrect, lTotal) = CalculateScoreForTypes(answers, test, new[] { "Listening" });

        // Convert each to band using percentage-based half-band scale
        double grammarScore = gTotal > 0
            ? ConvertToBandFromPercent((double)gCorrect / gTotal * 100)
            : 3.0;  // no grammar questions → minimum

        double listeningScore = lTotal > 0
            ? ConvertToBandFromPercent((double)lCorrect / lTotal * 100)
            : grammarScore;  // no listening questions → mirror grammar
        
        // 3. AI Scoring & Feedback
        // Speaking/Writing are OPTIONAL (AI challenge). Track which ones were actually evaluated.
        // → Do NOT include unevaluated skills in the overall band to avoid unfair penalties.
        double speakingScore  = 0;
        double writingScore   = 0;
        bool speakingTested   = false;
        bool writingTested    = false;

        WritingFeedbackDto?  writingFeedback  = null;
        SpeakingFeedbackDto? speakingFeedback = null;

        // ── Writing ───────────────────────────────────────────────────────────
        if (!string.IsNullOrWhiteSpace(request.WritingEssay))
        {
            var wordCount = request.WritingEssay
                .Split(' ', StringSplitOptions.RemoveEmptyEntries).Length;

            if (wordCount >= 10) // Require a meaningful essay before sending to AI
            {
                try
                {
                    writingFeedback = await _aiService.GradeWritingAsync(request.WritingEssay);
                    if (writingFeedback?.OverallBand > 0)
                    {
                        writingScore  = writingFeedback.OverallBand;
                        writingTested = true;
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Writing grading failed: {ex.Message}");
                }
            }
            else
            {
                Console.WriteLine($"Writing essay too short ({wordCount} words), skipping AI grading.");
            }
        }

        // ── Speaking ──────────────────────────────────────────────────────────
        string? audioUrl = null;
        if (audioStream != null)
        {
            try
            {
                // Ensure we have a filename
                if (string.IsNullOrEmpty(audioFileName)) audioFileName = "speaking_test.webm";

                // Layer 1: File size guard — check if we have any data to process.
                const long MIN_AUDIO_BYTES = 100; // Even smaller threshold
                long audioSize = audioStream.CanSeek ? audioStream.Length : 0;
                
                Console.WriteLine($"[Speaking Challenge] Received audio stream. Name: {audioFileName}, Size: {audioSize} bytes");

                if (audioSize > 0 || !audioStream.CanSeek)
                {
                    // Start by marking as tested - we have a file!
                    speakingTested = true;

                    // Buffer the stream into memory to avoid "Cannot access a disposed object" errors
                    // Third-party API clients (Cloudinary/OpenAI) will automatically dispose the stream after uploading.
                    byte[] audioBytes;
                    using (var memStream = new MemoryStream())
                    {
                        if (audioStream.CanSeek) audioStream.Position = 0;
                        await audioStream.CopyToAsync(memStream);
                        audioBytes = memStream.ToArray();
                    }

                    // 1. Upload to Cloudinary using a fresh stream
                    using (var cloudinaryStream = new MemoryStream(audioBytes))
                    {
                        var savedFile = await _fileService.SaveFileAsync(cloudinaryStream, audioFileName, $"audio/{userId}");
                        audioUrl = savedFile.Url;
                    }

                    string transcript;
                    // 2. Send to Whisper AI using another fresh stream
                    using (var whisperStream = new MemoryStream(audioBytes))
                    {
                        transcript = await _aiService.TranscribeAudioAsync(whisperStream, audioFileName);
                    }
                    
                    Console.WriteLine($"[Speaking Transcript] Result: '{transcript}'");

                    if (!string.IsNullOrWhiteSpace(transcript))
                    {
                        try 
                        {
                            // We need to provide the AI with the context of the question it's grading
                            var qList = new List<QuestionDto>();
                            try { qList = JsonSerializer.Deserialize<List<QuestionDto>>(test?.QuestionsJson ?? "[]") ?? new List<QuestionDto>(); } catch {}
                            var speakingQ = qList.FirstOrDefault(q => q.Type.Equals("Speaking", StringComparison.OrdinalIgnoreCase));
                            var questionText = speakingQ?.Text ?? "Please introduce yourself and your goals for learning English.";
                            
                            var gradePrompt = $"Question: {questionText}\n\nStudent Answer: {transcript}";
                            Console.WriteLine($"[Speaking Challenge] Grading prompt built length: {gradePrompt.Length}");

                            speakingFeedback = await _aiService.GradeSpeakingAsync(gradePrompt);
                            speakingScore = (speakingFeedback?.OverallBand > 0) ? speakingFeedback.OverallBand : 1.0;
                        }
                        catch (Exception innerEx)
                        {
                            speakingScore = 1.0; 
                            Console.WriteLine($"[Speaking Grade Error] Failed to grade: {innerEx.Message}");
                            if (innerEx.InnerException != null) Console.WriteLine($"Inner: {innerEx.InnerException.Message}");
                        }
                    }
                    else
                    {
                        speakingScore = 1.0; 
                        Console.WriteLine("[Speaking Warning] Transcript is rỗng, assigned floor band 1.0.");
                    }
                    
                    // Final safety floor: if tested, score must be at least 1.0
                    if (speakingScore < 1.0) speakingScore = 1.0;

                    Console.WriteLine($"[Speaking Graded] Band: {speakingScore}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Speaking grading/saving outer failed: {ex.Message}");
                // Even if totally failed, if we had a stream, give a floor score
                speakingTested = true;
                speakingScore = 1.0;
            }
        }

        // 4. Calculate Overall Band — only average skills that were actually tested.
        //    Ensure even if scores are 0 (bad AI response), we treat them as 1.0 for beginners
        var finalGrammar = Math.Max(1.0, grammarScore);
        var finalListening = Math.Max(1.0, listeningScore);
        var scoresToAverage = new List<double> { finalGrammar, finalListening };
        
        if (speakingTested) scoresToAverage.Add(Math.Max(1.0, speakingScore));
        if (writingTested)  scoresToAverage.Add(Math.Max(1.0, writingScore));

        double overallBand = Math.Round(
            scoresToAverage.Average() * 2,
            MidpointRounding.AwayFromZero) / 2;

        // Use 0 as the stored value for untested skills (for display purposes)
        double storedSpeaking = speakingTested ? speakingScore : 0;
        double storedWriting  = writingTested  ? writingScore  : 0;


        // 5. Generate Roadmap — include courseId so frontend can deep-link
        var activeCourses = new List<Course>();
        string coursesInfo = "Chưa có khóa học nào.";
        try
        {
            activeCourses = await _context.Courses
                .Where(c => c.IsActive)
                .ToListAsync();

            if (activeCourses.Any())
            {
                coursesInfo = string.Join("\n", activeCourses.Select(c =>
                    $"- [ID:{c.Id}] {c.Name} (Level: {c.Level}, Target Band: {c.TargetBand}, Skill: {c.Skill})"));
            }
        }
        catch (Exception ex) { Console.WriteLine($"Error fetching courses: {ex.Message}"); }

        string roadmapJson = GenerateFallbackRoadmap(overallBand, activeCourses);  // safe default
        try
        {
            var aiRoadmap = await _aiService.GenerateRoadmapAsync(
                overallBand, grammarScore, listeningScore, storedSpeaking, storedWriting, coursesInfo);

            // Only use AI output if it looks like valid JSON
            if (!string.IsNullOrWhiteSpace(aiRoadmap) && aiRoadmap.TrimStart().StartsWith('{'))
                roadmapJson = aiRoadmap;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Roadmap generation failed, using fallback: {ex.Message}");
        }

        // 6. Save UserLevel with Detailed History
        var feedbackData = new 
        {
            Writing = writingFeedback,
            Speaking = speakingFeedback
        };

        var userLevel = new UserLevel
        {
            UserId = userId,
            GrammarScore  = grammarScore,
            ListeningScore = listeningScore,
            SpeakingScore = storedSpeaking,   // 0 = not tested
            WritingScore  = storedWriting,    // 0 = not tested
            OverallBand   = overallBand,
            RoadmapJson   = roadmapJson,
            TestedAt      = DateTime.UtcNow,
            AnswersJson      = request.AnswersJson,
            WritingEssay     = request.WritingEssay,
            SpeakingAudioUrl = audioUrl,
            AiFeedbackJson   = JsonSerializer.Serialize(feedbackData),
            PlacementTestId  = test.Id
        };

        _context.UserLevels.Add(userLevel);
        await _context.SaveChangesAsync();

        return new PlacementTestResultDto
        {
            OverallBand    = overallBand,
            GrammarScore   = grammarScore,
            ListeningScore = listeningScore,
            SpeakingScore  = storedSpeaking,
            WritingScore   = storedWriting,
            RoadmapJson    = roadmapJson
        };
    }


    // ── Score helpers ──────────────────────────────────────────────────────────

    /// <summary>
    /// Count correct and total questions filtered by type names.
    /// </summary>
    private (int correct, int total) CalculateScoreForTypes(
        Dictionary<string, string> answers, PlacementTest? test, IEnumerable<string> typeFilter)
    {
        if (test == null || string.IsNullOrEmpty(test.QuestionsJson))
            return (0, 0);

        try
        {
            var qList = JsonSerializer.Deserialize<List<QuestionDto>>(test.QuestionsJson);
            if (qList == null || !qList.Any()) return (0, 0);

            var typeSet = new HashSet<string>(typeFilter, StringComparer.OrdinalIgnoreCase);
            var filtered = qList.Where(q => typeSet.Contains(q.Type)).ToList();
            if (!filtered.Any()) return (0, 0);

            int correct = filtered.Count(q =>
                answers.TryGetValue(q.Id.ToString(), out var ans) &&
                q.CorrectAnswer.Equals(ans, StringComparison.OrdinalIgnoreCase));

            return (correct, filtered.Count);
        }
        catch { return (0, 0); }
    }

    /// <summary>
    /// Convert a percentage score (0-100) to an IELTS half-band (3.0 – 9.0).
    /// Capped at 8.0 for a placement test context.
    /// </summary>
    private static double ConvertToBandFromPercent(double pct) => pct switch
    {
        >= 97 => 9.0,
        >= 90 => 8.5,
        >= 80 => 8.0,
        >= 70 => 7.5,
        >= 60 => 7.0,
        >= 55 => 6.5,
        >= 47 => 6.0,
        >= 40 => 5.5,
        >= 33 => 5.0,
        >= 25 => 4.5,
        >= 18 => 4.0,
        >= 10 => 3.5,
        _     => 3.0
    };

    /// <summary>
    /// Fallback roadmap used when the AI service is unavailable.
    /// </summary>
    private static string GenerateFallbackRoadmap(double band, List<Course> availableCourses)
    {
        var level  = band >= 7  ? "cao" : band >= 5 ? "trung bình" : "cơ bản";
        var targetValue = band < 5 ? "5.0–5.5" : band < 6.5 ? "6.0–6.5" : "7.0+";

        // Basic recommendation logic in case AI fails
        var suggested = new List<object>();
        if (availableCourses != null && availableCourses.Any())
        {
            // Simple filter based on target band
            var matches = availableCourses
                .Where(c => (band < 4.5 && c.TargetBand <= 5.0) ||
                            (band >= 4.5 && band < 6.5 && c.TargetBand >= 5.5 && c.TargetBand <= 6.5) ||
                            (band >= 6.5 && c.TargetBand >= 7.0))
                .Take(2)
                .ToList();

            if (!matches.Any()) matches = availableCourses.OrderBy(c => Guid.NewGuid()).Take(1).ToList();

            foreach (var c in matches)
            {
                suggested.Add(new { 
                    courseId = c.Id, 
                    courseName = c.Name, 
                    reason = $"Dựa trên trình độ hiện tại của bạn, khóa học này tập trung tối ưu kỹ năng để giúp bạn sớm đạt mục tiêu Band {c.TargetBand}."
                });
            }
        }
        
        // If still no courses (DB empty), add dummy ones for UI benefit
        if (!suggested.Any())
        {
            suggested.Add(new {
                courseId = 0,
                courseName = band < 5 ? "Cây đa - Gốc rễ IELTS (Beginner)" : "Bứt phá Band 7.0+ (Advanced)",
                reason = "Khóa học này được thiết kế để lấp đầy các lỗ hổng kiến thức bạn đang gặp phải sau bài test."
            });
            suggested.Add(new {
                courseId = 0,
                courseName = "Luyện đề IELTS Intensive",
                reason = "Phát triển toàn diện 4 kỹ năng trong thời gian ngắn nhất."
            });
        }

        var roadmap = new
        {
            analysis = $"Bạn hiện đang ở trình độ Band {band} ({level}). Mục tiêu đề xuất trong 3 tháng tới là Band {targetValue}. Hãy tập trung vào cả 4 kỹ năng: Nghe, Nói, Đọc và Viết.",
            roadmap = new[]
            {
                new { phase = "Tháng 1", duration = "4 tuần", focus = "Củng cố ngữ pháp nền tảng & mở rộng từ vựng học thuật. Luyện nghe BBC/VOA 20 phút/ngày." },
                new { phase = "Tháng 2", duration = "4 tuần", focus = "Phát triển kỹ năng Đọc (skimming/scanning) và Viết (cấu trúc đoạn văn, cohesion)." },
                new { phase = "Tháng 3", duration = "4 tuần", focus = "Luyện Speaking (fluency, pronunciation) và hoàn thiện Writing. Thi thử toàn phần và đánh giá tiến bộ." }
            },
            recommendations = new[]
            {
                "Luyện nghe tiếng Anh mỗi ngày ít nhất 20 phút (podcast, BBC Learning English)",
                "Học 10 từ vựng học thuật mới mỗi ngày và ôn lại theo phương pháp lặp spaced repetition",
                "Viết một đoạn văn ngắn mỗi ngày và nhờ AI hoặc giáo viên nhận xét"
            },
            encouragement = $"Bạn đã hoàn thành bài kiểm tra đầu vào — đó là bước khởi đầu quan trọng! Với lộ trình phù hợp và sự kiên trì, bạn hoàn toàn có thể đạt Band {targetValue}.",
            suggestedCourses = suggested
        };

        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        return JsonSerializer.Serialize(roadmap, options);
    }



    // ==================== ADMIN CRUD METHODS ====================

    public async Task<List<PlacementTestListDto>> GetAllTestsAsync()
    {
        var tests = await _context.PlacementTests
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        return tests.Select(t => new PlacementTestListDto
        {
            Id = t.Id,
            Title = t.Title,
            DurationSeconds = t.DurationSeconds,
            IsActive = t.IsActive,
            QuestionCount = JsonSerializer.Deserialize<List<QuestionDto>>(t.QuestionsJson)?.Count ?? 0,
            CreatedAt = t.CreatedAt
        }).ToList();
    }

    public async Task<PlacementTestDetailDto?> GetTestByIdAsync(int id)
    {
        var test = await _context.PlacementTests.FindAsync(id);
        if (test == null) return null;

        var questions = JsonSerializer.Deserialize<List<QuestionDto>>(test.QuestionsJson) ?? new List<QuestionDto>();

        return new PlacementTestDetailDto
        {
            Id = test.Id,
            Title = test.Title,
            DurationSeconds = test.DurationSeconds,
            IsActive = test.IsActive,
            QuestionCount = questions.Count,
            CreatedAt = test.CreatedAt,
            Questions = questions
        };
    }

    public async Task<PlacementTestDetailDto> CreateTestAsync(CreatePlacementTestRequest request)
    {
        var test = new PlacementTest
        {
            Title = request.Title,
            DurationSeconds = request.DurationSeconds,
            QuestionsJson = JsonSerializer.Serialize(request.Questions),
            IsActive = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.PlacementTests.Add(test);
        await _context.SaveChangesAsync();

        return new PlacementTestDetailDto
        {
            Id = test.Id,
            Title = test.Title,
            DurationSeconds = test.DurationSeconds,
            IsActive = test.IsActive,
            QuestionCount = request.Questions.Count,
            CreatedAt = test.CreatedAt,
            Questions = request.Questions
        };
    }

    public async Task<PlacementTestDetailDto?> UpdateTestAsync(int id, UpdatePlacementTestRequest request)
    {
        var test = await _context.PlacementTests.FindAsync(id);
        if (test == null) return null;

        test.Title = request.Title;
        test.DurationSeconds = request.DurationSeconds;
        test.QuestionsJson = JsonSerializer.Serialize(request.Questions);
        test.IsActive = request.IsActive;

        await _context.SaveChangesAsync();

        return new PlacementTestDetailDto
        {
            Id = test.Id,
            Title = test.Title,
            DurationSeconds = test.DurationSeconds,
            IsActive = test.IsActive,
            QuestionCount = request.Questions.Count,
            CreatedAt = test.CreatedAt,
            Questions = request.Questions
        };
    }

    public async Task<bool> DeleteTestAsync(int id)
    {
        var test = await _context.PlacementTests.FindAsync(id);
        if (test == null) return false;

        _context.PlacementTests.Remove(test);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> SetActiveTestAsync(int id)
    {
        var allTests = await _context.PlacementTests.ToListAsync();
        foreach (var t in allTests)
        {
            t.IsActive = false;
        }

        var test = await _context.PlacementTests.FindAsync(id);
        if (test == null) return false;

        test.IsActive = true;
        await _context.SaveChangesAsync();
        return true;
    }
}
