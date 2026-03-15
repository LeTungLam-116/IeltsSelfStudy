import httpClient from "./httpClient";
import type { OverviewReportDto } from "../types/report";

export interface TrendDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface TrendReportDto {
  metric: string;
  range: string;
  data: TrendDataPoint[];
}

export async function getOverviewReport(startDate?: string, endDate?: string): Promise<OverviewReportDto> {
  const res = await httpClient.get<OverviewReportDto>('/reports/overview', {
    params: { startDate, endDate }
  });
  return res.data;
}

export async function getReportTrends(metric: string, range: string = '30d', startDate?: string, endDate?: string): Promise<TrendReportDto> {
  const res = await httpClient.get<TrendReportDto>('/reports/trends', {
    params: { metric, range, startDate, endDate }
  });
  return res.data;
}

export async function downloadRevenueReportCsv(startDate?: string, endDate?: string): Promise<void> {
  const res = await httpClient.get('/reports/export/revenue', {
    params: { startDate, endDate },
    responseType: 'blob'
  });

  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `RevenueReport_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}
