import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare } from 'lucide-react';

export default function VideoSession() {
  const [muted, setMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [duration, setDuration] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    navigate('/feedback');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Video Area */}
      <div className="flex-1 relative">
        {/* Main video (therapist) */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-center text-white">
            <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-xl font-medium">Dr. Sarah Johnson</p>
            <p className="text-sm text-gray-400">Connected</p>
          </div>
        </div>

        {/* User's video (small) */}
        <Card className="absolute top-4 right-4 w-48 h-36 bg-gray-800 border-gray-700 overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
            <Video className="h-8 w-8 text-gray-500" />
          </div>
        </Card>

        {/* Duration */}
        <div className="absolute top-4 left-4 bg-black/60 text-white px-4 py-2 rounded-full">
          <span className="font-mono">{formatDuration(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 border-t border-gray-700 p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-center gap-4">
            <Button
              size="lg"
              variant={muted ? 'destructive' : 'secondary'}
              className="rounded-full h-14 w-14 p-0"
              onClick={() => setMuted(!muted)}
            >
              {muted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>

            <Button
              size="lg"
              variant={videoOn ? 'secondary' : 'destructive'}
              className="rounded-full h-14 w-14 p-0"
              onClick={() => setVideoOn(!videoOn)}
            >
              {videoOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
            </Button>

            <Button
              size="lg"
              variant="destructive"
              className="rounded-full h-16 w-16 p-0"
              onClick={handleEndCall}
            >
              <PhoneOff className="h-6 w-6" />
            </Button>

            <Button
              size="lg"
              variant="secondary"
              className="rounded-full h-14 w-14 p-0"
            >
              <MessageSquare className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
