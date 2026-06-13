import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SessionStatus from '@/components/video/SessionStatus';
import { 
  Video, 
  Calendar, 
  User, 
  Clock,
  ArrowLeft,
  Settings,
  Mic,
  MicOff,
  VideoOff
} from 'lucide-react';
import { toast } from 'sonner';

interface Appointment {
  id: number;
  patient: {
    id: number;
    email: string;
    full_name?: string;
  };
  therapist: {
    id: number;
    email: string;
    full_name?: string;
  };
  scheduled_time: string;
  status: string;
}

export default function SessionWaitingRoom() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { get } = useApi();
  
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [mediaPermissions, setMediaPermissions] = useState({
    camera: false,
    microphone: false
  });
  const [testingMedia, setTestingMedia] = useState(false);

  useEffect(() => {
    loadAppointment();
    checkMediaPermissions();
  }, [appointmentId]);

  const loadAppointment = async () => {
    try {
      const data = await get(`/appointments/${appointmentId}/`);
      setAppointment(data);
    } catch (error) {
      console.error('Failed to load appointment:', error);
      toast.error('Failed to load appointment details');
      navigate('/appointments');
    } finally {
      setLoading(false);
    }
  };

  const checkMediaPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setMediaPermissions({
        camera: stream.getVideoTracks().length > 0,
        microphone: stream.getAudioTracks().length > 0
      });
      
      // Stop the test stream
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Media permissions denied:', error);
      setMediaPermissions({ camera: false, microphone: false });
    }
  };

  const testMediaDevices = async () => {
    setTestingMedia(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      toast.success('Camera and microphone are working!');
      
      // Stop the test stream
      stream.getTracks().forEach(track => track.stop());
      
      setMediaPermissions({ camera: true, microphone: true });
    } catch (error) {
      console.error('Media test failed:', error);
      toast.error('Please allow camera and microphone access');
    } finally {
      setTestingMedia(false);
    }
  };

  const joinSession = () => {
    if (!mediaPermissions.camera || !mediaPermissions.microphone) {
      toast.error('Please enable camera and microphone first');
      return;
    }
    
    navigate(`/session/${appointmentId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading session details...</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Appointment not found</p>
            <Button onClick={() => navigate('/appointments')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Appointments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isPatient = currentUser.id === appointment.patient.id;
  const otherPerson = isPatient ? appointment.therapist : appointment.patient;
  const scheduledTime = new Date(appointment.scheduled_time);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate('/appointments')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Video Session</h1>
              <p className="text-muted-foreground">
                Waiting room for your therapy session
              </p>
            </div>
          </div>
          <Badge variant="outline">
            {appointment.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Session Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Session Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {isPatient ? 'Your Therapist' : 'Patient'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {otherPerson.full_name || otherPerson.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Scheduled Time</p>
                      <p className="text-sm text-muted-foreground">
                        {scheduledTime.toLocaleDateString()} at {scheduledTime.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Media Setup */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Camera & Microphone Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {mediaPermissions.camera ? (
                        <Video className="h-5 w-5 text-green-500" />
                      ) : (
                        <VideoOff className="h-5 w-5 text-red-500" />
                      )}
                      <span className="font-medium">Camera</span>
                    </div>
                    <Badge variant={mediaPermissions.camera ? 'default' : 'destructive'}>
                      {mediaPermissions.camera ? 'Ready' : 'Not Ready'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {mediaPermissions.microphone ? (
                        <Mic className="h-5 w-5 text-green-500" />
                      ) : (
                        <MicOff className="h-5 w-5 text-red-500" />
                      )}
                      <span className="font-medium">Microphone</span>
                    </div>
                    <Badge variant={mediaPermissions.microphone ? 'default' : 'destructive'}>
                      {mediaPermissions.microphone ? 'Ready' : 'Not Ready'}
                    </Badge>
                  </div>
                </div>

                <Button 
                  onClick={testMediaDevices}
                  variant="outline"
                  className="w-full"
                  disabled={testingMedia}
                >
                  {testingMedia ? 'Testing...' : 'Test Camera & Microphone'}
                </Button>

                {(!mediaPermissions.camera || !mediaPermissions.microphone) && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Permission Required:</strong> Please allow access to your camera and microphone 
                      when prompted by your browser. This is required for video sessions.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Session Status */}
            <SessionStatus 
              appointmentId={appointmentId!}
              onJoinSession={joinSession}
            />
          </div>
        </div>
      </div>
    </div>
  );
}