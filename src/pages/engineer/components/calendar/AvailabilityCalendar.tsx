// This will go in src/pages/engineer/components/calendar/AvailabilityCalendar.tsx
import React from 'react';
import { Assignment } from '../../../../types';

interface AvailabilityCalendarProps {
  assignments: Assignment[];
  capacity: {
    maxCapacity: number;
    allocatedCapacity: number;
  } | null;
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  assignments,
  capacity
}) => {
  // Helper function to generate a date range (current month + next 2 months)
  const generateDateRange = () => {
    const result = [];
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Create 3-month range
    for (let i = 0; i < 90; i++) {
      const date = new Date(startOfMonth);
      date.setDate(date.getDate() + i);
      result.push(date);
    }
    
    return result;
  };

  const dateRange = generateDateRange();
  
  // Check allocation for a specific date
  const getAllocationForDate = (date: Date) => {
    return assignments.reduce((total, assignment) => {
      const startDate = new Date(assignment.startDate);
      const endDate = new Date(assignment.endDate);
      
      if (date >= startDate && date <= endDate) {
        return total + assignment.allocationPercentage;
      }
      return total;
    }, 0);
  };
  
  // Generate color for allocation
  const getAllocationColor = (allocation: number) => {
    const maxCap = capacity?.maxCapacity || 100;
    
    if (allocation >= maxCap) return 'bg-red-500';
    if (allocation >= maxCap * 0.8) return 'bg-yellow-500';
    if (allocation > 0) return 'bg-green-500';
    return 'bg-gray-200';
  };
  
  const formatMonthHeader = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  
  // Group dates by month
  const datesByMonth: { [key: string]: Date[] } = {};
  dateRange.forEach(date => {
    const monthKey = formatMonthHeader(date);
    if (!datesByMonth[monthKey]) {
      datesByMonth[monthKey] = [];
    }
    datesByMonth[monthKey].push(date);
  });

  return (
    <div className="bg-white rounded-lg shadow mb-8">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">My Availability Calendar</h2>
        <p className="text-sm text-gray-500">3-month view of your assignment schedule</p>
      </div>
      <div className="p-6 overflow-x-auto">
        {Object.entries(datesByMonth).map(([month, dates]) => (
          <div key={month} className="mb-6">
            <h3 className="text-md font-medium mb-2">{month}</h3>
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-xs text-center text-gray-500 pb-1">
                  {day}
                </div>
              ))}
              
              {/* Empty spaces for first week */}
              {Array.from({ length: dates[0].getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="h-8" />
              ))}
              
              {/* Calendar days */}
              {dates.map(date => {
                const allocation = getAllocationForDate(date);
                const today = new Date();
                const isToday = date.getDate() === today.getDate() && 
                               date.getMonth() === today.getMonth() && 
                               date.getFullYear() === today.getFullYear();
                               
                return (
                  <div 
                    key={date.toISOString()} 
                    className="h-8 text-xs relative flex flex-col items-center"
                    title={`${date.toLocaleDateString()}: ${allocation}% allocated`}
                  >
                    <span className={`${
                      isToday
                        ? 'bg-blue-100 text-blue-800 font-medium rounded-full h-6 w-6 flex items-center justify-center' 
                        : ''
                    }`}>
                      {date.getDate()}
                    </span>
                    <div 
                      className={`w-full h-1.5 mt-0.5 rounded-sm ${getAllocationColor(allocation)}`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="px-6 pb-4">
        <div className="flex items-center justify-end space-x-4 text-xs text-gray-500">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-200 rounded-sm mr-1"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-sm mr-1"></div>
            <span>Allocated</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-sm mr-1"></div>
            <span>High Allocation</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-sm mr-1"></div>
            <span>Fully Allocated</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;