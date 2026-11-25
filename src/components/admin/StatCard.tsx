import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.FC<{ className?: string }>;
  color?: 'orange' | 'emerald' | 'amber' | 'blue' | 'purple';
  trend?: { value: string; isPositive: boolean };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'orange',
  trend,
}) => {
  const colorSchemes = {
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs hover:shadow-md transition-shadow min-w-0">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-stone-500 uppercase tracking-wider truncate min-w-0">
          {title}
        </span>
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0 ${colorSchemes[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3.5 min-w-0">
        <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight break-words">
          {value}
        </h3>
        {subtitle && (
          <p className="text-xs text-stone-500 mt-1 break-words">{subtitle}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold">
            <span
              className={`px-1.5 py-0.5 rounded-md ${
                trend.isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}
            >
              {trend.value}
            </span>
            <span className="text-stone-400">vs yesterday</span>
          </div>
        )}
      </div>
    </div>
  );
};
