import React from 'react';
import { Assignment } from '../../../types';
import { User, Briefcase, Calendar, Clock } from 'lucide-react';

interface EngineerStatsProps {
  activeAssignments: Assignment[];
  upcomingAssignments: Assignment[];
  capacity: any;
}

const EngineerStats: React.FC<EngineerStatsProps> = ({
  activeAssignments,
  upcomingAssignments,
  capacity,
}) => {
  const getCapacityColor = (used: number, max: number) => {
    const percentage = (used / max) * 100;
    if (percentage >= 100) return 'text-red-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getCapacityBgColor = (used: number, max: number) => {
    const percentage = (used / max) * 100;
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const capacityUsed = capacity?.allocatedCapacity || 0;
  const maxCapacity = capacity?.maxCapacity || 100;
  const capacityPercentage = Math.min((capacityUsed / maxCapacity) * 100, 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Role */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Role</dt>
                <dd className="text-lg font-semibold text-gray-900">Engineer</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Active Projects */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Active Projects</dt>
                <dd className="text-lg font-semibold text-gray-900">{activeAssignments.length}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Upcoming</dt>
                <dd className="text-lg font-semibold text-gray-900">{upcomingAssignments.length}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Capacity Used */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Capacity Used</dt>
                <dd className={`text-lg font-semibold ${getCapacityColor(capacityUsed, maxCapacity)}`}>
                  {Math.round(capacityPercentage)}%
                </dd>
              </dl>
            </div>
          </div>
          {/* Capacity Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getCapacityBgColor(capacityUsed, maxCapacity)}`}
                style={{ width: `${capacityPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{capacityUsed}% used</span>
              <span>{capacity?.availableCapacity || 0}% available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngineerStats;