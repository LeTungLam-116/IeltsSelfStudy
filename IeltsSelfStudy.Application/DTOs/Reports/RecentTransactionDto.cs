namespace IeltsSelfStudy.Application.DTOs.Reports;

public class RecentTransactionDto
{
    public int Id { get; set; }
    public string TransactionRef { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string CourseName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
}
