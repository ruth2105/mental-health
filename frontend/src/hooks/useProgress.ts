import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface ProgressData {
  totalSessions: number;
  completedSessions: number;
  upcomingSessions: number;
  cancelledSessions: number;
  currentStreak: number;
  totalDays: number;
  lastSessionDate: string | null;
  nextSessionDate: string | null;
  milestones: {
    id: string;
    title: string;
    description: string;
    achieved: boolean;
    date?: string;
  }[];
  journeySteps: {
    id: string;
    label: string;
    status: 'completed' | 'current' | 'upcoming';
    date?: string;
  }[];
}

export const useProgress = () => {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_URL}/api/progress/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setProgress(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching progress:', err);
      setError(err.response?.data?.message || 'Failed to load progress');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  return { progress, loading, error, refetch: fetchProgress };
};

// Calculate progress from appointments
export const calculateProgress = (appointments: any[]) => {
  const now = new Date();
  
  const completed = appointments.filter(apt => apt.status === 'Completed').length;
  const upcoming = appointments.filter(apt => {
    const aptDate = new Date(apt.scheduled_time);
    return aptDate > now && apt.status === 'Scheduled';
  }).length;
  const cancelled = appointments.filter(apt => apt.status === 'Cancelled').length;
  const total = appointments.length;

  // Calculate streak (consecutive sessions)
  const completedSorted = appointments
    .filter(apt => apt.status === 'Completed')
    .sort((a, b) => new Date(b.scheduled_time).getTime() - new Date(a.scheduled_time).getTime());

  let streak = 0;
  if (completedSorted.length > 0) {
    streak = 1;
    for (let i = 1; i < completedSorted.length; i++) {
      const prevDate = new Date(completedSorted[i - 1].scheduled_time);
      const currDate = new Date(completedSorted[i].scheduled_time);
      const daysDiff = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 14) { // Within 2 weeks
        streak++;
      } else {
        break;
      }
    }
  }

  // Get dates
  const lastSession = completedSorted[0]?.scheduled_time || null;
  const nextSession = appointments
    .filter(apt => new Date(apt.scheduled_time) > now && apt.status === 'Scheduled')
    .sort((a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime())[0]?.scheduled_time || null;

  // Calculate total days in therapy
  const firstSession = appointments.length > 0
    ? new Date(appointments.sort((a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime())[0].scheduled_time)
    : new Date();
  const totalDays = Math.floor((now.getTime() - firstSession.getTime()) / (1000 * 60 * 60 * 24));

  return {
    totalSessions: total,
    completedSessions: completed,
    upcomingSessions: upcoming,
    cancelledSessions: cancelled,
    currentStreak: streak,
    totalDays: Math.max(0, totalDays),
    lastSessionDate: lastSession,
    nextSessionDate: nextSession
  };
};

// Generate milestones based on progress
export const generateMilestones = (completedSessions: number, totalDays: number, streak: number) => {
  return [
    {
      id: 'first-session',
      title: 'First Session',
      description: 'Completed your first therapy session',
      achieved: completedSessions >= 1,
      date: completedSessions >= 1 ? 'Achieved' : undefined
    },
    {
      id: 'week-one',
      title: 'One Week',
      description: 'One week in therapy',
      achieved: totalDays >= 7,
      date: totalDays >= 7 ? 'Achieved' : undefined
    },
    {
      id: 'five-sessions',
      title: '5 Sessions',
      description: 'Completed 5 therapy sessions',
      achieved: completedSessions >= 5,
      date: completedSessions >= 5 ? 'Achieved' : undefined
    },
    {
      id: 'month-one',
      title: 'One Month',
      description: 'One month of consistent therapy',
      achieved: totalDays >= 30,
      date: totalDays >= 30 ? 'Achieved' : undefined
    },
    {
      id: 'ten-sessions',
      title: '10 Sessions',
      description: 'Completed 10 therapy sessions',
      achieved: completedSessions >= 10,
      date: completedSessions >= 10 ? 'Achieved' : undefined
    },
    {
      id: 'streak-five',
      title: 'Consistent Progress',
      description: '5 consecutive sessions',
      achieved: streak >= 5,
      date: streak >= 5 ? 'Achieved' : undefined
    }
  ];
};

// Generate journey steps
export const generateJourneySteps = (appointments: any[], hasAssessment: boolean) => {
  const completed = appointments.filter(apt => apt.status === 'Completed').length;
  const hasUpcoming = appointments.some(apt => apt.status === 'Scheduled');
  const hasFeedback = appointments.some(apt => apt.feedback);

  const steps = [
    {
      id: 'register',
      label: 'Account Created',
      status: 'completed' as const,
      date: 'Completed'
    },
    {
      id: 'assessment',
      label: 'Mental Health Assessment',
      status: hasAssessment ? 'completed' as const : 'current' as const,
      date: hasAssessment ? 'Completed' : undefined
    },
    {
      id: 'first-booking',
      label: 'First Appointment Booked',
      status: appointments.length > 0 ? 'completed' as const : 'upcoming' as const,
      date: appointments.length > 0 ? 'Completed' : undefined
    },
    {
      id: 'first-session',
      label: 'First Session Completed',
      status: completed > 0 ? 'completed' as const : hasUpcoming ? 'current' as const : 'upcoming' as const,
      date: completed > 0 ? 'Completed' : undefined
    },
    {
      id: 'ongoing',
      label: 'Ongoing Treatment',
      status: completed >= 3 ? 'completed' as const : completed > 0 ? 'current' as const : 'upcoming' as const,
      date: completed >= 3 ? 'In Progress' : undefined
    },
    {
      id: 'feedback',
      label: 'Provide Feedback',
      status: hasFeedback ? 'completed' as const : completed > 0 ? 'current' as const : 'upcoming' as const,
      date: hasFeedback ? 'Completed' : undefined
    }
  ];

  return steps;
};
