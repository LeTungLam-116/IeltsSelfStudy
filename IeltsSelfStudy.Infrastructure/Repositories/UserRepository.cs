using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Domain.Entities;
using IeltsSelfStudy.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace IeltsSelfStudy.Infrastructure.Repositories;

public class UserRepository : GenericRepository<User>, IUserRepository
{
    public UserRepository(IeltsDbContext context) : base(context)
    {
    }

    public Task<User?> GetByEmailAsync(string email)
        => _dbSet.FirstOrDefaultAsync(u => u.Email == email);
}
