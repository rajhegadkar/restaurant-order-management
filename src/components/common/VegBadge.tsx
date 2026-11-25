import React from 'react';

interface VegBadgeProps {
  isVeg: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const VegBadge: React.FC<VegBadgeProps> = ({ isVeg, size = 'sm', showLabel = false }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 p-[2px]',
    md: 'w-5 h-5 p-[2.5px]',
    lg: 'w-6 h-6 p-[3px]',
  };

  const dotClasses = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  return (
    <div className="inline-flex items-center gap-1.5" title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}>
      <div
        className={`border-2 rounded flex items-center justify-center shrink-0 ${
          isVeg ? 'border-emerald-600' : 'border-rose-600'
        } ${sizeClasses[size]}`}
      >
        <div
          className={`rounded-full ${
            isVeg ? 'bg-emerald-600' : 'bg-rose-600'
          } ${dotClasses[size]}`}
        />
      </div>
      {showLabel && (
        <span
          className={`text-xs font-semibold ${
            isVeg ? 'text-emerald-700' : 'text-rose-700'
          }`}
        >
          {isVeg ? 'Pure Veg' : 'Non-Veg'}
        </span>
      )}
    </div>
  );
};
