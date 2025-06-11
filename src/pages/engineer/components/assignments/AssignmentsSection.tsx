// src/pages/engineer/components/assignments/AssignmentsSection.tsx
import React from 'react';
import { Assignment } from '../../../../types';
import AssignmentCard from './AssignmentCard';

interface AssignmentsSectionProps {
  activeAssignments: Assignment[];
  upcomingAssignments: Assignment[];
  pastAssignments: Assignment[];
  onAssignmentClick?: (assignment: Assignment) => void;
}

const AssignmentsSection: React.FC<AssignmentsSectionProps> = ({
  activeAssignments,
  upcomingAssignments,
  pastAssignments,
  onAssignmentClick
}) => {
  return (
    <div className="space-y-8">
      {/* Active Assignments */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Assignments</h2>
        {activeAssignments.length > 0 ? (
          <div className="space-y-4">
            {activeAssignments.map((assignment) => (
              <div key={assignment._id} onClick={() => onAssignmentClick?.(assignment)}>
                <AssignmentCard 
                  assignment={assignment} 
                  project={assignment.project}
                  type="active"
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No active assignments</p>
        )}
      </div>

      {/* Upcoming Assignments */}
      {upcomingAssignments.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Assignments</h2>
          <div className="space-y-4">
            {upcomingAssignments.map((assignment) => (
              <div key={assignment._id} onClick={() => onAssignmentClick?.(assignment)}>
                <AssignmentCard 
                  assignment={assignment} 
                  project={assignment.project}
                  type="upcoming"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Assignments */}
      {pastAssignments.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Past Assignments</h2>
          <div className="space-y-4">
            {pastAssignments.slice(0, 3).map((assignment) => (
              <div key={assignment._id} onClick={() => onAssignmentClick?.(assignment)}>
                <AssignmentCard 
                  assignment={assignment} 
                  project={assignment.project}
                  type="past"
                />
              </div>
            ))}
          </div>
          {pastAssignments.length > 3 && (
            <p className="text-gray-500 text-center mt-4">
              And {pastAssignments.length - 3} more completed assignments...
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AssignmentsSection;