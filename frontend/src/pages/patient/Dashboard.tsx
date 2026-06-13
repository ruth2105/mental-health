import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { NotificationBell } from '@/components/NotificationBell';
import ProfileAvatar from '@/components/ProfileAvatar';
import { getEthiopianGreeting, formatEthiopianAppointmentTime } from '@/utils/ethiopianTime';
import {
  Brain,
  Users,
  Calendar,
  ArrowRight,
  Sparkles,
  Clock,
  Video,
  MessageCircle,
  Plus,
  AlertCircle,
  Settings,
  Heart
} from 'lucide-react';

interface Appointment {
  id: number;
  therapist: any;
  scheduled_time: string;
  status: string;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const api = useApi();
  const [greeting, setGreeting] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set greeting based on Ethiopian time
    setGreeting(getEthiopianGreeting());

    // Check if this is first visit
    const hasVisited = localStorage.getItem('hasVisitedDashboard');
    if (!hasVisited) {
      setShowWelcome(true);
      localStorage.setItem('hasVisitedDashboard', 'true');
    }

    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const data = await api.get('/appointments/');
      console.log('Dashboard: Total appointments from API:', data?.length || 0);
      
      // Handle paginated or array response
      const appointmentsList = Array.isArray(data) ? data : (data?.results || []);
      
      // Filter only upcoming appointments for dashboard
      const upcoming = appointmentsList.filter((apt: Appointment) => {
        const isScheduled = apt.status === 'Scheduled';
        const isFuture = new Date(apt.scheduled_time) > new Date();
        console.log(`Appointment ${apt.id}: scheduled=${isScheduled}, future=${isFuture}, time=${apt.scheduled_time}`);
        return isScheduled && isFuture;
      });
      
