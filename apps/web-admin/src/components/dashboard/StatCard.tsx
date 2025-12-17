'use client';

import { clsx } from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: string;
  trend?: 'up' | 'down';
}

export function StatCard({ title, value, change, icon, trend }: StatCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          
          {change !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={clsx(
                  'text-sm font-medium',
                  trend === 'up' ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend === 'up' ? '↑' : '↓'} {Math.abs(change)}%
              </span>
              <span className="text-xs text-gray-500">vs last month</span>
            </div>
          )}
        </div>
        
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50 text-2xl">
          {icon}
        </div>
      </div>
    </div>
  );
}
