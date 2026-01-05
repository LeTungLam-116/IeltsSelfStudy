using IeltsSelfStudy.Application.DTOs.SpeakingExercises;

namespace IeltsSelfStudy.Application.Interfaces;

public interface ISpeakingExerciseService
{
    Task<List<SpeakingExerciseDto>> GetAllAsync();
    Task<SpeakingExerciseDto?> GetByIdAsync(int id);
    Task<SpeakingExerciseDto> CreateAsync(CreateSpeakingExerciseRequest request);
    Task<SpeakingExerciseDto?> UpdateAsync(int id, UpdateSpeakingExerciseRequest request);
    Task<bool> DeleteAsync(int id);
    Task<EvaluateSpeakingResponse> EvaluateAsync(int speakingExerciseId, EvaluateSpeakingRequest request);
}
