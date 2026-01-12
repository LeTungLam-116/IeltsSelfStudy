using IeltsSelfStudy.Application.DTOs.ListeningExercises;
using IeltsSelfStudy.Application.DTOs.Common;

namespace IeltsSelfStudy.Application.Interfaces;

public interface IListeningExerciseService
{
    Task<List<ListeningExerciseDto>> GetAllAsync();
    Task<PagedResponse<ListeningExerciseDto>> GetPagedAsync(PagedRequest request);
    Task<ListeningExerciseDto?> GetByIdAsync(int id);
    Task<ListeningExerciseDto> CreateAsync(CreateListeningExerciseRequest request);
    Task<ListeningExerciseDto?> UpdateAsync(int id, UpdateListeningExerciseRequest request);
    Task<bool> DeleteAsync(int id);
    Task<EvaluateListeningResponse> EvaluateAsync(int listeningExerciseId, EvaluateListeningRequest request);
}
