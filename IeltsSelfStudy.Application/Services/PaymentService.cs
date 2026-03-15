using IeltsSelfStudy.Application.DTOs.Payments;
using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace IeltsSelfStudy.Application.Services;

public class PaymentService : IPaymentService
{
    private readonly IGenericRepository<Transaction> _transactionRepo;
    private readonly IGenericRepository<UserCourse> _userCourseRepo;
    private readonly IGenericRepository<Course> _courseRepo;
    private readonly IConfiguration _configuration;
    private readonly ILogger<PaymentService> _logger;
    private readonly IVnPayTool _vnPayTool;
    private readonly ISettingService _settingService;

    public PaymentService(
        IGenericRepository<Transaction> transactionRepo,
        IGenericRepository<UserCourse> userCourseRepo,
        IGenericRepository<Course> courseRepo,
        IConfiguration configuration,
        ILogger<PaymentService> logger,
        IVnPayTool vnPayTool,
        ISettingService settingService)
    {
        _transactionRepo = transactionRepo;
        _userCourseRepo = userCourseRepo;
        _courseRepo = courseRepo;
        _configuration = configuration;
        _logger = logger;
        _vnPayTool = vnPayTool;
        _settingService = settingService;
    }

    public async Task<string> CreatePaymentUrlAsync(int userId, PaymentRequestDto request, string ipAddress)
    {
        var course = await _courseRepo.GetByIdAsync(request.CourseId);
        if (course == null) throw new KeyNotFoundException("Course not found");

        if (course.Price == null || course.Price == 0)
        {
             // Free course flow handling could be here
        }

        // Check enrollment
        var isEnrolled = _userCourseRepo.GetAll()
            .Any(uc => uc.UserId == userId && uc.CourseId == request.CourseId && uc.Status == "Active");
        
        if (isEnrolled)
        {
             throw new InvalidOperationException("User already owns this course.");
        }

        var amount = course.Price.Value;
        var txnRef = DateTime.Now.Ticks.ToString();

        // Save pending transaction
        var transaction = new Transaction
        {
            UserId = userId,
            CourseId = course.Id,
            Amount = amount,
            OrderDescription = $"Mua khoa hoc: {course.Name}",
            TransactionRef = txnRef,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow,
            PaymentMethod = "VNPay"
        };

        await _transactionRepo.AddAsync(transaction);
        await _transactionRepo.SaveChangesAsync();

        // Build VNPay URL
        string vnp_Returnurl = await _settingService.GetAsync("Payment_Vnp_ReturnUrl", _configuration["VnPay:ReturnUrl"] ?? "");
        string vnp_Url = await _settingService.GetAsync("Payment_Vnp_BaseUrl", _configuration["VnPay:BaseUrl"] ?? ""); // Or hardcoded if standard
        string vnp_TmnCode = await _settingService.GetAsync("Payment_Vnp_TmnCode", _configuration["VnPay:TmnCode"] ?? "");
        string vnp_HashSecret = await _settingService.GetAsync("Payment_Vnp_HashSecret", _configuration["VnPay:HashSecret"] ?? "");

        if (string.IsNullOrEmpty(vnp_TmnCode) || string.IsNullOrEmpty(vnp_HashSecret))
        {
             throw new InvalidOperationException("VNPay configuration is missing");
        }

        // Use injected tool - Reset state just in case since it's transient/scoped
        _vnPayTool.ClearRequestData(); 

        _vnPayTool.AddRequestData("vnp_Version", "2.1.0");
        _vnPayTool.AddRequestData("vnp_Command", "pay");
        _vnPayTool.AddRequestData("vnp_TmnCode", vnp_TmnCode);
        _vnPayTool.AddRequestData("vnp_Amount", ((long)(amount * 100)).ToString()); // VNPay uses VND * 100
        
        _vnPayTool.AddRequestData("vnp_CreateDate", DateTime.Now.ToString("yyyyMMddHHmmss"));
        _vnPayTool.AddRequestData("vnp_CurrCode", "VND");
        _vnPayTool.AddRequestData("vnp_IpAddr", ipAddress);
        _vnPayTool.AddRequestData("vnp_Locale", "vn");
        _vnPayTool.AddRequestData("vnp_OrderInfo", transaction.OrderDescription);
        _vnPayTool.AddRequestData("vnp_OrderType", "other"); // or billpayment
        _vnPayTool.AddRequestData("vnp_ReturnUrl", vnp_Returnurl);
        _vnPayTool.AddRequestData("vnp_TxnRef", txnRef); // Reference Id

        string paymentUrl = _vnPayTool.CreateRequestUrl(vnp_Url, vnp_HashSecret);
        return paymentUrl;
    }

