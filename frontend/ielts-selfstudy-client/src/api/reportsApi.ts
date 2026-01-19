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

export async function getOverviewReport(): Promise<OverviewReportDto> {
  const res = await httpClient.get<OverviewReportDto>('/reports/overview');
  return res.data;
}

export async function getReportTrends(metric: string, range: string = '30d'): Promise<TrendReportDto> {
  const res = await httpClient.get<TrendReportDto>('/reports/trends', {
    params: { metric, range }
  });
  return res.data;
}
