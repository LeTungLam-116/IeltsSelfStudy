using IeltsSelfStudy.Application.DTOs.AI;

namespace IeltsSelfStudy.Application.Abstractions;

public interface IOpenAiGradingService
{
    Task<WritingFeedbackDto> GradeWritingAsync(string prompt, CancellationToken ct = default);
}
