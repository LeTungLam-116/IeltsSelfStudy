using IeltsSelfStudy.Application.DTOs.Questions;

namespace IeltsSelfStudy.Application.Interfaces;

public interface IQuestionService
{
    Task<List<QuestionDto>> GetAllAsync();
    Task<List<QuestionDto>> GetByExerciseAsync(string skill, int exerciseId);
    Task<QuestionDto?> GetByIdAsync(int id);
    Task<QuestionDto> CreateAsync(CreateQuestionRequest request);
    Task<QuestionDto?> UpdateAsync(int id, UpdateQuestionRequest request);
    Task<bool> DeleteAsync(int id);
}