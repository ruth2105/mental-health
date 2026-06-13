import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Video, ArrowLeft, Loader2 } from 'lucide-react';
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
  session?: string;
}

export default function AppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const { get, put } = useApi();

  useEffect(() => {
    if (id) {
      fetchAppointment();
    }
  }, [id]);

  const fetchAppointment = async () => {
    setLoading(true);
    try {
      const data = await get(`/appointments/${id}/`);
      setAppointment(data);
    } catch (error) {
      console.error('Error fetching appointment:', error);
      toast.error('Failed to load appointment details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
      await put(`/appointments/${id}/`, { status: 'Cancelled' });
      toast.success('Appointment cancelled');
      navigate('/appointments');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment');
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

  if (!appointment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Appointment not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Button 
          onClick={() => navigate('/appointments')} 
          variant="ghost" 
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Appointments
        </Button>

        <Card className="shadow-elegant">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-3xl">Appointment Details</CardTitle>
              <Badge className={getStatusColor(appointment.status)}>
                {appointment.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Therapist</p>
                <p className="font-semibold">
                  {appointment.therapist?.full_name || appointment.therapist_email}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <p className="font-semibold capitalize">{appointment.status}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Date</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <p className="font-semibold">
                    {format(new Date(appointment.scheduled_time), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Time</p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <p className="font-semibold">
                    {format(new Date(appointment.scheduled_time), 'hh:mm a')}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Payment Status</p>
                <Badge variant={appointment.paid ? 'default' : 'secondary'}>
                  {appointment.paid ? 'Paid' : 'Pending Payment'}
                </Badge>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              {appointment.paid && appointment.status !== 'Cancelled' && appointment.status !== 'Completed' && (
                <Button 
                  onClick={() => navigate(`/session/${appointment.id}`)}
                  className="flex-1 gradient-primary"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Join Session
                </Button>
              )}
              {!appointment.paid && (
                <Button 
                  onClick={() => {
                    localStorage.setItem('pending_appointment_id', appointment.id.toString());
                    navigate('/payment');
                  }}
                  className="flex-1 gradient-primary"
                >
                  Proceed to Payment
                </Button>
              )}
              {appointment.status === 'Completed' && (
                <Button 
                  onClick={() => navigate(`/appointments/${appointment.id}/feedback`)}
                  className="flex-1 gradient-primary"
                >
                  Give Feedback
                </Button>
              )}
              {appointment.status !== 'Cancelled' && appointment.status !== 'Completed' && (
                <Button 
                  onClick={handleCancelAppointment}
                  variant="destructive"
                  className="flex-1"
                >
                  Cancel Appointment
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
