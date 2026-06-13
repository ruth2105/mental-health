import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Video, Chrome, Firefox } from 'lucide-react';

export default function VideoConnectionTest() {
  const navigate = useNavigate();
  const [appointmentId, setAppointmentId] = useState('1');
  
  const loginAsPatient = () => {
    // Clear existing auth
    localStorage.clear();
    
    // Set patient credentials (you'll need to adjust these)
    localStorage.setItem('access_token', 'patient-token-here');
    localStorage.setItem('user', JSON.stringify({
      id: 3, // Patient user ID
      email: 'ruth@gmail.com',
      user_type: 'patient'
    }));
    
    // Navigate to video session
    navigate(`/session/${appointmentId}/video`);
  };
  
  const loginAsTherapist = () => {
    // Clear existing auth
    localStorage.clear();
    
    // Set therapist credentials (you'll need to adjust these)
    localStorage.setItem('access_token', 'therapist-token-here');
    localStorage.setItem('user', JSON.stringify({
      id: 2, // Therapist user ID
      email: 'will@gmail.com',
      user_type: 'therapist'
    }));
    
    // Navigate to video session
    navigate(`/session/${appointmentId}/video`);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Video Connection Test</h1>
          <p className="text-muted-foreground">
            Test the video connection system with different users
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Test Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Appointment ID</label>
              <Input
                value={appointmentId}
                onChange={(e) => setAppointmentId(e.target.value)}
                placeholder="Enter appointment ID"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={loginAsPatient} className="w-full">
                <Users className="h-4 w-4 mr-2" />
                Login as Patient
              </Button>
              <Button onClick={loginAsTherapist} variant="outline" className="w-full">
                <Users className="h-4 w-4 mr-2" />
                Login as Therapist
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Method 1: Two Browser Windows</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
                  <li>Click "Login as Patient" in this window</li>
                  <li>Open a new Chrome window</li>
                  <li>Go to this same test page</li>
                  <li>Click "Login as Therapist" in the new window</li>
                  <li>Both should connect automatically</li>
                </ol>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Method 2: Incognito Mode</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-green-700">
                  <li>Click "Login as Patient" in this window</li>
                  <li>Open Chrome Incognito window (Ctrl+Shift+N)</li>
                  <li>Navigate to: <code>localhost:3000/test/video-connection</code></li>
                  <li>Click "Login as Therapist" in incognito window</li>
                  <li>Both should connect automatically</li>
                </ol>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">Method 3: Different Browsers</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-purple-700">
                  <li>Click "Login as Patient" in Chrome</li>
                  <li>Open Firefox/Edge</li>
                  <li>Navigate to: <code>localhost:3000/test/video-connection</code></li>
                  <li>Click "Login as Therapist" in Firefox/Edge</li>
                  <li>Both should connect automatically</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What to Look For</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline">✅</Badge>
                <span>Both cameras should show local video</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">✅</Badge>
                <span>Status should change from "Waiting" to "Connected"</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">✅</Badge>
                <span>Remote video should appear within 5 seconds</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">✅</Badge>
                <span>Console should show connection success messages</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Important Notes</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
            <li>Split screen in same browser won't work - both sides use same user</li>
            <li>Make sure both users have camera/microphone permissions</li>
            <li>Check browser console for detailed connection logs</li>
            <li>If connection fails, refresh both pages and try again</li>
          </ul>
        </div>
      </div>
    </div>
  );
}