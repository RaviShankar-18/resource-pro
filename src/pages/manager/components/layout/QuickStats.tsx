import React from 'react';
import { Users, Briefcase, Calendar, AlertCircle } from 'lucide-react';
import { Engineer, Project, Assignment } from '../../../../types'; // Updated import

interface QuickStatsProps {
  engineers: Engineer[];
  projects: Project[];
  assignments: Assignment[];
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className={`flex-shrink-0 ${color} rounded-md p-3`}>
        {icon}
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-lg font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

export const QuickStats: React.FC<QuickStatsProps> = ({
  engineers,
  projects,
  assignments
}) => {
  // Calculate stats
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const totalEngineers = engineers.length;
  
  // Calculate overloaded engineers using currentAllocation
  const overloadedEngineers = engineers.filter(engineer => {
    // If currentAllocation is already calculated, use it
    if (engineer.currentAllocation !== undefined) {
      return engineer.currentAllocation > 80;
    }
    
    // Otherwise calculate it
    const allocation = assignments
      .filter(a => a.engineerId === engineer._id)
      .reduce((sum, a) => sum + a.allocationPercentage, 0);
    return allocation > 80;
  }).length;

  // Calculate average utilization
  const totalCapacity = engineers.reduce((sum, eng) => sum + (eng.maxCapacity || 100), 0);
  const totalAllocated = engineers.reduce((sum, eng) => sum + (eng.currentAllocation || 0), 0);
  const avgUtilization = totalCapacity > 0 ? Math.round((totalAllocated / totalCapacity) * 100) : 0;

  const stats = [
    {
      title: "Total Engineers",
      value: totalEngineers,
      icon: <Users className="h-6 w-6 text-white" />,
      color: "bg-indigo-500"
    },
    {
      title: "Active Projects",
      value: activeProjects,
      icon: <Briefcase className="h-6 w-6 text-white" />,
      color: "bg-green-500"
    },
    {
      title: "Total Assignments",
      value: assignments.length,
      icon: <Calendar className="h-6 w-6 text-white" />,
      color: "bg-yellow-500"
    },
    {
      title: "Overloaded Engineers",
      value: overloadedEngineers,
      icon: <AlertCircle className="h-6 w-6 text-white" />,
      color: "bg-red-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
        />
      ))}
    </div>
  );
};