import React from 'react';
import { CheckCircle, Circle, Clock } from 'lucide-react';

interface ProgressStep {
  id: string;
  label: string;
  status: 'completed' | 'current' | 'upcoming';
  date?: string;
}

interface ProgressTrackerProps {
  steps: ProgressStep[];
  title?: string;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ steps, title = "Your Progress" }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start">
            <div className="flex-shrink-0">
              {step.status === 'completed' ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : step.status === 'current' ? (
                <Clock className="w-6 h-6 text-blue-500" />
              ) : (
                <Circle className="w-6 h-6 text-gray-300" />
              )}
            </div>
            <div className="ml-3 flex-1">
              <p className={`text-sm font-medium ${
                step.status === 'completed' ? 'text-gray-900' :
                step.status === 'current' ? 'text-blue-600' :
                'text-gray-400'
              }`}>
                {step.label}
              </p>
              {step.date && (
                <p className="text-xs text-gray-500 mt-1">{step.date}</p>
              )}
            </div>
            {index < steps.length - 1 && (
              <div className="absolute left-3 top-8 w-0.5 h-8 bg-gray-200" style={{ marginLeft: '12px' }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

interface SessionProgressProps {
  totalSessions: number;
  completedSessions: number;
  upcomingSessions: number;
}

export const SessionProgress: React.FC<SessionProgressProps> = ({
  totalSessions,
  completedSessions,
  upcomingSessions
}) => {
  const percentage = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Session Progress</h3>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium">{completedSessions} / {totalSessions} sessions</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{completedSessions}</p>
          <p className="text-xs text-gray-600">Completed</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{upcomingSessions}</p>
          <p className="text-xs text-gray-600">Upcoming</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-600">{totalSessions}</p>
          <p className="text-xs text-gray-600">Total</p>
        </div>
      </div>
    </div>
  );
};

interface MilestoneProps {
  milestones: {
    id: string;
    title: string;
    description: string;
    achieved: boolean;
    date?: string;
  }[];
}

export const MilestoneTracker: React.FC<MilestoneProps> = ({ milestones }) => {
  const achievedCount = milestones.filter(m => m.achieved).length;
  const percentage = (achievedCount / milestones.length) * 100;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Milestones</h3>
        <span className="text-sm text-gray-600">{achievedCount} / {milestones.length}</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-green-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="space-y-3">
        {milestones.map((milestone) => (
          <div
            key={milestone.id}
            className={`p-3 rounded-lg border ${
              milestone.achieved
                ? 'bg-green-50 border-green-200'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                {milestone.achieved ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div className="ml-3 flex-1">
                <p className={`text-sm font-medium ${
                  milestone.achieved ? 'text-gray-900' : 'text-gray-600'
                }`}>
                  {milestone.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">{milestone.description}</p>
                {milestone.date && (
                  <p className="text-xs text-gray-400 mt-1">{milestone.date}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
