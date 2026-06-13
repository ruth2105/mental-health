import { useState, useEffect, useCallback } from 'react';

interface Message {
  id: number;
  content: string;
  sender_id: number;
  sender_name: string;
  sender_email: string;
  created_at: string;
  is_read: boolean;
}

interface UseSimpleChatReturn {
  messages: Message[];
  sendMessage: (content: string) => Promise<boolean>;
  isConnected: boolean;
  error: string | null;
  refreshMessages: () => void;
}

export function useSimpleChat(roomId: number | null): UseSimpleChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const refreshMessages = useCallback(async () => {
    if (!roomId) return;

    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/chat/rooms/${roomId}/messages/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        setIsConnected(true);
        setError(null);
      } else {
        setError('Failed to load messages');
        setIsConnected(false);
      }
    } catch (err) {
      console.error('Failed to refresh messages:', err);
      setError('Connection failed');
      setIsConnected(false);
    }
  }, [roomId, apiUrl]);

  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!roomId || !content.trim()) return false;

    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/chat/rooms/${roomId}/send_message/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: content.trim() })
      });

      if (response.ok) {
        // Refresh messages after sending
        setTimeout(refreshMessages, 100);
        return true;
      } else {
        setError('Failed to send message');
        return false;
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Send failed');
      return false;
    }
  }, [roomId, apiUrl, refreshMessages]);

  // Auto-refresh messages every 2 seconds for real-time effect
  useEffect(() => {
    if (!roomId) return;

    // Initial load
    refreshMessages();

    // Set up polling
    const interval = setInterval(refreshMessages, 2000);

    return () => clearInterval(interval);
  }, [roomId, refreshMessages]);

  return {
    messages,
    sendMessage,
    isConnected,
    error,
    refreshMessages
  };
}