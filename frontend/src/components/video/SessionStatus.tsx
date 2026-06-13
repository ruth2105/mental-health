import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Video, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Bell
} from 'lucide-react';
import { toast } from 'sonner';

interface SessionStatusProps {
  appointmentId: string;
  onJoinSession: () => void;
}

interface SessionStatus {
  session_exists: boolean;
  session_id?: number;
  room_id?: string;
  participants_online: number;
  other_participant_online: boolean;
  session_started: boolean;
  session_ended: boolean;
}

export default function SessionStatus({ appointmentId, onJoinSession }: SessionStatusProps) {
  const [status, setStatus] = useState<SessionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { get } = useApi();

  useEffect(() => {
    checkSessionStatus();
    loadNotifications();
    
    // Poll for status updates every 5 seconds
    const interval = setInterval(() => {
      checkSessionStatus();
      loadNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, [appointmentId]);

  const checkSessionStatus = async () => {
    try {
      const response = await get(`/video/session-status/?appointment_id=${appointmentId}`);
      setStatus(response);
    } catch (error) {
      console.error('Failed to check session status:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await get('/notifications/');
      const sessionNotifications = response.results?.filter((n: any) => 
        n.notification_type === 'session_starting' || 
        n.notification_type === 'session_ready'
      ).slice(0, 3);
      setNotifications(sessionNotifications || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const getStatusColor = () => {
    if (!status?.session_exists) return 'gray';
    if (status.session_ended) return 'red';
    if (status.other_participant_online) return 'green';
    if (status.session_started) return 'yellow';
    return 'blue';
  };

  const getStatusText = () => {
    if (!status?.session_exists) return 'Session not created';
    if (status.session_ended) return 'Session ended';
    if (status.other_participant_online) return 'Other person is online - Ready to connect!';
    if (status.participants_online > 0) return 'You are online - Waiting for other person';
    if (status.session_started) return 'Session started - Click to join';
    return 'Ready to start';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Checking session status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Session Status Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Video className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-semibold">Video Session</h3>
                <p className="text-sm text-muted-foreground">
                  Appointment #{appointmentId}
                </p>
              </div>
            </div>
            <Badge variant={getStatusColor() as any}>
              {getStatusText()}
            </Badge>
          </div>

          {status?.session_exists && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {status.participants_online} participant{status.participants_online !== 1 ? 's' : ''} online
                </span>
              </div>
              <div className="flex items-center gap-2">
                {status.session_started ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Clock className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm">
                  {status.session_started ? 'Session active' : 'Not started'}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={onJoinSession}
              className="flex-1"
              disabled={status?.session_ended}
            >
              <Video className="h-4 w-4 mr-2" />
              {status?.session_started ? 'Rejoin Session' : 'Join Session'}
            </Button>
            
            {status?.other_participant_online && (
              <Button 
                onClick={() => toast.success('Other person is ready!')}
                variant="outline"
                size="icon"
              >
                <Bell className="h-4 w-4" />
              </Button>
            )}
          </div>

          {status?.session_ended && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-700">
                  This session has ended. Please book a new appointment for another session.
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Recent Session Updates
            </h4>
            <div className="space-y-2">
              {notifications.map((notification, idx) => (
                <div 
                  key={idx}
                  className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg"
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-semibold mb-3">How Video Sessions Work</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-semibold text-primary">1</div>
              <span>Either you or your therapist can start the session</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-semibold text-primary">2</div>
              <span>The other person gets notified when you join</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-semibold text-primary">3</div>
              <span>Video call connects automatically when both join</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-semibold text-primary">4</div>
              <span>Use chat during the session if needed</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}