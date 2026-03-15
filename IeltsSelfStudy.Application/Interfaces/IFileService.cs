using Microsoft.AspNetCore.Http;
using IeltsSelfStudy.Application.DTOs.File;
using IeltsSelfStudy.Application.DTOs.Placement;

namespace IeltsSelfStudy.Application.Interfaces;

public interface IFileService
{
    Task<UploadResponseDto> UploadFileAsync(IFormFile file, string folderName);
    Task<UploadResponseDto> SaveFileAsync(Stream stream, string fileName, string folderName);
    Task<List<QuestionDto>> ImportQuestionsFromExcelAsync(Stream fileStream);
    Task<int> ImportQuestionsForExerciseAsync(int exerciseId, Stream fileStream);
}