      console.log('Dashboard: Filtered upcoming appointments:', upcoming.length);
      setAppointments(upcoming.slice(0, 3)); // Show only next 3
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Chat Assessment',
      description: 'Have a friendly conversation with our AI companion',
      icon: MessageCircle,
      gradient: 'from-blue-500 to-purple-500',
      link: '/chat-assessment',
      badge: 'New & Fun!',
      badgeColor: 'bg-blue-500'
    },
    {
      title: t('dashboard.ai_assessment'),
      description: t('dashboard.ai_assessment_desc'),
      icon: Brain,
      gradient: 'from-indigo-500 to-blue-500',
      link: '/assessment',
      badge: 'Traditional',
      badgeColor: 'bg-green-500'
    },
    {
      title: t('dashboard.find_therapist'),
      description: t('dashboard.find_therapist_desc'),
      icon: Users,
      gradient: 'from-purple-500 to-pink-500',
      link: '/therapists',
      badge: t('dashboard.popular'),
      badgeColor: 'bg-purple-500'
    },
    {
      title: t('dashboard.my_appointments'),
      description: t('dashboard.my_appointments_desc'),
      icon: Calendar,
      gradient: 'from-pink-500 to-rose-500',
      link: '/appointments',
      badge: null,
      badgeColor: ''
    },
    {
      title: 'Share Your Story',
      description: 'Help others by sharing your experience',
      icon: Heart,
      gradient: 'from-rose-500 to-pink-500',
      link: '/patient/testimonial',
      badge: 'Inspire Others',
      badgeColor: 'bg-rose-500'
    },
    {
      title: t('settings.title'),
      description: t('dashboard.settings_desc'),
      icon: Settings,
      gradient: 'from-gray-500 to-slate-500',
      link: '/patient/settings',
      badge: null,
      badgeColor: ''
    }
  ];

  const formatDate = (dateString: string) => {
    const { date } = formatEthiopianAppointmentTime(dateString);
    return date;
  };

  const formatTime = (dateString: string) => {
    const { time } = formatEthiopianAppointmentTime(dateString);
    return time;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header with Notifications */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              EWKE
            </h1>
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
              {t('auth.patient')}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <Link to="/patient/settings">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                {t('settings.title')}
              </Button>
            </Link>
            <Button 
              onClick={logout}
              variant="ghost"
              className="text-gray-600 hover:text-red-600"
            >
              {t('nav.logout')}
            </Button>
            <div className="text-sm text-gray-700 hidden sm:block">
              {user?.full_name || user?.email}
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 md:p-8">
        {/* Welcome Modal */}
        {showWelcome && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h2 className="text-4xl font-bold gradient-text mb-3">Welcome to EWKE! 🎉</h2>
                  <p className="text-xl text-gray-600">Your mental wellness journey starts here</p>
                </div>
                <div className="grid md:grid-cols-3 gap-4 py-6">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto">
                      <MessageCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="font-semibold text-gray-900">Chat Assessment</p>
                    <p className="text-sm text-gray-600">Friendly AI conversation</p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <p className="font-semibold text-gray-900">Find Therapist</p>
                    <p className="text-sm text-gray-600">Connect with experts</p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mx-auto">
                      <Calendar className="w-6 h-6 text-pink-600" />
                    </div>
                    <p className="font-semibold text-gray-900">Book Session</p>
                    <p className="text-sm text-gray-600">Schedule appointments</p>
                  </div>
                </div>
                <Button 
                  onClick={() => setShowWelcome(false)}
                  className="btn-primary text-lg px-8 py-6"
                >
                  Get Started <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <ProfileAvatar user={user} size="xl" />
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                  {greeting}, {user?.full_name || user?.email?.split('@')[0] || 'there'}! 👋
                </h1>
                <p className="text-xl text-gray-600">How are you feeling today?</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <Link key={index} to={action.link}>
                  <div className="card-glass p-6 hover-lift group cursor-pointer h-full">
                    <div className="relative">
                    {action.badge && (
                      <div className={`absolute -top-2 -right-2 ${action.badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                        {action.badge}
                      </div>
                      )}
                      <div className={`w-14 h-14 bg-gradient-to-br ${action.gradient} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                        <action.icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{action.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">{action.description}</p>
                      <div className="flex items-center text-indigo-600 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                        Get Started <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="card-glass p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Upcoming Sessions</h2>
              <Link to="/appointments">
                <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700">
                  View All
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading appointments...</p>
              </div>
            ) : appointments.length > 0 ? (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="p-5 bg-white border-2 border-gray-100 hover:border-indigo-200 transition-all hover:-translate-y-2 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {appointment.therapist?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'DR'}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">
                            {appointment.therapist?.full_name || 'Therapist'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {appointment.therapist?.doctor_profile?.specialization || 'Mental Health Professional'}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(appointment.scheduled_time)}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>{formatTime(appointment.scheduled_time)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Link to={`/appointments/${appointment.id}`}>
                        <Button className="btn-primary">
                          <Video className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No Upcoming Appointments</h3>
                <p className="text-gray-600 mb-6">Start your wellness journey by booking your first session</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link to="/chat-assessment">
                    <Button className="btn-primary">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat Assessment
                    </Button>
                  </Link>
                  <Link to="/assessment">
                    <Button className="btn-outline">
                      <Brain className="w-4 h-4 mr-2" />
                      Traditional Assessment
                    </Button>
                  </Link>
                  <Link to="/therapists">
                    <Button className="btn-outline">
                      <Users className="w-4 h-4 mr-2" />
                      Browse Therapists
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {!loading && appointments.length > 0 && (
              <Link to="/therapists">
                <Button className="w-full h-14 border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition-all mt-4">
                  <Plus className="w-5 h-5 mr-2" />
                  Book New Appointment
                </Button>
              </Link>
            )}
          </div>

          {/* Getting Started Guide */}
          <Card className="card-glass p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Getting Started with EWKE</h3>
                <ol className="space-y-2 text-white/90">
                  <li>1. Complete your AI mental health assessment</li>
                  <li>2. Browse recommended therapists based on your results</li>
                  <li>3. Book your first session with a licensed professional</li>
                  <li>4. Join video sessions and track your progress</li>
                </ol>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
