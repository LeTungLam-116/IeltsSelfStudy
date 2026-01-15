using IeltsSelfStudy.Application.DTOs.Users;
using IeltsSelfStudy.Application.DTOs.Common;
using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace IeltsSelfStudy.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly ILogger<UserService> _logger;

    public UserService(
        IUserRepository userRepository,
        ILogger<UserService> logger)
    {
        _userRepository = userRepository;
        _logger = logger;
    }

    public async Task<List<UserDto>> GetAllAsync()
    {
        _logger.LogInformation("Getting all users");
        var users = await _userRepository.GetAllAsync();
        _logger.LogInformation("Retrieved {Count} users", users.Count);
        return users.Select(MapToDto).ToList();
    }

    public async Task<PagedResponse<UserDto>> GetPagedAsync(PagedRequest request)
    {
        _logger.LogInformation("Getting paged users. PageNumber: {PageNumber}, PageSize: {PageSize}",
            request.PageNumber, request.PageSize);

        var (items, totalCount) = await _userRepository.GetPagedAsync(
            request,
            filter: q => q.Where(u => u.IsActive),
            orderBy: q => q.OrderByDescending(u => u.CreatedAt)
        );

        var dtos = items.Select(MapToDto).ToList();

        _logger.LogInformation("Retrieved {Count} users (Page {PageNumber}/{TotalPages})",
            dtos.Count, request.PageNumber, (int)Math.Ceiling(totalCount / (double)request.PageSize));

        return new PagedResponse<UserDto>(dtos, totalCount, request);
    }

    

    public async Task<UserDto?> GetByIdAsync(int id)
    {
        _logger.LogInformation("Getting user by ID: {Id}", id);
        var user = await _userRepository.GetByIdAsync(id);

        _logger.LogInformation("User found: {Found}", user != null);
        return user is null ? null : MapToDto(user);
    }

    public async Task<UserDto> CreateAsync(CreateUserRequest request)
    {
        _logger.LogInformation("Creating user with email: {Email}", request.Email);
        // Check email trùng
        var existing = await _userRepository.GetByEmailAsync(request.Email);
        if (existing != null)
        {
            _logger.LogWarning("Email {Email} already exists", request.Email);
            throw new InvalidOperationException("Email đã tồn tại.");
        }

        // Hash password
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var user = new User
        {
            Email = request.Email,
            FullName = request.FullName,
            PasswordHash = passwordHash, // Đã hash
            Role = string.IsNullOrWhiteSpace(request.Role) ? "Student" : request.Role,
            TargetBand = request.TargetBand,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();

        _logger.LogInformation("User created with ID: {Id}", user.Id);
        return MapToDto(user);
    }

    public async Task<UserDto?> UpdateAsync(int id, UpdateUserRequest request)
    {
        _logger.LogInformation("Updating user with ID: {Id}", id);
        var user = await _userRepository.GetByIdAsync(id);
        if (user is null) return null;

        user.FullName = request.FullName;
        user.Role = request.Role;
        user.TargetBand = request.TargetBand;
        user.IsActive = request.IsActive;

        _userRepository.Update(user);
        await _userRepository.SaveChangesAsync();

        _logger.LogInformation("User with ID: {Id} updated successfully", id);
        return MapToDto(user);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        _logger.LogInformation("Deleting user with ID: {Id}", id);
        var user = await _userRepository.GetByIdAsync(id);
        if (user is null)
        {
            _logger.LogWarning("Delete failed: User with ID {UserId} not found", id);
            return false;
        }

        _logger.LogInformation("Soft deleting user with ID: {Id}", id);
        // XÓA MỀM: chỉ đánh dấu không còn hoạt động
        user.IsActive = false;

        _userRepository.Update(user);
        await _userRepository.SaveChangesAsync();
        _logger.LogInformation("User with ID: {Id} soft deleted successfully", id);
        return true;
    }

    private static UserDto MapToDto(User u) =>
        new()
        {
            Id = u.Id,
            Email = u.Email,
            FullName = u.FullName,
            Role = u.Role,
            TargetBand = u.TargetBand,
            IsActive = u.IsActive,
            CreatedAt = u.CreatedAt
        };
}
