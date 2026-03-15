using IeltsSelfStudy.Application.DTOs.Reports;
using System.Threading.Tasks;

namespace IeltsSelfStudy.Application.Interfaces;

public interface IReportService
{
    Task<OverviewReportDto> GetOverviewReportAsync(DateTime? startDate = null, DateTime? endDate = null);
    Task<TrendReportDto> GetTrendsReportAsync(string metric, string range, DateTime? startDate = null, DateTime? endDate = null);
    Task<byte[]> ExportRevenueToCsvAsync(DateTime? startDate = null, DateTime? endDate = null);
}
