import { memo } from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export interface ChartDataPoint {
  [key: string]: any;
}

export interface LineChartProps {
  data: ChartDataPoint[];
  dataKey: string;
  xAxisKey: string;
  color?: string;
  height?: number;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

const LineChart = memo(function LineChart({
  data,
  dataKey,
  xAxisKey,
  color = '#3B82F6',
  height = 300,
  ariaLabel,
  ariaDescribedBy
}: LineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-gray-400"
        style={{ height: `${height}px` }}
        role="img"
        aria-label={ariaLabel || "No data available for chart"}
      >
        No data available
      </div>
    );
  }

  return (
    <div
      style={{ height: `${height}px` }}
      role="img"
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey={xAxisKey}
            stroke="#6B7280"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            stroke="#6B7280"
            fontSize={12}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              fontSize: '12px'
            }}
            labelStyle={{ color: '#374151', fontWeight: '500' }}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: color, strokeWidth: 2, fill: 'white' }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
});

LineChart.displayName = 'LineChart';

export default LineChart;
