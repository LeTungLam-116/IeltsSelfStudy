namespace IeltsSelfStudy.Application.DTOs.Reports;

public class TrendDataPointDto
{
    public string Date { get; set; } = string.Empty;
    public decimal Value { get; set; }
    public string? Label { get; set; }
}
