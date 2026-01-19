using System.Collections.Generic;

namespace IeltsSelfStudy.Application.DTOs.Attempts;

public class PagedAttemptResponseDto
{
    public IEnumerable<AttemptDto> Items { get; set; } = new List<AttemptDto>();

    public int PageNumber { get; set; }

    public int PageSize { get; set; }

    public int TotalCount { get; set; }

    public int TotalPages { get; set; }

    public bool HasNextPage => PageNumber < TotalPages;

    public bool HasPreviousPage => PageNumber > 1;
}
