namespace IeltsSelfStudy.Application.DTOs.Payments;

public class PaymentRequestDto
{
    public int CourseId { get; set; }
    public decimal Amount { get; set; }
    public string OrderInfo { get; set; } = string.Empty;
}
