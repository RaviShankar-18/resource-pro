import React from 'react';

interface CapacityBarProps {
  percentage: number;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const CapacityBar: React.FC<CapacityBarProps> = ({
  percentage,
  showText = true,
  size = 'md'
}) => {
  const getColor = () => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    if (percentage >= 60) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getTextColor = () => {
    if (percentage >= 100) return 'text-red-700 bg-red-50';
    if (percentage >= 80) return 'text-yellow-700 bg-yellow-50';
    if (percentage >= 60) return 'text-blue-700 bg-blue-50';
    return 'text-green-700 bg-green-50';
  };

  const getHeight = () => {
    switch (size) {
      case 'sm': return 'h-2';
      case 'lg': return 'h-4';
      default: return 'h-3';
    }
  };

  return (
    <div className="space-y-1">
      {showText && (
        <div className={`text-sm font-medium px-2 py-1 rounded inline-block ${getTextColor()}`}>
          {percentage}%
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${getHeight()}`}>
        <div
          className={`${getHeight()} rounded-full transition-all duration-300 ${getColor()}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};