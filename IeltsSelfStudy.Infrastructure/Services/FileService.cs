using ClosedXML.Excel;
using IeltsSelfStudy.Application.DTOs.File;
using IeltsSelfStudy.Application.DTOs.Placement;
using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Domain.Entities;
using IeltsSelfStudy.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System.Text.Json;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace IeltsSelfStudy.Infrastructure.Services;

public class FileService : IFileService
{
    private readonly IWebHostEnvironment _env;
    private readonly IeltsDbContext _dbContext;
    private readonly Cloudinary _cloudinary;

    public FileService(IWebHostEnvironment env, IeltsDbContext dbContext, Cloudinary cloudinary)
    {
        _env = env;
        _dbContext = dbContext;
        _cloudinary = cloudinary;
    }

    public async Task<UploadResponseDto> UploadFileAsync(IFormFile file, string folderName)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("File is empty");

        // Validate extension
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".mp3", ".wav", ".webm", ".m4a" };
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(ext))
            throw new ArgumentException("Invalid file type. Only images and audio are allowed.");

        using var stream = file.OpenReadStream();
        return await SaveFileAsync(stream, file.FileName, folderName);
    }

    public async Task<UploadResponseDto> SaveFileAsync(Stream stream, string fileName, string folderName)
    {
        if (stream == null || stream.Length == 0)
             throw new ArgumentException("File stream is empty");
         // Lấy đuôi file
        var ext = Path.GetExtension(fileName).ToLowerInvariant();
        // Tạo tên file UNIQUE (tránh trùng lặp)
        var uniqueFileName = $"{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid().ToString().Substring(0, 8)}";

        // Xác định loại file (Image, Video, hay Raw/Audio)
        var resourceType = DetermineResourceType(ext);

        // Tạo đường dẫn thư mục trên Cloudinary (e.g., "audio/speaking_practice/123")
        var cloudinaryFolder = $"ielts-selfstudy/{folderName}";

        // Upload to Cloudinary
        RawUploadResult uploadResult;

        // Phân loại và upload theo từng loại
        switch (resourceType)
        {
            case CloudinaryDotNet.Actions.ResourceType.Image:
                var imageParams = new ImageUploadParams
                {
                    File = new FileDescription(fileName, stream),
                    PublicId = $"{cloudinaryFolder}/{uniqueFileName}",
                    Folder = cloudinaryFolder,
                    Overwrite = false
                };
                uploadResult = await _cloudinary.UploadAsync(imageParams);
                break;

            case CloudinaryDotNet.Actions.ResourceType.Video:
                var videoParams = new VideoUploadParams
                {
                    File = new FileDescription(fileName, stream),
                    PublicId = $"{cloudinaryFolder}/{uniqueFileName}",
                    Folder = cloudinaryFolder,
                    Overwrite = false
                };
                uploadResult = await _cloudinary.UploadAsync(videoParams);
                break;

            default:
                var rawParams = new RawUploadParams
                {
                    File = new FileDescription(fileName, stream),
                    PublicId = $"{cloudinaryFolder}/{uniqueFileName}",
                    Folder = cloudinaryFolder,
                    Overwrite = false
                };
                uploadResult = await _cloudinary.UploadAsync(rawParams);
                break;
        }

        if (uploadResult.Error != null)
        {
            throw new Exception($"Cloudinary upload failed: {uploadResult.Error.Message}");
        }

        return new UploadResponseDto
        {
            Url = uploadResult.SecureUrl.ToString(),
            FileName = $"{uniqueFileName}{ext}"
        };
    }

    private CloudinaryDotNet.Actions.ResourceType DetermineResourceType(string extension)
    {
        var imageExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp" };
        var audioExtensions = new[] { ".mp3", ".wav", ".m4a", ".ogg", ".flac" };
        var videoExtensions = new[] { ".mp4", ".webm", ".avi", ".mov" };

        if (imageExtensions.Contains(extension)) return CloudinaryDotNet.Actions.ResourceType.Image;
        if (videoExtensions.Contains(extension)) return CloudinaryDotNet.Actions.ResourceType.Video;
        if (audioExtensions.Contains(extension)) return CloudinaryDotNet.Actions.ResourceType.Raw;  // Audio uploaded as Raw

        return CloudinaryDotNet.Actions.ResourceType.Raw;  // Default to Raw for unknown types
    }

    public async Task<List<QuestionDto>> ImportQuestionsFromExcelAsync(Stream fileStream)
    {
        var questions = new List<QuestionDto>();

        using (var workbook = new XLWorkbook(fileStream))
        {
            var worksheet = workbook.Worksheet(1); // First sheet
            var rows = worksheet.RangeUsed().RowsUsed().Skip(1); // Skip header

            int idCounter = 1; // Temporary ID for frontend key

            foreach (var row in rows)
            {
                try 
                {
                    // Expected Columns:
                    // 1: Text, 2: ImageUrl, 3: AudioUrl, 4: A, 5: B, 6: C, 7: D, 8: CorrectAnswer, 9: Explain, 10: Type (Grammar/Vocab/Listening/Speaking/Writing)

                    var type = row.Cell(10).GetValue<string>();
                    // Normalize type
                    if (string.IsNullOrWhiteSpace(type)) type = "Grammar";

                    // Map Options
                    var options = new List<string>
                    {
                        row.Cell(4).GetValue<string>(), // A
                        row.Cell(5).GetValue<string>(), // B
                        row.Cell(6).GetValue<string>(), // C
                        row.Cell(7).GetValue<string>()  // D
                    };

                    var question = new QuestionDto
                    {
                        Id = idCounter++,
                        Text = row.Cell(1).GetValue<string>(),
                        ImageUrl = row.Cell(2).GetValue<string>(),
                        AudioUrl = row.Cell(3).GetValue<string>(),
                        Options = options.ToArray(),
                        CorrectAnswer = row.Cell(8).GetValue<string>(),
                        Explanation = row.Cell(9).GetValue<string>(),
                        Type = type
                    };
                    
                    // Basic validation
                    bool isValidMultipleChoice = !string.IsNullOrWhiteSpace(question.Text) && !string.IsNullOrWhiteSpace(question.CorrectAnswer);
                    bool isValidOpenEnded = (type == "Speaking" || type == "Writing") && !string.IsNullOrWhiteSpace(question.Text);

                    if (isValidMultipleChoice || isValidOpenEnded)
                    {
                        questions.Add(question);
                    }
                }
                catch (Exception ex)
                {
                    // Log or ignore row
                    Console.WriteLine($"Error parsing row {row.RowNumber()}: {ex.Message}");
                }
            }
        }

        return questions;
    }

    /// <summary>
    /// Import questions from Excel file and save directly to database for a specific Exercise.
    /// Expected Columns: 1: QuestionNumber, 2: QuestionText, 3: QuestionType, 4: A, 5: B, 6: C, 7: D, 8: CorrectAnswer, 9: Points
    /// </summary>
    public async Task<int> ImportQuestionsForExerciseAsync(int exerciseId, Stream fileStream)
    {
        var questionsToAdd = new List<Question>();

        using (var workbook = new XLWorkbook(fileStream))
        {
            var worksheet = workbook.Worksheet(1);
            var rows = worksheet.RangeUsed().RowsUsed().Skip(1); // Skip header

            foreach (var row in rows)
            {
                try
                {
                    var questionNumber = row.Cell(1).GetValue<int>();
                    var questionText = row.Cell(2).GetValue<string>();
                    var questionType = row.Cell(3).GetValue<string>();
                    
                    // Options (columns 4-7 for A, B, C, D)
                    var options = new List<object>();
                    var labels = new[] { "A", "B", "C", "D" };
                    for (int i = 0; i < 4; i++)
                    {
                        var optionText = row.Cell(4 + i).GetValue<string>();
                        if (!string.IsNullOrWhiteSpace(optionText))
                        {
                            options.Add(new { id = labels[i], text = optionText });
                        }
                    }

                    var correctAnswer = row.Cell(8).GetString()?.Trim();
                    row.Cell(9).TryGetValue<double>(out var points);
                    if (points <= 0) points = 1.0;

                    // Validate required fields
                    if (string.IsNullOrWhiteSpace(questionText)) continue;
                    if (string.IsNullOrWhiteSpace(questionType)) questionType = "MultipleChoice";

                    var question = new Question
                    {
                        ExerciseId = exerciseId,
                        QuestionNumber = questionNumber,
                        QuestionText = questionText,
                        QuestionType = questionType,
                        CorrectAnswer = correctAnswer ?? "",
                        Points = points,
                        OptionsJson = options.Count > 0 ? JsonSerializer.Serialize(options) : null,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    };

                    questionsToAdd.Add(question);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error parsing row {row.RowNumber()}: {ex.Message}");
                }
            }
        }

        if (questionsToAdd.Count > 0)
        {
            try
            {
                await _dbContext.Questions.AddRangeAsync(questionsToAdd);
                
                var exc = await _dbContext.Exercises.FindAsync(exerciseId);
                if (exc != null)
                {
                    exc.QuestionCount = exc.QuestionCount + questionsToAdd.Count;
                    _dbContext.Exercises.Update(exc);
                }

                await _dbContext.SaveChangesAsync();
            }
            catch (Microsoft.EntityFrameworkCore.DbUpdateException dbEx)
            {
                Console.WriteLine($"DB Error in ImportQuestionsForExerciseAsync: {dbEx.Message}");
                throw new Exception("Lỗi Database: Có thể các câu hỏi trong file Excel bị trùng lặp STT (Question Number) với các câu đã có trong bài tập này.");
            }
        }

        return questionsToAdd.Count;
    }
}
