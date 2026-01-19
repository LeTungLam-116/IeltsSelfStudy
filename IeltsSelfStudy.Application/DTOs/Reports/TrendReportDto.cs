using System.Collections.Generic;

namespace IeltsSelfStudy.Application.DTOs.Reports;

public class TrendReportDto
{
    public string Metric { get; set; } = string.Empty;
    public string Range { get; set; } = string.Empty;
    public List<TrendDataPointDto> Data { get; set; } = new();
}
