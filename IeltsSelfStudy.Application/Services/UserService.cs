using IeltsSelfStudy.Application.DTOs.Users;
using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Domain.Entities;

namespace IeltsSelfStudy.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<List<UserDto>> GetAllAsync()
    {
        var users = await _userRepository.GetAllAsync();
        return users.Select(MapToDto).ToList();
    }

    public async Task<UserDto?> GetByIdAsync(int id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        return user is null ? null : MapToDto(user);
    }

    public async Task<UserDto> CreateAsync(CreateUserRequest request)
    {
        // Check email trùng
        var existing = await _userRepository.GetByEmailAsync(request.Email);
        if (existing != null)
        {
            // ném lỗi để Controller trả 400
            throw new InvalidOperationException("Email đã tồn tại.");
        }

        var user = new User
        {
            Email = request.Email,
            FullName = request.FullName,
            PasswordHash = request.Password, // sau này hash
            Role = string.IsNullOrWhiteSpace(request.Role) ? "Student" : request.Role,
            TargetBand = request.TargetBand,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();

        return MapToDto(user);
    }

    public async Task<UserDto?> UpdateAsync(int id, UpdateUserRequest request)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user is null) return null;

        user.FullName = request.FullName;
        user.Role = request.Role;
        user.TargetBand = request.TargetBand;
        user.IsActive = request.IsActive;

        _userRepository.Update(user);
        await _userRepository.SaveChangesAsync();

        return MapToDto(user);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user is null) return false;

        // XÓA MỀM: chỉ đánh dấu không còn hoạt động
        user.IsActive = false;

        _userRepository.Update(user);
        await _userRepository.SaveChangesAsync();

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
