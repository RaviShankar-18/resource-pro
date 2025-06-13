// src/pages/engineer/components/calendar/SimpleCapacityCalendar.tsx
import React from 'react';
import { Assignment } from '../../../../types';

interface SimpleCapacityCalendarProps {
  assignments: Assignment[];
  numberOfWeeks?: number;
}

const SimpleCapacityCalendar: React.FC<SimpleCapacityCalendarProps> = ({ 
  assignments, 
  numberOfWeeks = 12 
}) => {
  const today = new Date();
  
  // Generate weeks for calendar
  const weeks = [];
  for (let i = 0; i < numberOfWeeks; i++) {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() + (i * 7));
    weeks.push({
      startDate: weekStart,
      endDate: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6),
      weekNumber: i + 1,
      allocation: 0,
      assignments: []
    });
  }
  
  // Calculate allocation per week
  assignments.forEach(assignment => {
    const startDate = new Date(assignment.startDate);
    const endDate = new Date(assignment.endDate);
    
    weeks.forEach(week => {
      // Check if assignment overlaps with this week
      if (startDate <= week.endDate && endDate >= week.startDate) {
        week.allocation += assignment.allocationPercentage;
        week.assignments.push({
          id: assignment._id,
          projectName: assignment.project?.name || 'Unknown Project',
          allocation: assignment.allocationPercentage,
          role: assignment.role
        });
      }
    });
  });
  
  // Format date to short format
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Determine color based on allocation
  const getAllocationColor = (allocation: number): string => {
    if (allocation === 0) return 'bg-gray-100';
    if (allocation <= 50) return 'bg-green-100';
    if (allocation <= 80) return 'bg-blue-100';
    if (allocation <= 100) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Capacity Forecast</h3>
      
      <div className="overflow-x-auto">
        <div className="min-w-max">
          <div className="grid grid-cols-12 gap-2 mb-2">
            {weeks.slice(0, 12).map((week, index) => (
              <div key={index} className="text-xs text-gray-500 text-center">
                {formatDate(week.startDate)}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-12 gap-2">
            {weeks.slice(0, 12).map((week, index) => (
              <div 
                key={index} 
                className={`rounded-md h-16 ${getAllocationColor(week.allocation)} relative group`}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-medium text-sm">
                    {week.allocation}%
                  </span>
                </div>
                
                {/* Tooltip on hover */}
                <div className="hidden group-hover:block absolute z-10 bg-white p-3 rounded-lg shadow-lg border border-gray-200 w-48 top-full left-1/2 transform -translate-x-1/2 mt-2">
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    Week of {formatDate(week.startDate)}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    Total allocation: {week.allocation}%
                  </div>
                  
                  {week.assignments.length > 0 ? (
                    <div className="space-y-1.5">
                      {week.assignments.map((assignment, idx) => (
                        <div key={idx} className="flex justify-between text-xs">
                          <span className="text-gray-700">{assignment.projectName}</span>
                          <span className="font-medium">{assignment.allocation}%</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 italic">No assignments</div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-12 gap-2 mt-2">
            {weeks.slice(0, 12).map((week, index) => (
              <div key={index} className="text-xs text-gray-500 text-center">
                Week {week.weekNumber}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-end space-x-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-100 rounded mr-1"></div>
          <span className="text-xs text-gray-500">0-50%</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-100 rounded mr-1"></div>
          <span className="text-xs text-gray-500">51-80%</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-100 rounded mr-1"></div>
          <span className="text-xs text-gray-500">81-100%</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-100 rounded mr-1"></div>
          <span className="text-xs text-gray-500">Over 100%</span>
        </div>
      </div>
    </div>
  );
};

export default SimpleCapacityCalendar;