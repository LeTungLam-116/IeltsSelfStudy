using IeltsSelfStudy.Application.DTOs.Questions;
using IeltsSelfStudy.Application.DTOs.Common;

namespace IeltsSelfStudy.Application.Interfaces;

public interface IQuestionService
{
    Task<List<QuestionDto>> GetAllAsync();
    Task<PagedResponse<QuestionDto>> GetPagedAsync(PagedRequest request);
    Task<List<QuestionDto>> GetByExerciseAsync(int exerciseId);
    Task<QuestionDto?> GetByIdAsync(int id);
    Task<QuestionDto> CreateAsync(CreateQuestionRequest request);
    Task<QuestionDto?> UpdateAsync(int id, UpdateQuestionRequest request);
    Task<bool> DeleteAsync(int id);
}