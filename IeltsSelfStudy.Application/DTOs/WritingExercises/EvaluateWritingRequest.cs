using System.ComponentModel.DataAnnotations;

namespace IeltsSelfStudy.Application.DTOs.WritingExercises;

public class EvaluateWritingRequest
{
    [Required]
    public int UserId { get; set; }

    [Required]
    public string EssayText { get; set; } = string.Empty;

    // Tùy chọn, nếu bạn muốn gửi thêm
    public double? TargetBand { get; set; }
}
