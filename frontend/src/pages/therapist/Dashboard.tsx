import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { NotificationBell } from '@/components/NotificationBell';
import ProfileAvatar from '@/components/ProfileAvatar';
import { getEthiopianGreeting, formatEthiopianAppointmentTime } from '@/utils/ethiopianTime';
import {
  Users,
  Calendar,
  ArrowRight,
  Sparkles,
  Clock,
  Video,
  MessageCircle,
  Award,
  CheckCircle2,
  Settings
} from 'lucide-react';

interface Appointment {
  id: number;
  patient: any;
  scheduled_time: string;
  status: string;
}

export default function TherapistDashboard() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const api = useApi();
  const [greeting, setGreeting] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    todaySessions: 0,
    completedToday: 0,
    totalCompleted: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set greeting based on Ethiopian time
    setGreeting(getEthiopianGreeting());

    // Check if this is first visit
    const hasVisited = localStorage.getItem('hasVisitedTherapistDashboard');
    if (!hasVisited) {
      setShowWelcome(true);
      localStorage.setItem('hasVisitedTherapistDashboard', 'true');
    }

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch appointments
      const data = await api.get('/appointments/');
      
      // Handle both array and paginated response formats
      const appointmentsData = Array.isArray(data) ? data : (data?.results || []);
      console.log('Therapist Dashboard: Total appointments from API:', appointmentsData.length);
      
      // Filter today's appointments using Ethiopian time
      const now = new Date();
      const ethiopianNow = new Date(now.getTime() + (3 * 60 * 60 * 1000));
      const today = new Date(ethiopianNow.getUTCFullYear(), ethiopianNow.getUTCMonth(), ethiopianNow.getUTCDate());

      const todayAppointments = appointmentsData.filter((apt: Appointment) => {
        const aptDate = new Date(apt.scheduled_time);
        const ethiopianAptDate = new Date(aptDate.getTime() + (3 * 60 * 60 * 1000));
        const aptDateOnly = new Date(ethiopianAptDate.getUTCFullYear(), ethiopianAptDate.getUTCMonth(), ethiopianAptDate.getUTCDate());
        return aptDateOnly.getTime() === today.getTime();
      });

      const upcomingToday = todayAppointments.filter((apt: Appointment) => 
        apt.status === 'Scheduled' && new Date(apt.scheduled_time) > new Date()
      );

      const completedToday = todayAppointments.filter((apt: Appointment) => 
        apt.status === 'Completed'
      );

      const totalCompleted = appointmentsData.filter((apt: Appointment) => 
        apt.status === 'Completed'
      ).length;

      // Get unique patients count
      const uniquePatients = new Set(
        appointmentsData
          .filter((apt: Appointment) => apt.status === 'Completed')
          .map((apt: Appointment) => apt.patient?.id)
      );

      setAppointments(upcomingToday.slice(0, 5));
      setStats({
        totalPatients: uniquePatients.size,
        todaySessions: todayAppointments.length,
        completedToday: completedToday.length,
        totalCompleted
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const { time } = formatEthiopianAppointmentTime(dateString);
    return time;
  };

  const statsCards = [
    {
      label: 'Active Patients',
      value: stats.totalPatients.toString(),
      change: 'Total unique patients',
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      label: 'Today\'s Sessions',
      value: stats.todaySessions.toString(),
      change: `${stats.completedToday} completed`,
      icon: Video,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Total Sessions',
      value: stats.totalCompleted.toString(),
      change: 'All time completed',
      icon: CheckCircle2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      label: 'Profile Status',
      value: 'Active',
      change: 'Ready for bookings',
      icon: Award,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header with Notifications */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              EWKE
            </h1>
            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
              {t('auth.therapist')}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <Link to="/therapist/settings">
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
              Dr. {user?.full_name || user?.email}
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
                  <h2 className="text-4xl font-bold gradient-text mb-3">Welcome Dr. {user?.full_name || user?.email?.split('@')[0]}! 🎉</h2>
                  <p className="text-xl text-gray-600">Your therapist dashboard is ready</p>
                </div>
                <div className="grid md:grid-cols-3 gap-4 py-6">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto">
                      <Users className="w-6 h-6 text-indigo-600" />
                    </div>
                    <p className="font-semibold text-gray-900">Manage Patients</p>
                    <p className="text-sm text-gray-600">View patient records</p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto">
                      <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                    <p className="font-semibold text-gray-900">Schedule</p>
                    <p className="text-sm text-gray-600">Manage appointments</p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mx-auto">
                      <Video className="w-6 h-6 text-pink-600" />
                    </div>
                    <p className="font-semibold text-gray-900">Video Sessions</p>
                    <p className="text-sm text-gray-600">Conduct therapy online</p>
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
                  {greeting}, Dr. {user?.full_name || user?.email?.split('@')[0] || 'there'}! 👨‍⚕️
                </h1>
                <p className="text-xl text-gray-600">
                  {stats.todaySessions > 0 
                    ? `You have ${stats.todaySessions} session${stats.todaySessions > 1 ? 's' : ''} today`
                    : 'No sessions scheduled for today'}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((stat, index) => (
              <Card key={index} className="card-glass p-6 hover-lift">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-700 mb-1">{stat.label}</div>
                <div className="text-xs text-gray-500">{stat.change}</div>
              </Card>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Today's Schedule */}
            <div className="lg:col-span-2">
            <Card className="card-glass p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Today's Schedule</h2>
                <Link to="/therapist/appointments">
                  <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700">
                    View All
                  </Button>
                </Link>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading schedule...</p>
                </div>
              ) : appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map((session) => (
                    <Card key={session.id} className="p-5 bg-white border-2 border-gray-100 hover:border-indigo-200 transition-all hover-lift">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {session.patient?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'PT'}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">
                              {session.patient?.full_name || session.patient?.email || 'Patient'}
                            </h3>
                            <p className="text-sm text-gray-600">Therapy Session</p>
                            <div className="flex items-center space-x-1 text-sm text-gray-600 mt-1">
                              <Clock className="w-4 h-4" />
                              <span>{formatTime(session.scheduled_time)}</span>
                            </div>
                          </div>
                        </div>
                        <Link to={`/therapist/appointments/${session.id}`}>
                          <Button className="btn-primary">
                            <Video className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No Sessions Today</h3>
                  <p className="text-gray-600 mb-6">You have no scheduled sessions for today</p>
                  <Link to="/therapist/appointments">
                    <Button variant="outline">
                      <Calendar className="w-4 h-4 mr-2" />
                      View Full Schedule
                    </Button>
                  </Link>
                </div>
              )}
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="card-glass p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link to="/therapist/patients">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    View Patients
                  </Button>
                </Link>
                <Link to="/therapist/appointments">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Manage Schedule
                  </Button>
                </Link>
                <Link to="/therapist/session-notes">
                  <Button variant="outline" className="w-full justify-start">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Session Notes
                  </Button>
                </Link>
                <Link to="/therapist/settings">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Profile Settings
                  </Button>
                </Link>
                </div>
              </Card>

              {/* Getting Started */}
              {stats.totalPatients === 0 && (
                <Card className="card-glass p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg">Getting Started</h3>
                </div>
                <div className="space-y-3 text-white/90">
                  <p className="text-sm">Complete your profile to start receiving patient bookings:</p>
                  <ul className="text-sm space-y-2">
                    <li>• Set your specialization</li>
                    <li>• Add your bio and experience</li>
                    <li>• Set your consultation price</li>
                    <li>• Add languages you speak</li>
                  </ul>
                  <Link to="/therapist/settings">
                    <Button className="w-full bg-white text-indigo-600 hover:bg-gray-100 mt-4">
                      Complete Profile
                    </Button>
                  </Link>
                  </div>
                </Card>
              )}

              {/* Performance */}
              {stats.totalCompleted > 0 && (
                <Card className="card-glass p-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg">Your Impact</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-3xl font-bold mb-1">{stats.totalCompleted}</div>
                    <div className="text-sm text-white/90">Sessions Completed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold mb-1">{stats.totalPatients}</div>
                    <div className="text-sm text-white/90">Lives Impacted</div>
                  </div>
                  <p className="text-sm text-white/90 pt-2">
                    Thank you for making a difference in mental health care!
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
