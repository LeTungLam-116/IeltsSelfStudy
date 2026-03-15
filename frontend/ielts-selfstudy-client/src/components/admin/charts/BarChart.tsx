import { memo } from 'react';
import {
    BarChart as RechartsBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

export interface ChartDataPoint {
    [key: string]: any;
}

export interface BarChartProps {
    data: ChartDataPoint[];
    dataKey: string;
    xAxisKey: string;
    color?: string;
    height?: number;
    ariaLabel?: string;
    ariaDescribedBy?: string;
}

const BarChart = memo(function BarChart({
    data,
    dataKey,
    xAxisKey,
    color = '#3B82F6',
    height = 300,
    ariaLabel,
    ariaDescribedBy
}: BarChartProps) {
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
                <RechartsBarChart
                    data={data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
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
                    <Bar
                        dataKey={dataKey}
                        fill={color}
                        radius={[4, 4, 0, 0]}
                        maxBarSize={50}
                    />
                </RechartsBarChart>
            </ResponsiveContainer>
        </div>
    );
});

BarChart.displayName = 'BarChart';

export default BarChart;
