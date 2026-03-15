using IeltsSelfStudy.Application.DTOs.Payments;
using IeltsSelfStudy.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IeltsSelfStudy.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly ILogger<PaymentsController> _logger;

    public PaymentsController(IPaymentService paymentService, ILogger<PaymentsController> logger)
    {
        _paymentService = paymentService;
        _logger = logger;
    }

    [HttpPost("create-url")]
    [Authorize]
    public async Task<IActionResult> CreatePaymentUrl([FromBody] PaymentRequestDto request)
    {
        try
        {
            var userIdStr = User.FindFirst("id")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized(new { message = "User ID not found in token" });
            
            int userId = int.Parse(userIdStr);
            string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";

            _logger.LogInformation("Creating payment URL for UserId: {UserId}, CourseId: {CourseId}, Amount: {Amount}", 
                userId, request.CourseId, request.Amount);

            var url = await _paymentService.CreatePaymentUrlAsync(userId, request, ipAddress);
            return Ok(new { paymentUrl = url });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Payment creation failed. CourseId: {CourseId}, Error: {Error}", request.CourseId, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("verify")]
    public async Task<IActionResult> VerifyPayment()
    {
        try
        {
            var result = await _paymentService.ProcessPaymentCallbackAsync(Request.Query);
            if (result.Success)
            {
                // Redirect to frontend success page or return JSON
                // Since this is an API called by the frontend (after redirect), returning JSON is better.
                return Ok(result);
            }
            return BadRequest(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message, success = false });
        }
    }
}
