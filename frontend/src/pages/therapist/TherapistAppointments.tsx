import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Video, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Appointment {
  id: number;
  patient_name?: string;
  patient?: {
    id: number;
    full_name?: string;
    email: string;
  };
  therapist?: {
    id: number;
    full_name?: string;
    email: string;
  };
  scheduled_time: string;
  status: string;
  notes?: string;
}

export default function TherapistAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { get } = useApi();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await get('/appointments/');
      console.log('Appointments data:', data);
      
      // Handle both array and paginated response
      const appointmentsList = Array.isArray(data) ? data : (data.results || []);

      // Only show appointments where the logged-in user is the therapist
      const myAppointments = user
        ? appointmentsList.filter((apt: Appointment) => apt.therapist?.id === user.id)
        : appointmentsList;

      setAppointments(myAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
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
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">My Appointments</h1>

        {appointments.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No appointments scheduled</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <Card key={appointment.id} className="shadow-soft hover:shadow-hover transition-smooth">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl mb-1">
                        {appointment.patient?.full_name || appointment.patient?.email || appointment.patient_name || 'Patient'}
                      </CardTitle>
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
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {appointment.notes && (
                    <p className="text-sm text-muted-foreground mb-4">
                      Note: {appointment.notes}
                    </p>
                  )}
                  <div className="flex gap-2">
                    {(appointment.status === 'confirmed' || appointment.status === 'Scheduled') && (
                      <Button 
                        onClick={() => navigate(`/session/${appointment.id}`)}
                        size="sm" 
                        className="gradient-primary"
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Join Session
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
