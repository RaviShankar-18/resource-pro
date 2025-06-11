// src/pages/manager/components/analytics/SkillsDistributionChart.tsx
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Engineer } from '../../../../types';

interface SkillsDistributionChartProps {
  engineers: Engineer[];
}

export const SkillsDistributionChart: React.FC<SkillsDistributionChartProps> = ({ engineers }) => {
  // Calculate skills distribution
  const skillsData = useMemo(() => {
    // Get all skills across all engineers
    const allSkills = engineers.flatMap(engineer => engineer.skills);
    
    // Count occurrences of each skill
    const skillCounts: Record<string, number> = {};
    allSkills.forEach(skill => {
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    });
    
    // Convert to array for the chart
    return Object.entries(skillCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value) // Sort by most common
      .slice(0, 8); // Only show top 8 skills
  }, [engineers]);

  // Colors for the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Team Skills Distribution</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={skillsData}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            >
              {skillsData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${value} engineers`, 'Count']}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};