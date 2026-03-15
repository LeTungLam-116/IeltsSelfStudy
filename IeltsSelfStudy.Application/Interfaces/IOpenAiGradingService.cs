using IeltsSelfStudy.Application.DTOs.AI;
using System.IO;

namespace IeltsSelfStudy.Application.Interfaces;

public interface IOpenAiGradingService
{
    Task<WritingFeedbackDto> GradeWritingAsync(string prompt, CancellationToken ct = default);
    Task<SpeakingFeedbackDto> GradeSpeakingAsync(string prompt, CancellationToken ct = default);

    /// <summary>
    /// Transcribes audio stream to text using OpenAI Whisper.
    /// </summary>
    Task<string> TranscribeAudioAsync(Stream audioStream, string fileName, CancellationToken ct = default);
    Task<string> GenerateRoadmapAsync(double overallBand, double grammar, double listening, double speaking, double writing, string availableCoursesInfo, CancellationToken ct = default);
}
