import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Users, Wifi, WifiOff } from 'lucide-react';

export default function HeartbeatTest() {
  const { appointmentId } = useParams();
  const [status, setStatus] = useState<any>(null);
  const [heartbeatResult, setHeartbeatResult] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isPolling, setIsPolling] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  const sendHeartbeat = async () => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      addLog(`🔄 Sending heartbeat for appointment ${appointmentId}`);
      addLog(`🔐 Token exists: ${!!token} (${token ? token.substring(0, 20) + '...' : 'No token'})`);
      
      const response = await fetch('http://localhost:8000/api/video/session-heartbeat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          appointment_id: appointmentId,
          action: 'join'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setHeartbeatResult(data);
        addLog(`✅ Heartbeat success: ${JSON.stringify(data)}`);
      } else {
        const error = await response.text();
        addLog(`❌ Heartbeat failed (${response.status}): ${error}`);
      }
    } catch (error) {
      addLog(`❌ Heartbeat error: ${error}`);
    }
  };

  const checkStatus = async () => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/video/session-status/?appointment_id=${appointmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
        addLog(`📊 Status: ${data.participants_online} online, other: ${data.other_participant_online}`);
      } else {
        const error = await response.text();
        addLog(`❌ Status failed (${response.status}): ${error}`);
      }
    } catch (error) {
      addLog(`❌ Status error: ${error}`);
    }
  };

  const startPolling = () => {
    setIsPolling(true);
    addLog('🔄 Started polling every 3 seconds');
    
    const interval = setInterval(() => {
      checkStatus();
    }, 3000);
    
    // Stop after 30 seconds
    setTimeout(() => {
      clearInterval(interval);
      setIsPolling(false);
      addLog('⏹️ Stopped polling');
    }, 30000);
  };

  useEffect(() => {
    addLog(`🚀 HeartbeatTest loaded for appointment ${appointmentId}`);
    
    // Check token on load
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    const user = localStorage.getItem('user');
    addLog(`🔐 Token: ${token ? 'Found' : 'Missing'}`);
    addLog(`👤 User: ${user ? JSON.parse(user).email : 'Missing'}`);
  }, [appointmentId]);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Heartbeat System Test</h1>
          <p className="text-muted-foreground">
            Debug the video session heartbeat and status system
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Heartbeat Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Appointment ID: <Badge variant="outline">{appointmentId}</Badge>
                </p>
              </div>

              <div className="space-y-2">
                <Button onClick={sendHeartbeat} className="w-full">
                  <Heart className="h-4 w-4 mr-2" />
                  Send Heartbeat
                </Button>
                <Button onClick={checkStatus} variant="outline" className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  Check Status
                </Button>
                <Button 
                  onClick={startPolling} 
                  variant="secondary" 
                  className="w-full"
                  disabled={isPolling}
                >
                  {isPolling ? (
                    <>
                      <WifiOff className="h-4 w-4 mr-2" />
                      Polling... (30s)
                    </>
                  ) : (
                    <>
                      <Wifi className="h-4 w-4 mr-2" />
                      Start Polling
                    </>
                  )}
                </Button>
              </div>

              {heartbeatResult && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Last Heartbeat Result:</h4>
                  <pre className="text-xs text-green-700">
                    {JSON.stringify(heartbeatResult, null, 2)}
                  </pre>
                </div>
              )}

              {status && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Current Status:</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Participants Online:</span>
                      <Badge>{status.participants_online}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Other Participant:</span>
                      <Badge variant={status.other_participant_online ? 'default' : 'secondary'}>
                        {status.other_participant_online ? 'Online' : 'Offline'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Session Started:</span>
                      <Badge variant={status.session_started ? 'default' : 'secondary'}>
                        {status.session_started ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Logs */}
          <Card>
            <CardHeader>
              <CardTitle>Debug Logs</CardTitle>
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
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Click "Send Heartbeat" to register your presence</li>
                <li>Click "Check Status" to see current participant count</li>
                <li>Open another browser tab/window with the same URL</li>
                <li>Send heartbeat from both tabs</li>
                <li>Check status - should show 2 participants online</li>
                <li>Use "Start Polling" to monitor status changes automatically</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}