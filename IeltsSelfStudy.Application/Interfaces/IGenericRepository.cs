using IeltsSelfStudy.Application.DTOs.Common;

public interface IGenericRepository<TEntity> where TEntity : class
{
    Task<List<TEntity>> GetAllAsync();
    Task<TEntity?> GetByIdAsync(int id);
    
    // Pagination method
    Task<(List<TEntity> Items, int TotalCount)> GetPagedAsync(
        PagedRequest request,
        Func<IQueryable<TEntity>, IQueryable<TEntity>>? filter = null,
        Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>>? orderBy = null);

    Task AddAsync(TEntity entity);
    void Update(TEntity entity);
    void Delete(TEntity entity);

    Task SaveChangesAsync();
}
