import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import { useNavigationFlow } from '@/hooks/useNavigationFlow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import NavigationHeader from '@/components/NavigationHeader';
import { CheckCircle2, Calendar, Star, MessageSquare, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface Appointment {
  id: number;
  therapist: {
    id: number;
    email: string;
    full_name?: string;
  };
  scheduled_time: string;
  status: string;
}

export default function SessionComplete() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { goTo, goToAppointmentFlow } = useNavigationFlow();
  const { get } = useApi();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointment();
  }, [appointmentId]);

  const fetchAppointment = async () => {
    try {
      if (appointmentId) {
        const data = await get(`/appointments/${appointmentId}/`);
        setAppointment(data);
      }
    } catch (error) {
      console.error('Error fetching appointment:', error);
      toast.error('Failed to load appointment details');
    } finally {
      setLoading(false);
    }
  };

  const handleViewAppointments = () => {
    goTo('/appointments');
  };

  const handleLeaveFeedback = () => {
    if (appointmentId) {
      goToAppointmentFlow(appointmentId, 'feedback');
    }
  };

  const handleGoToDashboard = () => {
    navigate('/patient/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader 
        title="Session Completed"
        subtitle="Your therapy session has ended successfully"
        showBack={false}
      />
      <div className="bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4 min-h-[calc(100vh-80px)]">
        <Card className="max-w-2xl w-full shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <CardTitle className="text-3xl text-gray-900 mb-2">
            Session Completed Successfully!
          </CardTitle>
          <p className="text-gray-600 text-lg">
            Your therapy session has ended. Thank you for taking care of your mental health.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {appointment && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Session Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Therapist:</span>
                  <p className="font-medium">
                    {appointment.therapist.full_name || appointment.therapist.email}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Date & Time:</span>
                  <p className="font-medium">
                    {new Date(appointment.scheduled_time).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={handleLeaveFeedback}
              className="flex items-center gap-2 h-12"
              variant="outline"
            >
              <Star className="w-5 h-5" />
              Leave Feedback
            </Button>

            <Button
              onClick={handleViewAppointments}
              className="flex items-center gap-2 h-12"
              variant="outline"
            >
              <Calendar className="w-5 h-5" />
              View Appointments
            </Button>

            <Button
              onClick={handleGoToDashboard}
              className="flex items-center gap-2 h-12 gradient-primary"
            >
              Back to Dashboard
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              What's Next?
            </h4>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Your session notes will be available in your appointment history</li>
              <li>• Consider leaving feedback to help improve our services</li>
              <li>• Schedule your next session to maintain progress</li>
              <li>• Practice any techniques discussed during your session</li>
            </ul>
          </div>

          <div className="text-center pt-4">
            <p className="text-gray-600 text-sm">
              Need immediate support? Contact our crisis helpline at{' '}
              <span className="font-semibold text-primary">+251-911-123456</span>
            </p>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}