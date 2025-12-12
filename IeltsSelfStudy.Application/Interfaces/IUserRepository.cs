using IeltsSelfStudy.Domain.Entities;

namespace IeltsSelfStudy.Application.Interfaces;

public interface IUserRepository : IGenericRepository<User>
{
    Task<User?> GetByEmailAsync(string email);
}