    public async Task<PaymentResultDto> ProcessPaymentCallbackAsync(IQueryCollection collections)
    {
        _vnPayTool.ClearRequestData();
        foreach (var (key, value) in collections)
        {
            if (!string.IsNullOrEmpty(key) && key.StartsWith("vnp_"))
            {
                _vnPayTool.AddResponseData(key, value.ToString());
            }
        }



        string vnp_HashSecret = await _settingService.GetAsync("Payment_Vnp_HashSecret", _configuration["VnPay:HashSecret"] ?? "");
        string vnp_SecureHash = collections["vnp_SecureHash"].ToString();
        string vnp_ResponseCode = _vnPayTool.GetResponseData("vnp_ResponseCode");
        string vnp_TxnRef = _vnPayTool.GetResponseData("vnp_TxnRef");
        string vnp_TransactionNo = _vnPayTool.GetResponseData("vnp_TransactionNo"); // Mã GD tại VNPAY
        string vnp_Amount = _vnPayTool.GetResponseData("vnp_Amount");

        bool checkSignature = _vnPayTool.ValidateSignature(vnp_SecureHash, vnp_HashSecret);

        if (!checkSignature)
        {
            return new PaymentResultDto
            {
                Success = false,
                Message = "Invalid Signature",
                TransactionRef = vnp_TxnRef
            };
        }

        // Find transaction
        // NOTE: We used GenericRepo, need to find by TxnRef. Assuming we fetch all or use LINQ.
        // Since GenericRepo exposes GetAll(), we use that.
        var transaction = _transactionRepo.GetAll().FirstOrDefault(x => x.TransactionRef == vnp_TxnRef);
        
        if (transaction == null)
        {
             return new PaymentResultDto { Success = false, Message = "Transaction not found", TransactionRef = vnp_TxnRef };
        }

        // Check if already processed
        if (transaction.Status == "Success")
        {
             return new PaymentResultDto { Success = true, Message = "Already Success", TransactionRef = vnp_TxnRef, CourseId = transaction.CourseId };
        }

        transaction.VnPayTransactionNo = vnp_TransactionNo;
        transaction.ResponseCode = vnp_ResponseCode;
        transaction.UpdatedAt = DateTime.UtcNow;

        if (vnp_ResponseCode == "00")
        {
            // Payment Success
            transaction.Status = "Success";
            await _transactionRepo.SaveChangesAsync(); // Save transaction status first

            // Enroll User
            var existingEnrollment = _userCourseRepo.GetAll()
                                        .FirstOrDefault(uc => uc.UserId == transaction.UserId && uc.CourseId == transaction.CourseId);
            
            if (existingEnrollment == null)
            {
                var enrollment = new UserCourse
                {
                    UserId = transaction.UserId,
                    CourseId = transaction.CourseId,
                    Status = "Active",
                    EnrollmentDate = DateTime.UtcNow,
                    ProgressPercentage = 0
                };
                await _userCourseRepo.AddAsync(enrollment);
                await _userCourseRepo.SaveChangesAsync();
            }

            return new PaymentResultDto 
            { 
                Success = true, 
                Message = "Payment Success", 
                TransactionRef = vnp_TxnRef,
                CourseId = transaction.CourseId,
                Amount = transaction.Amount
            };
        }
        else
        {
            // Payment Failed
            transaction.Status = "Failed";
            await _transactionRepo.SaveChangesAsync();

            return new PaymentResultDto 
            { 
                Success = false, 
                Message = $"Payment Failed (Code: {vnp_ResponseCode})", 
                TransactionRef = vnp_TxnRef,
                VnPayResponseCode = vnp_ResponseCode
            };
        }
    }
}
