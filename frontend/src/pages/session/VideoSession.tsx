import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  MessageSquare,
  Send,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
}

export default function VideoSession() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { get, post } = useApi();
  
  // Video refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  
  // State
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [therapistName, setTherapistName] = useState('Therapist');
  
  // WebSocket ref for chat
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    initializeSession();
    return () => {
      cleanup();
    };
  }, []);

  const initializeSession = async () => {
    try {
      // For demo purposes, start video without fetching appointment
      // In production, you'd fetch appointment details first
      
      // Start local video
      await startLocalVideo();
      
      // Initialize WebSocket for chat
      initializeWebSocket();
      
      toast.success('Session started');
      
      // Try to get appointment details (optional)
      try {
        const appointment = await get(`/appointments/${appointmentId}/`);
        setTherapistName(appointment.therapist?.full_name || 'Therapist');
      } catch (err) {
        console.log('Could not fetch appointment details, using defaults');
        // Use default names if appointment not found
      }
    } catch (error) {
      console.error('Failed to initialize session:', error);
      toast.error('Failed to start session');
    }
  };

  const startLocalVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast.error('Could not access camera/microphone');
    }
  };

  const initializeWebSocket = () => {
    // For demo purposes, we'll use a simple message array
    // In production, you'd connect to a WebSocket server
    // ws://localhost:8000/ws/session/${appointmentId}/
    
    // Simulate receiving messages (for demo)
    const demoInterval = setInterval(() => {
      if (Math.random() > 0.95) {
        const demoMessage: Message = {
          id: Date.now().toString(),
          sender: 'therapist',
          text: 'How are you feeling today?',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, demoMessage]);
      }
    }, 10000);
    
    return () => clearInterval(demoInterval);
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
      }
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message: Message = {
      id: Date.now().toString(),
      sender: 'me',
      text: newMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    // In production, send via WebSocket
    // wsRef.current?.send(JSON.stringify(message));
  };

  const endSession = async () => {
    if (confirm('Are you sure you want to end this session?')) {
      try {
        // Try to update appointment status to completed
        try {
          await post(`/appointments/${appointmentId}/`, { status: 'Completed' });
        } catch (err) {
          console.log('Could not update appointment status:', err);
        }
        
        // Try to end video session
        try {
          await post(`/video/end-session/`, { appointment_id: appointmentId });
        } catch (err) {
          console.log('Could not end video session:', err);
        }
        
        cleanup();
        toast.success('Session ended successfully');
        
        // Redirect to session complete page
        navigate(`/session/${appointmentId}/complete`);
      } catch (error) {
        console.error('Error ending session:', error);
        cleanup();
        toast.error('Session ended with errors');
        navigate(`/appointments/${appointmentId}`);
      }
    }
  };

  const cleanup = () => {
    // Stop all tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-white font-semibold">Therapy Session</h1>
          <p className="text-gray-400 text-sm">
            {therapistName} • Session #{appointmentId}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-green-400 text-sm flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Live
          </span>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
          {/* Remote Video (Therapist) */}
          <Card className="relative bg-gray-800 overflow-hidden">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-full">
              <span className="text-white text-sm">{therapistName}</span>
            </div>
            {/* Placeholder if no remote video */}
            <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
              <div className="text-center">
                <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="w-12 h-12 text-primary" />
                </div>
                <p className="text-gray-400">Waiting for therapist...</p>
              </div>
            </div>
          </Card>

          {/* Local Video (You) */}
          <Card className="relative bg-gray-800 overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror"
            />
            <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-full">
              <span className="text-white text-sm">You</span>
            </div>
            {!isVideoOn && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <VideoOff className="w-12 h-12 text-gray-400" />
                  </div>
                  <p className="text-gray-400">Camera Off</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 px-4 py-4">
        <div className="flex items-center justify-center gap-4">
          {/* Video Toggle */}
          <Button
            onClick={toggleVideo}
            variant={isVideoOn ? 'default' : 'destructive'}
            size="lg"
            className="rounded-full w-14 h-14"
          >
            {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </Button>

          {/* Audio Toggle */}
          <Button
            onClick={toggleAudio}
            variant={isAudioOn ? 'default' : 'destructive'}
            size="lg"
            className="rounded-full w-14 h-14"
          >
            {isAudioOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </Button>

          {/* Chat Toggle */}
          <Button
            onClick={() => setShowChat(!showChat)}
            variant="outline"
            size="lg"
            className="rounded-full w-14 h-14"
          >
            <MessageSquare className="w-6 h-6" />
            {messages.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {messages.length}
              </span>
            )}
          </Button>

          {/* End Call */}
          <Button
            onClick={endSession}
            variant="destructive"
            size="lg"
            className="rounded-full w-14 h-14"
          >
            <PhoneOff className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Chat Sidebar */}
      {showChat && (
        <div className="fixed right-0 top-0 bottom-0 w-80 bg-white shadow-2xl flex flex-col z-50">
          {/* Chat Header */}
          <div className="bg-primary text-white px-4 py-3 flex items-center justify-between">
            <h3 className="font-semibold">Chat</h3>
            <Button
              onClick={() => setShowChat(false)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-primary-dark"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <p className="text-center text-gray-400 text-sm">No messages yet</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-3 py-2 ${
                      msg.sender === 'me'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <span className="text-xs opacity-70">
                      {msg.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button onClick={sendMessage} size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
}
