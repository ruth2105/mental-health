import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, Bell, BellRing, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationTest() {
  const navigate = useNavigate();
  const [testNotifications] = useState([
    {
      id: 1,
      title: 'Video Session Started',
      message: 'Ruth User has joined the video session. Click to join now!',
      notification_type: 'session_starting',
      priority: 'high',
      is_read: false,
      created_at: new Date().toISOString(),
      metadata: {
        action_url: '/session/15',
        appointment_id: 15,
        joiner_name: 'Ruth User'
      }
    },
    {
      id: 2,
      title: 'Session Ready',
      message: 'Your therapy session is ready to start.',
      notification_type: 'session_ready',
      priority: 'high',
      is_read: false,
      created_at: new Date().toISOString(),
      metadata: {
        action_url: '/session/15',
        appointment_id: 15
      }
    },
    {
      id: 3,
      title: 'Feedback Requested',
      message: 'Your session is complete. Please share your feedback!',
      notification_type: 'feedback_requested',
      priority: 'medium',
      is_read: false,
      created_at: new Date().toISOString(),
      metadata: {
        action_url: '/appointments/15/feedback',
        appointment_id: 15
      }
    }
  ]);

  const handleNotificationClick = (notification: any) => {
    const actionUrl = notification.metadata?.action_url;
    
    if (actionUrl) {
      switch (notification.notification_type) {
        case 'session_starting':
          toast.success('Joining video session...');
          navigate(actionUrl);
          break;
        case 'session_ready':
          toast.success('Session is ready to start!');
          navigate(actionUrl);
          break;
        case 'feedback_requested':
          toast.info('Please provide your feedback');
          navigate(actionUrl);
          break;
        default:
          navigate(actionUrl);
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'session_starting':
      case 'session_ready':
        return <Video className="h-5 w-5 text-green-600" />;
      case 'feedback_requested':
        return <BellRing className="h-5 w-5 text-orange-600" />;
      default:
        return <Bell className="h-5 w-5 text-blue-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-red-500 bg-red-50';
      case 'medium':
        return 'border-l-4 border-blue-500 bg-blue-50';
      case 'low':
        return 'border-l-4 border-gray-500 bg-gray-50';
      default:
        return 'border-l-4 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Notification Navigation Test</h1>
          <p className="text-muted-foreground">
            Test how notifications navigate to video sessions and other pages
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Test Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${getPriorityColor(notification.priority)}`}
                  >
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification.notification_type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-sm">{notification.title}</h4>
                          <Badge variant={notification.priority === 'high' ? 'destructive' : 'default'}>
                            {notification.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Just now</span>
                          <span className="text-xs font-medium text-blue-600">
                            Click to navigate →
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Navigation Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Navigation Behavior
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Video className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">Video Session Notifications</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Navigate directly to <code>/session/{'{appointmentId}'}</code>
                  </p>
                </div>

                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <BellRing className="h-4 w-4 text-orange-600" />
                    <span className="font-medium text-orange-800">Feedback Requests</span>
                  </div>
                  <p className="text-sm text-orange-700">
                    Navigate to <code>/appointments/{'{appointmentId}'}/feedback</code>
                  </p>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Bell className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Other Notifications</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Navigate based on <code>action_url</code> in metadata
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2">Test Instructions:</h4>
                <ol className="text-sm space-y-1 text-gray-600">
                  <li>1. Click on any notification above</li>
                  <li>2. Should show toast message</li>
                  <li>3. Should navigate to correct page</li>
                  <li>4. Video session notifications go to session page</li>
                </ol>
              </div>

              <Button 
                onClick={() => navigate('/appointments')}
                variant="outline"
                className="w-full"
              >
                Back to Appointments
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}