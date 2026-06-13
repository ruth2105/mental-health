import { useEffect, useRef, useState } from 'react';

interface SessionUpdate {
  participants_online: number;
  other_participant_online: boolean;
  session_started: boolean;
  session_ended: boolean;
  active_participants: Array<{
    user_id: number;
    peer_id: string;
    user_email: string;
  }>;
}

interface SSEEvent {
  type: 'connected' | 'session_update' | 'participant_joined' | 'error';
  message?: string;
  data?: SessionUpdate;
  timestamp?: number;
}

interface UseVideoSessionSSEReturn {
  sessionStatus: SessionUpdate | null;
  isConnected: boolean;
  lastEvent: SSEEvent | null;
  error: string | null;
}

export function useVideoSessionSSE(appointmentId: string | undefined): UseVideoSessionSSEReturn {
  const [sessionStatus, setSessionStatus] = useState<SessionUpdate | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<SSEEvent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!appointmentId) return;

    const connectSSE = () => {
      try {
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');
        
        if (!token) {
          setError('No authentication token found');
          return;
        }

        // Create SSE connection with token in URL (since EventSource doesn't support headers)
        const url = `${import.meta.env.VITE_API_URL}/api/video/session-events/?appointment_id=${appointmentId}&token=${encodeURIComponent(token)}`;
        const eventSource = new EventSource(url);
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          console.log('🔗 SSE connection opened');
          setIsConnected(true);
          setError(null);
        };

        eventSource.onmessage = (event) => {
          try {
            const eventData: SSEEvent = JSON.parse(event.data);
            console.log('📡 SSE event received:', eventData);
            
            setLastEvent(eventData);

            switch (eventData.type) {
              case 'connected':
                console.log('✅ SSE connected successfully');
                break;
                
              case 'session_update':
                if (eventData.data) {
                  setSessionStatus(eventData.data);
                  console.log('📊 Session status updated:', eventData.data);
                }
                break;
                
              case 'participant_joined':
                if (eventData.data) {
                  setSessionStatus(eventData.data);
                  console.log('🎉 Participant joined!', eventData.message);
                  
                  // You can trigger additional actions here, like showing a toast
                  if (window.toast) {
                    window.toast.success(eventData.message || 'Other participant joined!');
                  }
                }
                break;
                
              case 'error':
                console.error('❌ SSE error:', eventData.message);
                setError(eventData.message || 'SSE error occurred');
                break;
            }
          } catch (parseError) {
            console.error('Failed to parse SSE event:', parseError);
          }
        };

        eventSource.onerror = (event) => {
          console.error('❌ SSE connection error:', event);
          setIsConnected(false);
          
          // Attempt to reconnect after 3 seconds
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('🔄 Attempting to reconnect SSE...');
            connectSSE();
          }, 3000);
        };

      } catch (error) {
        console.error('Failed to create SSE connection:', error);
        setError('Failed to establish real-time connection');
      }
    };

    // Initial connection
    connectSSE();

    // Cleanup function
    return () => {
      if (eventSourceRef.current) {
        console.log('🔌 Closing SSE connection');
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      setIsConnected(false);
    };
  }, [appointmentId]);

  return {
    sessionStatus,
    isConnected,
    lastEvent,
    error
  };
}