// src/pages/manager/components/analytics/TeamUtilizationChart.tsx
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps } from 'recharts';
import { Assignment, Engineer } from '../../../../types';

interface TeamUtilizationChartProps {
  engineers: Engineer[];
  assignments: Assignment[];
}

// Custom tooltip component to format the data correctly
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
        <p className="font-medium">{`${label}`}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}%`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const TeamUtilizationChart: React.FC<TeamUtilizationChartProps> = ({ 
  engineers, 
  assignments 
}) => {
  // Calculate utilization data for the chart
  const chartData = useMemo(() => {
    return engineers.map(engineer => {
      // Get all active assignments for this engineer
      const engineerAssignments = assignments.filter(
        a => a.engineerId === engineer._id
      );
      
      // Calculate total allocated capacity
      const allocatedCapacity = engineerAssignments.reduce(
        (sum, assignment) => sum + assignment.allocationPercentage, 
        0
      );
      
      // Calculate available capacity
      const maxCapacity = engineer.maxCapacity || 100;
      const availableCapacity = Math.max(0, maxCapacity - allocatedCapacity);
      
      // Calculate overallocated capacity (if any)
      const overallocatedCapacity = Math.max(0, allocatedCapacity - maxCapacity);
      
      return {
        name: engineer.name,
        allocated: allocatedCapacity > maxCapacity ? maxCapacity : allocatedCapacity,
        available: availableCapacity,
        overallocated: overallocatedCapacity
      };
    });
  }, [engineers, assignments]);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Team Capacity Utilization</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} unit="%" />
            <YAxis dataKey="name" type="category" width={100} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="allocated" stackId="a" fill="#6366f1" name="Allocated" />
            <Bar dataKey="available" stackId="a" fill="#10b981" name="Available" />
            <Bar dataKey="overallocated" stackId="a" fill="#ef4444" name="Overallocated" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};