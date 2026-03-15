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
    Task<List<QuestionImportPreviewDto>> PreviewImportFromExcelAsync(int exerciseId, System.IO.Stream excelStream);
    Task<(int count, string errorMessage)> ConfirmImportAsync(ConfirmImportRequest request);
    Task<(int count, string errorMessage)> ImportFromExcelAsync(int exerciseId, System.IO.Stream excelStream);
    Task<bool> DeleteAsync(int id);
}