using IeltsSelfStudy.Application.DTOs.Common;
using IeltsSelfStudy.Domain.Entities;
using System.Linq.Expressions;

public interface IGenericRepository<TEntity> where TEntity : class
{
    Task<List<TEntity>> GetAllAsync();
    Task<TEntity?> GetByIdAsync(int id);

    // Pagination method
    Task<(List<TEntity> Items, int TotalCount)> GetPagedAsync(
        PagedRequest request,
        Func<IQueryable<TEntity>, IQueryable<TEntity>>? filter = null,
        Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>>? orderBy = null);

    // Expose IQueryable for advanced LINQ queries
    IQueryable<TEntity> GetAll();

    Task AddAsync(TEntity entity);
    void Update(TEntity entity);
    void Delete(TEntity entity);

    Task SaveChangesAsync();

    /// <summary>
    /// Execute an action inside a database transaction. Implementation should begin a transaction,
    /// execute the provided delegate, commit on success or rollback on exception.
    /// This provides a persistence-agnostic transactional helper for application services.
    /// </summary>
    Task ExecuteInTransactionAsync(Func<Task> action);

    // Sorting helper
    IOrderedQueryable<TEntity> ApplySorting(IQueryable<TEntity> query, PagedRequest request);
}
