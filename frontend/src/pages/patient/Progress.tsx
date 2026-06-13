import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/hooks/useApi';
import { ProgressTracker, SessionProgress, MilestoneTracker } from '../../components/ProgressTracker';
import { calculateProgress, generateMilestones, generateJourneySteps } from '../../hooks/useProgress';
import { TrendingUp, Calendar, Award, Target, Clock, Zap } from 'lucide-react';

export default function Progress() {
  const { user } = useAuth();
  const api = useApi();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAssessment, setHasAssessment] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch appointments
      const appointmentsData = await api.get('/appointments/');
      const appointmentsList = Array.isArray(appointmentsData) 
        ? appointmentsData 
        : (appointmentsData?.results || []);
      setAppointments(appointmentsList);

      // Check if user has taken assessment
      try {
        const assessmentData = await api.get('/predictions/');
        setHasAssessment(assessmentData && assessmentData.length > 0);
      } catch (err) {
        setHasAssessment(false);
      }
    } catch (error) {
      console.error('Failed to fetch progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your progress...</p>
        </div>
      </div>
    );
  }

  const progress = calculateProgress(appointments);
  const milestones = generateMilestones(
    progress.completedSessions,
    progress.totalDays,
    progress.currentStreak
  );
  const journeySteps = generateJourneySteps(appointments, hasAssessment);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Progress</h1>
              <p className="text-gray-600">Track your mental health journey</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-3xl font-bold text-gray-900">{progress.totalSessions}</p>
              </div>
              <Calendar className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600">{progress.completedSessions}</p>
              </div>
              <Award className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Streak</p>
                <p className="text-3xl font-bold text-orange-600">{progress.currentStreak}</p>
              </div>
              <Zap className="w-10 h-10 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Days in Therapy</p>
                <p className="text-3xl font-bold text-purple-600">{progress.totalDays}</p>
              </div>
              <Clock className="w-10 h-10 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Session Dates */}
        {(progress.lastSessionDate || progress.nextSessionDate) && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Session Timeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {progress.lastSessionDate && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Last Session</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(progress.lastSessionDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
              {progress.nextSessionDate && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">Next Session</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(progress.nextSessionDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Progress Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Journey Progress */}
          <div>
            <ProgressTracker 
              steps={journeySteps}
              title="Your Journey"
            />
          </div>

          {/* Session Progress */}
          <div>
            <SessionProgress
              totalSessions={progress.totalSessions}
              completedSessions={progress.completedSessions}
              upcomingSessions={progress.upcomingSessions}
            />
          </div>
        </div>

        {/* Milestones */}
        <div className="mt-8">
          <MilestoneTracker milestones={milestones} />
        </div>

        {/* Motivational Message */}
        <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-8 text-white">
          <div className="flex items-center gap-4">
            <Target className="w-12 h-12" />
            <div>
              <h3 className="text-2xl font-bold mb-2">Keep Going!</h3>
              <p className="text-blue-100">
                {progress.completedSessions === 0 
                  ? "You're at the start of your journey. Every step counts!"
                  : progress.completedSessions < 5
                  ? `Great start! You've completed ${progress.completedSessions} session${progress.completedSessions > 1 ? 's' : ''}. Keep up the momentum!`
                  : progress.completedSessions < 10
                  ? `Excellent progress! ${progress.completedSessions} sessions completed. You're building great habits!`
                  : `Amazing dedication! ${progress.completedSessions} sessions completed. You're making real progress!`
                }
              </p>
            </div>
          </div>
        </div>

        {/* Recent Sessions */}
        {appointments.filter(apt => apt.status === 'Completed').length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Sessions</h3>
            <div className="space-y-3">
              {appointments
                .filter(apt => apt.status === 'Completed')
                .sort((a, b) => new Date(b.scheduled_time).getTime() - new Date(a.scheduled_time).getTime())
                .slice(0, 5)
                .map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        Session with {apt.therapist?.full_name || apt.therapist?.email || 'Therapist'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(apt.scheduled_time).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        Completed
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
