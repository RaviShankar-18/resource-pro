// src/pages/manager/components/analytics/SkillsGapAnalysis.tsx
import React, { useMemo } from 'react';
import { Engineer, Project } from '../../../../types';

interface SkillsGapAnalysisProps {
  engineers: Engineer[];
  projects: Project[];
}

export const SkillsGapAnalysis: React.FC<SkillsGapAnalysisProps> = ({ 
  engineers, 
  projects 
}) => {
  // Calculate the skills gap
  const skillsGapData = useMemo(() => {
    // Get all required skills from active and planning projects
    const activeProjects = projects.filter(p => 
      p.status === 'active' || p.status === 'planning'
    );
    
    // Collect and count required skills
    const requiredSkills: Record<string, number> = {};
    activeProjects.forEach(project => {
      project.requiredSkills.forEach(skill => {
        requiredSkills[skill] = (requiredSkills[skill] || 0) + 1;
      });
    });
    
    // Count available skills in the team
    const availableSkills: Record<string, number> = {};
    engineers.forEach(engineer => {
      engineer.skills.forEach(skill => {
        availableSkills[skill] = (availableSkills[skill] || 0) + 1;
      });
    });
    
    // Calculate the gap
    const allSkills = [...new Set([
      ...Object.keys(requiredSkills),
      ...Object.keys(availableSkills)
    ])];
    
    return allSkills.map(skill => ({
      skill,
      required: requiredSkills[skill] || 0,
      available: availableSkills[skill] || 0,
      gap: (requiredSkills[skill] || 0) - (availableSkills[skill] || 0)
    }))
    .filter(item => item.required > 0) // Only show skills that are required
    .sort((a, b) => b.gap - a.gap); // Sort by largest gap first
  }, [engineers, projects]);

  // Find skills with a gap
  const skillsWithGap = skillsGapData.filter(item => item.gap > 0);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Skills Gap Analysis</h3>
      
      {skillsWithGap.length > 0 ? (
        <>
          <p className="text-sm text-gray-600 mb-4">
            The following skills have demand that exceeds current team capacity:
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Skill</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Required</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gap</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {skillsWithGap.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.skill}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.required}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.available}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        {item.gap} needed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="text-center p-6">
          <p className="text-green-600 font-medium">All project skill requirements are covered!</p>
          <p className="text-sm text-gray-600 mt-2">Your team has sufficient skills for all current projects.</p>
        </div>
      )}
    </div>
  );
};