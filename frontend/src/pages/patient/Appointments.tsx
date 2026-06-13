import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import { useNavigationFlow } from '@/hooks/useNavigationFlow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import NavigationHeader from '@/components/NavigationHeader';
import { Calendar, Clock, Video, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Appointment {
  id: number;
  therapist: {
    id: number;
    email: string;
    full_name?: string;
  };
  therapist_email: string;
  scheduled_time: string;
  status: string;
  paid: boolean;
}

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { get } = useApi();
  const navigate = useNavigate();
  const location = useLocation();
  const { goTo, goToAppointmentFlow } = useNavigationFlow();

  useEffect(() => {
    // Check if we're returning from a video session
    if (location.state?.message) {
      toast.success(location.state.message);
      // Clear the state to prevent showing the message again
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    console.log('📅 Appointments page loaded, fetching appointments...');
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      console.log('🔄 Fetching appointments from API...');
      const data = await get('/appointments/');
      console.log('✅ Appointments data received:', data);
      
      // Handle paginated response (has 'results' property) or direct array
      const appointmentsList = data?.results || data || [];
      console.log('📊 Total appointments:', appointmentsList.length);
      
      // Filter out cancelled appointments
      const activeAppointments = appointmentsList.filter((apt: Appointment) => apt.status !== 'Cancelled');
      console.log('📝 Active appointments (excluding cancelled):', activeAppointments.length);
      
      if (activeAppointments.length > 0) {
        console.log('First appointment:', activeAppointments[0]);
      }
      
      setAppointments(activeAppointments);
    } catch (error) {
      console.error('❌ Error fetching appointments:', error);
      toast.error('Failed to load appointments');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'completed':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader 
        title="My Appointments"
        subtitle="View and manage your therapy sessions"
      />
      <div className="container mx-auto px-4 max-w-4xl py-8">
        <div className="flex justify-between items-center mb-8">
          <Button onClick={() => goTo('/therapists')} className="gradient-primary">
            <Calendar className="h-4 w-4 mr-2" />
            Book New Appointment
          </Button>
        </div>

        {appointments.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No appointments yet</p>
              <Button onClick={() => goTo('/therapists')} className="gradient-primary">
                Find a Therapist
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => {
              const therapistName = appointment.therapist?.full_name || appointment.therapist_email;
              
              return (
                <Card key={appointment.id} className="shadow-soft hover:shadow-hover transition-smooth">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl mb-1">{therapistName}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {appointment.scheduled_time ? format(new Date(appointment.scheduled_time), 'MMM dd, yyyy') : 'Date TBD'}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {appointment.scheduled_time ? format(new Date(appointment.scheduled_time), 'hh:mm a') : 'Time TBD'}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                        <Badge variant={appointment.paid ? 'default' : 'secondary'}>
                          {appointment.paid ? 'Paid' : 'Pending Payment'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => goToAppointmentFlow(appointment.id.toString(), 'detail')}
                        variant="outline" 
                        size="sm"
                      >
                        View Details
                      </Button>
                      {appointment.paid && appointment.status !== 'Cancelled' && (
                        <Button 
                          onClick={() => goToAppointmentFlow(appointment.id.toString(), 'session')}
                          size="sm" 
                          className="gradient-primary"
                        >
                          <Video className="h-4 w-4 mr-2" />
                          Join Session
                        </Button>
                      )}
                      {!appointment.paid && (
                        <Button 
                          onClick={() => {
                            localStorage.setItem('pending_appointment_id', appointment.id.toString());
                            goTo('/payment');
                          }}
                          size="sm" 
                          className="gradient-primary"
                        >
                          Pay Now
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
