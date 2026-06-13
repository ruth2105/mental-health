import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Peer from 'peerjs';
import { useNavigationFlow } from '@/hooks/useNavigationFlow';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import NavigationHeader from '@/components/NavigationHeader';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  MessageSquare,
  Send,
  X,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import SimpleChat from '@/components/SimpleChat';

// Message interface moved to useRealtimeChat hook

export default function VideoSessionReal() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { goToAppointmentFlow } = useNavigationFlow();
  
  // Video refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerRef = useRef<Peer | null>(null);
  const callRef = useRef<any>(null);
  
  // State
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [myPeerId, setMyPeerId] = useState('');
  const [isConnecting, setIsConnecting] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [chatRoomId, setChatRoomId] = useState<number | null>(null);
  const [attemptingConnection, setAttemptingConnection] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const maxConnectionAttempts = 3;
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  
  // Temporarily disable SSE due to CORS issues, use polling instead
  // const { sessionStatus, isConnected: sseConnected, lastEvent } = useVideoSessionSSE(appointmentId);
  const [participantStatus, setParticipantStatus] = useState({
    participants_online: 0,
    other_participant_online: false,
    session_started: false
  });
  
  // Simple HTTP-based chat (fallback for WebSocket issues)
  
  useEffect(() => {
    initializeSession();
    loadChatRoom();
    return () => {
      cleanup();
    };
  }, []);

  // Removed typing indicator for simple chat

  // Heartbeat to track user presence
  useEffect(() => {
    // Join session when component mounts
    joinSessionHeartbeat();
    
    // Send heartbeat every 10 seconds
    const heartbeatInterval = setInterval(() => {
      joinSessionHeartbeat();
    }, 10000);
    
    // Leave session when component unmounts
    return () => {
      clearInterval(heartbeatInterval);
      leaveSessionHeartbeat();
    };
  }, [appointmentId]);

  // Real-time status checking via polling (fallback from SSE)
  useEffect(() => {
    // Check status immediately
    checkParticipantStatus();
    
    // Check status every 3 seconds for updates
    const statusInterval = setInterval(() => {
      checkParticipantStatus();
    }, 3000);
    
    return () => clearInterval(statusInterval);
  }, [appointmentId]);

  const checkParticipantStatus = async () => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/video/session-status/?appointment_id=${appointmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Status update:', data);
        
        const newStatus = {
          participants_online: data.participants_online || 0,
          other_participant_online: data.other_participant_online || false,
          session_started: data.session_started || false
        };
        
        // Check if other participant just joined
        if (newStatus.other_participant_online && !participantStatus.other_participant_online) {
          console.log('🎉 Other participant just joined!');
          toast.success('Other participant joined the session!');
        }
        
        setParticipantStatus(newStatus);
        
        // If other participant is online and we're not connected, try to connect
        if (newStatus.other_participant_online && !isConnected && !attemptingConnection && 
            connectionAttempts < maxConnectionAttempts &&
            peerRef.current && !peerRef.current.destroyed && localStreamRef.current) {
          console.log('🔔 Other participant detected, attempting connection...');
          
          setConnectionAttempts(prev => prev + 1);
          const currentPeer = peerRef.current;
          const currentStream = localStreamRef.current;
          
          // Add a small delay to ensure both peers are properly registered
          setTimeout(() => {
            if (currentPeer && !currentPeer.destroyed && currentStream) {
              tryAutoConnect(currentPeer, currentStream);
            }
          }, 2000);
        }
      } else {
        console.error('❌ Status check failed:', response.status, await response.text());
      }
    } catch (error) {
      console.error('Failed to check participant status:', error);
    }
  };

  // Removed checkParticipantStatus - now using SSE for real-time updates

  const joinSessionHeartbeat = async () => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      console.log('🔄 Sending join heartbeat for appointment:', appointmentId);
      
      const response = await fetch(`${API_URL}/api/video/session-heartbeat/`, {
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
        console.log('✅ Heartbeat sent successfully:', data);
      } else {
        console.error('❌ Heartbeat failed:', response.status, await response.text());
      }
    } catch (error) {
      console.error('Failed to send join heartbeat:', error);
    }
  };

  const joinSessionHeartbeatWithPeerId = async (peerId: string) => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      console.log('🔄 Sending join heartbeat with peer ID:', peerId);
      
      const response = await fetch(`${API_URL}/api/video/session-heartbeat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          appointment_id: appointmentId,
          action: 'join',
          peer_id: peerId
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Heartbeat with peer ID sent successfully:', data);
      } else {
        console.error('❌ Heartbeat with peer ID failed:', response.status, await response.text());
      }
    } catch (error) {
      console.error('Failed to send join heartbeat with peer ID:', error);
    }
  };

  const leaveSessionHeartbeat = async () => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      await fetch(`${API_URL}/api/video/session-heartbeat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          appointment_id: appointmentId,
          action: 'leave'
        })
      });
    } catch (error) {
      console.error('Failed to send leave heartbeat:', error);
    }
  };

  const initializeSession = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create truly unique peer ID using timestamp, random string, and browser session
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substr(2, 12);
      const browserSession = sessionStorage.getItem('browser_session') || 
        (() => {
          const id = Math.random().toString(36).substr(2, 8);
          sessionStorage.setItem('browser_session', id);
          return id;
        })();
      
      const peerId = `apt${appointmentId}-u${currentUser.id || 'temp'}-${timestamp}-${randomId}-${browserSession}`;
      console.log('🆔 Generated unique peer ID:', peerId);
      
      // Initialize PeerJS with cloud peer server and better error handling
      const peer = new Peer(peerId, {
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' }
          ]
        },
        debug: 2 // Enable debug logging
      });

      peerRef.current = peer;

      peer.on('open', (id) => {
        console.log('✅ Peer connection opened with ID:', id);
        setMyPeerId(id);
        setIsConnecting(false);
        toast.success('Connected! Waiting for other person...');
        
        // Send heartbeat with peer ID
        joinSessionHeartbeatWithPeerId(id);
        
        // Notify the other participant that you've joined
        notifySessionJoined();
        
        // Trigger SSE notification for real-time updates
        triggerSessionEvent('participant_joined');
        
        // Try to auto-connect after a delay to ensure peer is fully registered
        setTimeout(() => {
          if (peer && !peer.destroyed && stream) {
            tryAutoConnect(peer, stream);
          }
        }, 3000);
      });

      peer.on('call', (call) => {
        console.log('📞 Receiving incoming call from:', call.peer);
        console.log('📹 Answering with stream tracks:', stream.getTracks().map(t => `${t.kind}: ${t.enabled}`));
        
        // Answer the call with our stream
        call.answer(stream);
        callRef.current = call;

        call.on('stream', (remoteStream) => {
          console.log('📺 Received remote stream from:', call.peer);
          console.log('📹 Remote stream tracks:', remoteStream.getTracks().map(t => `${t.kind}: ${t.enabled}`));
          
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
          setIsConnected(true);
          setAttemptingConnection(false);
          setConnectionAttempts(0); // Reset attempts on successful connection
          toast.success('Video call connected!');
        });

        call.on('close', () => {
          console.log('📞 Call ended with:', call.peer);
          setIsConnected(false);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
          }
        });

        call.on('error', (error) => {
          console.error('📞 Call error:', error);
          setAttemptingConnection(false);
          toast.error('Call connection failed');
        });
      });

      peer.on('error', (error) => {
        console.error('❌ Peer error:', error);
        
        // Handle specific error types
        if (error.type === 'unavailable-id') {
          console.log('🔄 Peer ID taken, generating new one...');
          // Cleanup and retry with new ID
          peer.destroy();
          setTimeout(() => initializeSession(), 1000);
          return;
        }
        
        toast.error('Connection error. Please refresh and try again.');
        setIsConnecting(false);
        setAttemptingConnection(false);
      });

      peer.on('disconnected', () => {
        console.log('🔌 Peer disconnected, attempting to reconnect...');
        if (!peer.destroyed) {
          peer.reconnect();
        }
      });

    } catch (error) {
      console.error('Error initializing session:', error);
      toast.error('Could not access camera/microphone');
      setIsConnecting(false);
    }
  };

  const notifySessionJoined = async () => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/video/session-joined/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          appointment_id: appointmentId
        })
      });
      
      if (response.ok) {
        console.log('✅ Notification sent to other participant');
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };

  const triggerSessionEvent = async (eventType: string) => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/video/notify-event/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          appointment_id: appointmentId,
          event_type: eventType
        })
      });
      
      if (response.ok) {
        console.log(`✅ SSE event '${eventType}' triggered`);
      }
    } catch (error) {
      console.error('Failed to trigger SSE event:', error);
    }
  };

  const loadChatRoom = async () => {
    try {
      console.log('🏠 Loading chat room for appointment:', appointmentId);
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      
      if (!token) {
        console.error('❌ No authentication token found');
        toast.error('Authentication required for chat');
        return;
      }
      
      // Get appointment to find the other user
      console.log('📋 Fetching appointment details...');
      const aptResponse = await fetch(`${API_URL}/api/appointments/${appointmentId}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!aptResponse.ok) {
        console.error('❌ Failed to fetch appointment:', aptResponse.status);
        toast.error('Failed to load appointment details');
        return;
      }
      
      const appointment = await aptResponse.json();
      const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id;
      const otherUserId = appointment.patient.id === currentUserId 
        ? appointment.therapist.id 
        : appointment.patient.id;
      
      console.log('👤 Current user ID:', currentUserId);
      console.log('👥 Other user ID:', otherUserId);
      
      // Create or get chat room
      console.log('🏠 Creating/getting chat room...');
      const roomResponse = await fetch(`${API_URL}/api/chat/rooms/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ other_user_id: otherUserId })
      });
      
      if (roomResponse.ok) {
        const room = await roomResponse.json();
        console.log('✅ Chat room ready:', room);
        setChatRoomId(room.id);
        toast.success('Chat room connected!');
      } else {
        const errorText = await roomResponse.text();
        console.error('❌ Failed to create chat room:', roomResponse.status, errorText);
        toast.error('Failed to setup chat room');
      }
    } catch (error) {
      console.error('❌ Failed to load chat room:', error);
      toast.error('Chat setup failed');
    }
  };

  // Removed loadMessages - now using real-time WebSocket chat

  const tryAutoConnect = async (peer: Peer, stream: MediaStream) => {
    if (!peer || peer.destroyed || !stream) {
      console.log('⚠️ Cannot auto-connect: peer or stream not ready');
      return;
    }

    try {
      console.log('🔍 Looking for other peers to connect to...');
      
      // Get list of other participants from backend
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/video/session-peers/?appointment_id=${appointmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const otherPeers = data.peers || [];
        
        console.log('📋 Available peers to connect to:', otherPeers);
        console.log('🆔 My peer ID:', peer.id);
        
        // Filter out our own peer ID and empty strings
        const validPeers = otherPeers.filter((peerId: string) => 
          peerId && peerId !== peer.id && peerId.trim().length > 0
        );
        
        if (validPeers.length === 0) {
          console.log('👥 No other peers available yet');
          return;
        }
        
        // Try to connect to the first available peer
        const targetPeerId = validPeers[0];
        console.log(`📞 Attempting to call peer: ${targetPeerId}`);
        console.log(`🆔 My peer ID: ${peer.id}`);
        console.log(`📹 Stream tracks:`, stream.getTracks().map(t => `${t.kind}: ${t.enabled}`));
        
        const call = peer.call(targetPeerId, stream);
        
        if (call) {
          callRef.current = call;
          setAttemptingConnection(true);
          
          console.log('📞 Call initiated, waiting for response...');
          
          // Set a timeout for the connection attempt
          const connectionTimeout = setTimeout(() => {
            console.log('⏰ Connection attempt timed out');
            setAttemptingConnection(false);
            if (call && !call.open) {
              call.close();
            }
          }, 15000); // 15 second timeout
          
          call.on('stream', (remoteStream) => {
            clearTimeout(connectionTimeout);
            console.log('✅ Auto-connection successful with:', targetPeerId);
            
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }
            setIsConnected(true);
            setAttemptingConnection(false);
            toast.success('Video call connected!');
            
            // Status will be updated via SSE
          });
          
          call.on('close', () => {
            clearTimeout(connectionTimeout);
            console.log('📞 Auto-connection closed with:', targetPeerId);
            setIsConnected(false);
            setAttemptingConnection(false);
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = null;
            }
          });
          
          call.on('error', (error) => {
            clearTimeout(connectionTimeout);
            console.error('❌ Auto-connection error with:', targetPeerId, error);
            setAttemptingConnection(false);
          });
          
        } else {
          console.log('❌ Failed to create call to:', targetPeerId);
        }
      } else {
        console.log('❌ Failed to get peer list from backend:', response.status);
      }
    } catch (error) {
      console.error('❌ Auto-connect error:', error);
      setAttemptingConnection(false);
    }
  };

  const connectToPeer = (remotePeerId: string) => {
    if (!peerRef.current || !localStreamRef.current) {
      toast.error('Not ready to connect');
      return;
    }

    console.log('Calling peer:', remotePeerId);
    const call = peerRef.current.call(remotePeerId, localStreamRef.current);
    callRef.current = call;

    call.on('stream', (remoteStream) => {
      console.log('Received remote stream');
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
      setIsConnected(true);
      toast.success('Video call connected!');
      
      // Update status immediately
      checkParticipantStatus();
    });

    call.on('close', () => {
      console.log('Call ended');
      setIsConnected(false);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    });
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

  // Message sending handled by SimpleChat component

  const endSession = async () => {
    if (confirm('Are you sure you want to end this session?')) {
      cleanup();
      
      // Try to end the session on the backend
      try {
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');
        await fetch(`${API_URL}/api/video/end-session/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ appointment_id: appointmentId })
        });
      } catch (error) {
        console.error('Failed to end session on backend:', error);
      }
      
      toast.success('Session ended successfully');
      
      // Navigate to session complete page for better UX
      navigate(`/session/${appointmentId}/complete`);
    }
  };

  const cleanup = () => {
    // Stop all tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }

    // Close peer connection
    if (callRef.current) {
      callRef.current.close();
    }

    if (peerRef.current) {
      peerRef.current.destroy();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Navigation Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <NavigationHeader 
          title="Therapy Session"
          subtitle="Video call with your therapist"
          showBack={true}
          customBackAction={() => {
            if (appointmentId) {
              goToAppointmentFlow(appointmentId, 'detail');
            } else {
              navigate('/appointments');
            }
          }}
          className="bg-gray-800 text-white border-gray-700"
        />
      </div>
      
      {/* Session Status Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">
              {isConnecting ? 'Connecting...' : 
               isConnected ? '🟢 Connected - Video call active' : 
               attemptingConnection ? '🔄 Connecting to other person...' :
               participantStatus.other_participant_online ? '🟡 Other person online - Ready to connect' :
               participantStatus.participants_online > 0 ? '🔵 You are online - Waiting for other person' :
               '⚪ Waiting for other person...'}
            </p>
            <p className="text-xs text-gray-500">
              Participants online: {participantStatus.participants_online} | Updates every 3s
            </p>
          </div>
          {myPeerId && (
            <div className="text-right">
              <p className="text-xs text-gray-400">Your Session ID:</p>
              <p className="text-sm text-white font-mono">{myPeerId.slice(-8)}</p>
              {participantStatus.other_participant_online && !isConnected && (
                <Button 
                  onClick={() => {
                    const peer = peerRef.current;
                    const stream = localStreamRef.current;
                    if (peer && !peer.destroyed && stream) {
                      tryAutoConnect(peer, stream);
                    } else {
                      toast.error('Not ready yet, please wait a moment');
                    }
                  }}
                  size="sm" 
                  className="mt-2"
                  disabled={attemptingConnection}
                >
                  {attemptingConnection ? 'Connecting...' : 'Connect Now'}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {/* Remote Video (Other Person) */}
        <Card className="relative bg-gray-800 border-gray-700 overflow-hidden">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          {!isConnected && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Waiting for other person to join...</p>
              </div>
            </div>
          )}
          <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded">
            <span className="text-white text-sm">Other Person</span>
          </div>
        </Card>

        {/* Local Video (You) */}
        <Card className="relative bg-gray-800 border-gray-700 overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform scale-x-[-1]"
          />
          {!isVideoOn && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <VideoOff className="h-16 w-16 text-gray-400" />
            </div>
          )}
          <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded">
            <span className="text-white text-sm">You</span>
          </div>
        </Card>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={toggleVideo}
            variant={isVideoOn ? 'default' : 'destructive'}
            size="lg"
            className="rounded-full w-14 h-14"
          >
            {isVideoOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
          </Button>

          <Button
            onClick={toggleAudio}
            variant={isAudioOn ? 'default' : 'destructive'}
            size="lg"
            className="rounded-full w-14 h-14"
          >
            {isAudioOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
          </Button>

          <Button
            onClick={() => setShowChat(!showChat)}
            variant="outline"
            size="lg"
            className="rounded-full w-14 h-14"
          >
            <MessageSquare className="h-6 w-6" />
          </Button>

          <Button
            onClick={endSession}
            variant="destructive"
            size="lg"
            className="rounded-full w-14 h-14"
          >
            <PhoneOff className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Simple HTTP-based Chat */}
      <SimpleChat 
        roomId={chatRoomId}
        isOpen={showChat}
        onClose={() => setShowChat(false)}
      />
    </div>
  );
}
