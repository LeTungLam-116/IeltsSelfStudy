using IeltsSelfStudy.Application.Interfaces;
using IeltsSelfStudy.Application.DTOs.Common;
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

    public async Task<(List<TEntity> Items, int TotalCount)> GetPagedAsync(
        PagedRequest request,
        Func<IQueryable<TEntity>, IQueryable<TEntity>>? filter = null,
        Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>>? orderBy = null)
    {
        var query = _dbSet.AsNoTracking().AsQueryable();

        // Apply filter if provided
        if (filter != null)
        {
            query = filter(query);
        }

        // Get total count before pagination
        var totalCount = await query.CountAsync();

        // Apply ordering if provided
        if (orderBy != null)
        {
            query = orderBy(query);
        }
        else
        {
            // Default ordering by ID if no orderBy provided
            // This assumes entities have an Id property
            // You may need to adjust this based on your entity structure
        }

        // Apply pagination
        var items = await query
            .Skip(request.Skip)
            .Take(request.PageSize)
            .ToListAsync();

        return (items, totalCount);
    }

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
