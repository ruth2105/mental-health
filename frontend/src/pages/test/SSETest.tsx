import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Users, Bell } from 'lucide-react';
import { useVideoSessionSSE } from '@/hooks/useVideoSessionSSE';

export default function SSETest() {
  const { appointmentId } = useParams();
  const [logs, setLogs] = useState<string[]>([]);
  
  const { sessionStatus, isConnected, lastEvent, error } = useVideoSessionSSE(appointmentId);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]);
  };

  useEffect(() => {
    if (lastEvent) {
      addLog(`📡 SSE Event: ${lastEvent.type} - ${lastEvent.message || 'No message'}`);
    }
  }, [lastEvent]);

  useEffect(() => {
    if (sessionStatus) {
      addLog(`📊 Status Update: ${sessionStatus.participants_online} online, other: ${sessionStatus.other_participant_online}`);
    }
  }, [sessionStatus]);

  useEffect(() => {
    if (error) {
      addLog(`❌ Error: ${error}`);
    }
  }, [error]);

  const sendHeartbeat = async () => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      addLog('🔄 Sending heartbeat...');
      
      const response = await fetch('http://localhost:8000/api/video/session-heartbeat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          appointment_id: appointmentId,
          action: 'join',
          peer_id: `test-peer-${Date.now()}`
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        addLog(`✅ Heartbeat sent: ${JSON.stringify(data)}`);
      } else {
        addLog(`❌ Heartbeat failed: ${response.status}`);
      }
    } catch (error) {
      addLog(`❌ Heartbeat error: ${error}`);
    }
  };

  const triggerEvent = async () => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      addLog('🔔 Triggering participant joined event...');
      
      const response = await fetch('http://localhost:8000/api/video/notify-event/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          appointment_id: appointmentId,
          event_type: 'participant_joined'
        })
      });
      
      if (response.ok) {
        addLog('✅ Event triggered successfully');
      } else {
        addLog(`❌ Event trigger failed: ${response.status}`);
      }
    } catch (error) {
      addLog(`❌ Event trigger error: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Server-Sent Events Test</h1>
          <p className="text-muted-foreground">
            Test real-time video session notifications
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isConnected ? (
                  <Wifi className="h-5 w-5 text-green-500" />
                ) : (
                  <WifiOff className="h-5 w-5 text-red-500" />
                )}
                SSE Connection Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Appointment ID: <Badge variant="outline">{appointmentId}</Badge>
                </p>
                <p className="text-sm">
                  Connection: <Badge variant={isConnected ? 'default' : 'destructive'}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </Badge>
                </p>
                {error && (
                  <p className="text-sm text-red-600">
                    Error: {error}
                  </p>
                )}
              </div>

              {sessionStatus && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Current Status:</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Participants Online:</span>
                      <Badge>{sessionStatus.participants_online}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Other Participant:</span>
                      <Badge variant={sessionStatus.other_participant_online ? 'default' : 'secondary'}>
                        {sessionStatus.other_participant_online ? 'Online' : 'Offline'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Session Started:</span>
                      <Badge variant={sessionStatus.session_started ? 'default' : 'secondary'}>
                        {sessionStatus.session_started ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Button onClick={sendHeartbeat} className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  Send Heartbeat
                </Button>
                <Button onClick={triggerEvent} variant="outline" className="w-full">
                  <Bell className="h-4 w-4 mr-2" />
                  Trigger Event
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Logs */}
          <Card>
            <CardHeader>
              <CardTitle>Real-time Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs h-96 overflow-y-auto">
                {logs.length === 0 ? (
                  <div className="text-gray-500">No logs yet...</div>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="mb-1">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Testing Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Open this page in two different browser windows/tabs</li>
                <li>Login as different users in each window</li>
                <li>Click "Send Heartbeat" in both windows</li>
                <li>Watch the real-time status updates</li>
                <li>Click "Trigger Event" to test notifications</li>
                <li>Both windows should receive instant updates</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}