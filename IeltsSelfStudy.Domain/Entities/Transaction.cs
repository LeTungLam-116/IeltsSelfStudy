using System;

namespace IeltsSelfStudy.Domain.Entities;

public class Transaction
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int CourseId { get; set; }
    public Course Course { get; set; } = null!;

    public decimal Amount { get; set; }

    public string OrderDescription { get; set; } = string.Empty;

    // Internal Transaction Ref (sent to VNPay)
    public string TransactionRef { get; set; } = string.Empty;

    // VNPay Transaction No (received from VNPay)
    public string? VnPayTransactionNo { get; set; }

    public string PaymentMethod { get; set; } = "VNPay";

    // "Pending", "Success", "Failed"
    public string Status { get; set; } = "Pending";

    public string? ResponseCode { get; set; } // vnp_ResponseCode
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
