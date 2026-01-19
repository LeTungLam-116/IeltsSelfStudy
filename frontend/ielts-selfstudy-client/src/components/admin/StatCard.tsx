import React, { memo } from 'react';
import { Card } from '../ui';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  sparklineData?: number[];
}

const StatCard = memo(function StatCard({
  title,
  value,
  icon,
  change,
  changeType = 'neutral',
  sparklineData
}: StatCardProps) {
  const statId = `stat-${title.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <Card className="h-full" role="region" aria-labelledby={statId}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 id={statId} className="text-sm font-medium text-gray-600">{title}</h3>
          <p
            className="text-3xl font-bold text-gray-900 mt-1"
            aria-label={`${title}: ${value}`}
          >
            {value}
          </p>
          {change && (
            <p
              className={`text-sm mt-1 ${
                changeType === 'positive' ? 'text-green-600' :
                changeType === 'negative' ? 'text-red-600' :
                'text-gray-600'
              }`}
              aria-label={`Change: ${change}`}
            >
              {change}
            </p>
          )}
        </div>
        <div className="text-4xl text-gray-400 ml-4" aria-hidden="true">
          {icon}
        </div>
      </div>

      {sparklineData && sparklineData.length > 0 && (
        <div className="mt-4" aria-label={`Trend chart for ${title}`}>
          <div className="h-8 flex items-end justify-between space-x-1">
            {sparklineData.map((point, index) => {
              const height = Math.max(4, (point / Math.max(...sparklineData)) * 32);
              return (
                <div
                  key={index}
                  className="bg-blue-200 rounded-sm flex-1 min-w-1"
                  style={{ height: `${height}px` }}
                  aria-hidden="true"
                />
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
});

StatCard.displayName = 'StatCard';

export default StatCard;
