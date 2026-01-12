namespace IeltsSelfStudy.Application.DTOs.Common;

public class PagedRequest
{
    private const int MaxPageSize = 100;
    private const int DefaultPageSize = 10;
    private const int DefaultPageNumber = 1;

    private int _pageNumber = DefaultPageNumber;
    private int _pageSize = DefaultPageSize;

    /// <summary>
    /// Số trang (bắt đầu từ 1)
    /// </summary>
    public int PageNumber
    {
        get => _pageNumber;
        set => _pageNumber = value < 1 ? DefaultPageNumber : value;
    }

    /// <summary>
    /// Số items mỗi trang (tối đa 100)
    /// </summary>
    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value < 1 ? DefaultPageSize : (value > MaxPageSize ? MaxPageSize : value);
    }

    /// <summary>
    /// Số items bỏ qua (Skip)
    /// </summary>
    public int Skip => (PageNumber - 1) * PageSize;
}

public class PagedResponse<T>
{
    public List<T> Items { get; set; } = new();
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;

    public PagedResponse(List<T> items, int totalCount, PagedRequest request)
    {
        Items = items;
        TotalCount = totalCount;
        PageNumber = request.PageNumber;
        PageSize = request.PageSize;
    }
}