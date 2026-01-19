using IeltsSelfStudy.Application.DTOs.Reports;
using System.Threading.Tasks;

namespace IeltsSelfStudy.Application.Interfaces;

public interface IReportService
{
    Task<OverviewReportDto> GetOverviewReportAsync();
    Task<TrendReportDto> GetTrendsReportAsync(string metric, string range);
}
