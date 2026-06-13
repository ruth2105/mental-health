import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/hooks/useApi';
import { TrendingUp, Users, Calendar, Award, Clock, Star, CheckCircle } from 'lucide-react';

export default function TherapistProgress() {
  const { user } = useAuth();
  const api = useApi();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch appointments
      const appointmentsData = await api.get('/appointments/therapist/');
      const appointmentsList = Array.isArray(appointmentsData) 
        ? appointmentsData 
        : (appointmentsData?.results || []);
      setAppointments(appointmentsList);

      // Fetch patients
      try {
        const patientsData = await api.get('/therapist/patients/');
        setPatients(Array.isArray(patientsData) ? patientsData : []);
      } catch (err) {
        console.error('Failed to fetch patients:', err);
      }

      // Fetch feedback
      try {
        const feedbackData = await api.get('/appointments/feedback/received/');
        setFeedback(Array.isArray(feedbackData) ? feedbackData : []);
      } catch (err) {
        console.error('Failed to fetch feedback:', err);
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

  // Calculate stats
  const totalSessions = appointments.length;
  const completedSessions = appointments.filter(apt => apt.status === 'Completed').length;
  const upcomingSessions = appointments.filter(apt => apt.status === 'Scheduled').length;
  const totalPatients = patients.length;
  const activePatients = patients.filter(p => p.has_upcoming_appointments).length;
  
  // Calculate average rating
  const avgRating = feedback.length > 0
    ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
    : '0.0';

  // Calculate completion rate
  const completionRate = totalSessions > 0
    ? ((completedSessions / totalSessions) * 100).toFixed(0)
    : '0';

  // Get first session date
  const firstSession = appointments.length > 0
    ? new Date(appointments.sort((a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime())[0].scheduled_time)
    : new Date();
  const daysActive = Math.floor((new Date().getTime() - firstSession.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Impact</h1>
              <p className="text-gray-600">Track your professional progress</p>
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
                <p className="text-sm text-gray-600">Total Patients</p>
                <p className="text-3xl font-bold text-gray-900">{totalPatients}</p>
                <p className="text-xs text-green-600 mt-1">{activePatients} active</p>
              </div>
              <Users className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-3xl font-bold text-gray-900">{totalSessions}</p>
                <p className="text-xs text-gray-600 mt-1">{completedSessions} completed</p>
              </div>
              <Calendar className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Rating</p>
                <p className="text-3xl font-bold text-yellow-600">{avgRating}</p>
                <p className="text-xs text-gray-600 mt-1">{feedback.length} reviews</p>
              </div>
              <Star className="w-10 h-10 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Days Active</p>
                <p className="text-3xl font-bold text-purple-600">{daysActive}</p>
                <p className="text-xs text-gray-600 mt-1">since first session</p>
              </div>
              <Clock className="w-10 h-10 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Progress Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Session Completion */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Session Completion Rate</h3>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Completion Rate</span>
                <span className="font-medium">{completionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${completionRate}%` }}
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

          {/* Patient Satisfaction */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Patient Satisfaction</h3>
            {feedback.length > 0 ? (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                  <span className="text-4xl font-bold text-gray-900">{avgRating}</span>
                  <span className="text-gray-600">/ 5.0</span>
                </div>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map(rating => {
                    const count = feedback.filter(f => f.rating === rating).length;
                    const percentage = (count / feedback.length) * 100;
                    return (
                      <div key={rating} className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 w-8">{rating}★</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-500 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-8">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Star className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No feedback yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Milestones */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            Professional Milestones
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'First Patient', achieved: totalPatients >= 1, count: 1 },
              { title: '5 Patients', achieved: totalPatients >= 5, count: 5 },
              { title: '10 Sessions', achieved: completedSessions >= 10, count: 10 },
              { title: '25 Sessions', achieved: completedSessions >= 25, count: 25 },
              { title: '5-Star Rating', achieved: parseFloat(avgRating) >= 4.5, count: 4.5 },
              { title: '10 Reviews', achieved: feedback.length >= 10, count: 10 }
            ].map((milestone, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  milestone.achieved
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {milestone.achieved ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  )}
                  <span className={`font-medium ${
                    milestone.achieved ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {milestone.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Feedback */}
        {feedback.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Feedback</h3>
            <div className="space-y-4">
              {feedback.slice(0, 5).map((item) => (
                <div key={item.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < item.rating
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{item.feedback_text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
