using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace IeltsSelfStudy.Infrastructure.Repositories;

public class GenericRepository<TEntity> : IGenericRepository<TEntity>
    where TEntity : class
{
    protected readonly IeltsDbContext _context;
    protected readonly DbSet<TEntity> _dbSet;

    public GenericRepository(IeltsDbContext context)
    {
        _context = context;
        _dbSet = _context.Set<TEntity>();
    }

    public Task<List<TEntity>> GetAllAsync()
        => _dbSet.AsNoTracking().ToListAsync();

    public Task<TEntity?> GetByIdAsync(int id)
        => _dbSet.FindAsync(id).AsTask();

    public async Task AddAsync(TEntity entity)
    {
        await _dbSet.AddAsync(entity);
    }

    public void Update(TEntity entity)
    {
        _dbSet.Update(entity);
    }

    public void Delete(TEntity entity)
    {
        _dbSet.Remove(entity);
    }

    public Task SaveChangesAsync()
        => _context.SaveChangesAsync();
}
