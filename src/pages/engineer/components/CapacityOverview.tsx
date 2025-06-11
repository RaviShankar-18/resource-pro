// src/pages/engineer/components/CapacityOverview.tsx
import React from 'react';
import { Assignment } from '../../../types';
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface CapacityOverviewProps {
  maxCapacity: number;
  usedCapacity: number;
  activeAssignments: Assignment[];
}

const CapacityOverview: React.FC<CapacityOverviewProps> = ({
  maxCapacity,
  usedCapacity,
  activeAssignments
}) => {
  const capacityPercentage = Math.min((usedCapacity / maxCapacity) * 100, 100);
  const availableCapacity = maxCapacity - usedCapacity;

  const getCapacityStatus = () => {
    if (usedCapacity > maxCapacity) return {
      status: 'Overloaded',
      color: 'bg-red-500',
      textColor: 'text-red-700',
      bgColor: 'bg-red-50',
      icon: AlertTriangle
    };
    if (capacityPercentage >= 80) return {
      status: 'High Usage',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
      icon: TrendingUp
    };
    if (capacityPercentage >= 60) return {
      status: 'Moderate Usage',
      color: 'bg-blue-500',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
      icon: TrendingUp
    };
    return {
      status: 'Available',
      color: 'bg-green-500',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
      icon: CheckCircle
    };
  };

  const statusInfo = getCapacityStatus();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Capacity Overview</h2>
        <div className={`flex items-center px-3 py-1 rounded-full ${statusInfo.bgColor}`}>
          <StatusIcon className={`h-4 w-4 mr-2 ${statusInfo.textColor}`} />
          <span className={`text-sm font-medium ${statusInfo.textColor}`}>
            {statusInfo.status}
          </span>
        </div>
      </div>

      {/* Capacity Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Capacity Usage</span>
          <span>{usedCapacity}% of {maxCapacity}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className={`h-4 rounded-full transition-all duration-300 ${statusInfo.color}`}
            style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
          />
        </div>
        {availableCapacity < 0 && (
          <p className="text-red-600 text-sm mt-1">
            ⚠️ Overallocated by {Math.abs(availableCapacity)}%
          </p>
        )}
      </div>

      {/* Active Assignments Breakdown */}
      {activeAssignments.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Active Assignments Breakdown
          </h3>
          <div className="space-y-3">
            {activeAssignments.map((assignment) => (
              <div key={assignment._id} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {assignment.project?.name || 'Unknown Project'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {assignment.role}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-sm font-medium text-gray-900">
                    {assignment.allocationPercentage}%
                  </div>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(assignment.allocationPercentage / maxCapacity) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CapacityOverview;