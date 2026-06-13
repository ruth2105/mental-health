import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, User, Video, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Appointment {
  id: number;
  patient: {
    id: number;
    email: string;
    full_name: string;
  };
  therapist?: {
    id: number;
    email: string;
    full_name?: string;
  };
  scheduled_time: string;
  status: string;
  paid: boolean;
}

export default function TherapistAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { get, patch } = useApi();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const data = await get('/appointments/');
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

  const updateAppointmentStatus = async (id: number, status: string) => {
    try {
      await patch(`/appointments/${id}/`, { status });
      toast.success(`Appointment ${status.toLowerCase()}`);
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment');
    }
  };

  const filterAppointments = (status: string) => {
    if (status === 'all') {
      // Exclude cancelled appointments from "All" view
      return appointments.filter(apt => apt.status !== 'Cancelled');
    }
    return appointments.filter(apt => apt.status === status);
  };

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
    const date = appointment.scheduled_time ? new Date(appointment.scheduled_time) : null;
    const patientName = appointment.patient?.full_name || appointment.patient?.email || 'Patient';

    return (
      <Card className="shadow-soft hover:shadow-hover transition-smooth">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{patientName}</CardTitle>
                <p className="text-sm text-muted-foreground">{appointment.patient?.email}</p>
              </div>
            </div>
            <Badge variant={
              appointment.status === 'Completed' ? 'default' :
              appointment.status === 'Cancelled' ? 'destructive' : 'outline'
            }>
              {appointment.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{date ? date.toLocaleDateString() : 'Date TBD'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{date ? date.toLocaleTimeString() : 'Time TBD'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Payment:</span>
            <Badge variant={appointment.paid ? 'default' : 'outline'}>
              {appointment.paid ? 'Paid' : 'Pending'}
            </Badge>
          </div>

          <div className="flex gap-2 mt-4">
            {appointment.status === 'Scheduled' && (
              <>
                <Button
                  size="sm"
                  onClick={() => navigate(`/session/${appointment.id}`)}
                  className="flex-1"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Start Session
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateAppointmentStatus(appointment.id, 'Completed')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => updateAppointmentStatus(appointment.id, 'Cancelled')}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </>
            )}
            {appointment.status === 'Completed' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/appointments/${appointment.id}`)}
                className="w-full"
              >
                View Details
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
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
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Appointments</h1>
          <p className="text-muted-foreground">Manage your therapy sessions</p>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">
              All ({appointments.filter(apt => apt.status !== 'Cancelled').length})
            </TabsTrigger>
            <TabsTrigger value="Scheduled">
              Scheduled ({filterAppointments('Scheduled').length})
            </TabsTrigger>
            <TabsTrigger value="Completed">
              Completed ({filterAppointments('Completed').length})
            </TabsTrigger>
            <TabsTrigger value="Cancelled">
              Cancelled ({filterAppointments('Cancelled').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {appointments.length === 0 ? (
              <Card className="shadow-soft">
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No appointments yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {appointments.map(apt => (
                  <AppointmentCard key={apt.id} appointment={apt} />
                ))}
              </div>
            )}
          </TabsContent>

          {['Scheduled', 'Completed', 'Cancelled'].map(status => (
            <TabsContent key={status} value={status} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {filterAppointments(status).map(apt => (
                  <AppointmentCard key={apt.id} appointment={apt} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
