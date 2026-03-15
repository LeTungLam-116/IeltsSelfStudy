using IeltsSelfStudy.Application.DTOs.Payments;
using Microsoft.AspNetCore.Http;

namespace IeltsSelfStudy.Application.Interfaces;

public interface IPaymentService
{
    Task<string> CreatePaymentUrlAsync(int userId, PaymentRequestDto request, string ipAddress);
    Task<PaymentResultDto> ProcessPaymentCallbackAsync(IQueryCollection collections);
}
