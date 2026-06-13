import { useState, useEffect, useRef, useCallback } from 'react';

interface Message {
  id: number;
  content: string;
  sender_id: number;
  sender_name: string;
  sender_email: string;
  created_at: string;
  is_read: boolean;
}

interface UseRealtimeChatReturn {
  messages: Message[];
  sendMessage: (content: string) => void;
  isConnected: boolean;
  isTyping: boolean;
  setTyping: (typing: boolean) => void;
  error: string | null;
}

export function useRealtimeChat(roomId: number | null): UseRealtimeChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connectWebSocket = useCallback(() => {
    if (!roomId) {
      console.log('⚠️ No room ID provided for WebSocket connection');
      return;
    }

    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      
      if (!token) {
        console.error('❌ No authentication token found');
        setError('No authentication token found');
        return;
      }

      // Create WebSocket connection
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const wsUrl = `ws://localhost:8000/ws/chat/${roomId}/?token=${encodeURIComponent(token)}`;
      console.log('🔌 Attempting WebSocket connection to:', wsUrl);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('🔗 Chat WebSocket connected successfully!');
        console.log('🔗 WebSocket readyState:', ws.readyState);
        console.log('🔗 WebSocket URL:', wsUrl);
        setIsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 Chat message received:', data);

          switch (data.type) {
            case 'chat_message':
              setMessages(prev => {
                // Check if message already exists to avoid duplicates
                const exists = prev.some(msg => msg.id === data.message.id);
                if (exists) return prev;
                
                return [...prev, data.message].sort((a, b) => 
                  new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                );
              });
              break;
              
            case 'typing':
              setIsTyping(data.is_typing);
              
              // Clear typing indicator after 3 seconds
              if (data.is_typing && typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
              }
              
              if (data.is_typing) {
                typingTimeoutRef.current = setTimeout(() => {
                  setIsTyping(false);
                }, 3000);
              }
              break;
          }
        } catch (parseError) {
          console.error('Failed to parse chat message:', parseError);
        }
      };

      ws.onclose = (event) => {
        console.log('🔌 Chat WebSocket disconnected:', event.code, event.reason);
        console.log('🔌 Close event details:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
        setIsConnected(false);
        
        // Don't auto-reconnect if it was a clean close or authentication error
        if (event.code === 1000 || event.code === 1008) {
          console.log('🚫 Not reconnecting due to clean close or auth error');
          return;
        }
        
        // Attempt to reconnect after 3 seconds
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('🔄 Attempting to reconnect chat WebSocket...');
          connectWebSocket();
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error('❌ Chat WebSocket error:', error);
        console.error('❌ WebSocket state when error occurred:', ws.readyState);
        console.error('❌ WebSocket URL:', wsUrl);
        setError('WebSocket connection failed');
      };

    } catch (error) {
      console.error('Failed to create chat WebSocket:', error);
      setError('Failed to establish chat connection');
    }
  }, [roomId]);

  const sendMessage = useCallback((content: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      return;
    }

    if (!content.trim()) return;

    try {
      wsRef.current.send(JSON.stringify({
        type: 'chat_message',
        message: content.trim()
      }));
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, []);

  const setTyping = useCallback((typing: boolean) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      wsRef.current.send(JSON.stringify({
        type: 'typing',
        is_typing: typing
      }));
    } catch (error) {
      console.error('Failed to send typing indicator:', error);
    }
  }, []);

  // Load initial messages when room changes
  useEffect(() => {
    if (!roomId) return;

    const loadInitialMessages = async () => {
      try {
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/chat/rooms/${roomId}/messages/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        }
      } catch (error) {
        console.error('Failed to load initial messages:', error);
      }
    };

    loadInitialMessages();
  }, [roomId]);

  // Connect WebSocket when room changes
  useEffect(() => {
    if (roomId) {
      connectWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      setIsConnected(false);
    };
  }, [roomId, connectWebSocket]);

  return {
    messages,
    sendMessage,
    isConnected,
    isTyping,
    setTyping,
    error
  };
}