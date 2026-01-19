import { memo } from 'react';
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export interface ChartDataPoint {
  [key: string]: any;
}

export interface AreaChartProps {
  data: ChartDataPoint[];
  dataKey: string;
  xAxisKey: string;
  color?: string;
  height?: number;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

const AreaChart = memo(function AreaChart({
  data,
  dataKey,
  xAxisKey,
  color = '#10B981',
  height = 300,
  ariaLabel,
  ariaDescribedBy
}: AreaChartProps) {
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
        <RechartsAreaChart
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
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            fill={color}
            fillOpacity={0.1}
            strokeWidth={2}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
});

AreaChart.displayName = 'AreaChart';

export default AreaChart;
