namespace IeltsSelfStudy.Application.DTOs.Payments;

public class PaymentResultDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string TransactionRef { get; set; } = string.Empty;
    public string VnPayResponseCode { get; set; } = string.Empty;
    public int? CourseId { get; set; }
    public decimal Amount { get; set; }
}
