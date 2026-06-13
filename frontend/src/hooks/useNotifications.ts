import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { showNotificationToast } from '../components/NotificationToast';
import { useNavigate } from 'react-router-dom';

// Configuration: Automatically detect WebSocket availability
// Falls back to HTTP polling if WebSocket connection fails
const ENABLE_WEBSOCKET = true; // Always try WebSocket first, fallback to polling

interface Notification {
  id: number;
  notification_type: string;
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  is_read: boolean;
  created_at: string;
  read_at?: string;
  metadata?: Record<string, any>;
  appointment?: number;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connected, setConnected] = useState(false);
  const [usingPolling, setUsingPolling] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout>();
  const lastFetchedIdRef = useRef<number>(0);
  
  const handleNotificationClick = useCallback((notification: Notification) => {
    // Navigate based on notification type
    if (notification.notification_type === 'session_starting' && notification.metadata?.action_url) {
      navigate(notification.metadata.action_url);
    } else if (notification.notification_type === 'appointment_confirmed' && notification.appointment) {
      navigate(`/appointments/${notification.appointment}`);
    } else if (notification.notification_type === 'message_received' && notification.metadata?.chat_url) {
      navigate(notification.metadata.chat_url);
    }
  }, [navigate]);
  
  const showToast = useCallback((notification: Notification) => {
    showNotificationToast(notification, () => handleNotificationClick(notification));
  }, [handleNotificationClick]);
  
  const fetchNotifications = async (showNewToasts = false) => {
    if (!token) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const notifList = Array.isArray(data) ? data : (data.results || []);
        
        // Show toasts for new notifications (only when polling)
        if (showNewToasts && lastFetchedIdRef.current > 0) {
          const newNotifications = notifList.filter(
            (n: Notification) => n.id > lastFetchedIdRef.current && !n.is_read
          );
          newNotifications.forEach((n: Notification) => showToast(n));
        }
        
        // Update last fetched ID
        if (notifList.length > 0) {
          lastFetchedIdRef.current = Math.max(...notifList.map((n: Notification) => n.id));
        }
        
        setNotifications(notifList);
        setUnreadCount(notifList.filter((n: Notification) => !n.is_read).length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };
  
  // Stop polling when WebSocket connects
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = undefined;
    }
    setUsingPolling(false);
  }, []);
  
  // Start polling as fallback
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    setUsingPolling(true);
    console.log('Using HTTP polling for notifications');
    
    // Fetch immediately
    fetchNotifications();
    
    // Poll every 10 seconds
    pollingIntervalRef.current = setInterval(() => {
      fetchNotifications();
    }, 10000);
  }, []);
  
  const connectWebSocket = useCallback(() => {
    if (!token || !user || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }
    
    const wsUrl = `${import.meta.env.VITE_WS_URL}/notifications/?token=${token}`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('✅ WebSocket connected - Real-time notifications active');
      setConnected(true);
      stopPolling(); // Stop polling when WebSocket connects
      reconnectAttempts.current = 0;
      
      // Fetch initial notifications
      fetchNotifications(false);
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle different message types
        if (data.type === 'notification') {
          const notification = data.notification;
          
          // Add to notifications list
          setNotifications(prev => [notification, ...prev]);
          
          // Update unread count if not read
          if (!notification.is_read) {
            setUnreadCount(prev => prev + 1);
          }
          
          // Show toast notification
          showToast(notification);
        } else if (data.type === 'notification_read') {
          // Update notification as read
          setNotifications(prev =>
            prev.map(n =>
              n.id === data.notification_id ? { ...n, is_read: true } : n
            )
          );
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      } catch (error) {
        console.error('Error parsing notification:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setConnected(false);
      
      // Start polling as fallback
      if (token && user) {
        startPolling();
        
        // Attempt reconnection with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
        reconnectAttempts.current += 1;
        
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log(`Reconnecting WebSocket... (attempt ${reconnectAttempts.current})`);
          connectWebSocket();
        }, delay);
      }
    };
    
    wsRef.current = ws;
  }, [token, user, showToast, stopPolling, startPolling]);
  
  useEffect(() => {
    if (!token || !user) {
      return;
    }
    
    if (ENABLE_WEBSOCKET) {
      // Try WebSocket first
      connectWebSocket();
    } else {
      // Use polling only
      startPolling();
    }
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [token, user, connectWebSocket, startPolling]);
  
  const markAsRead = useCallback(async (notificationId: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        action: 'mark_read',
        notification_id: notificationId
      }));
    } else if (token) {
      // HTTP fallback
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/${notificationId}/mark-read/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
    
    // Update local state
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, is_read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, [token]);
  
  const markAllAsRead = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        action: 'mark_all_read'
      }));
      
      // Update local state
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    }
  }, []);
  
  return {
    notifications,
    unreadCount,
    connected,
    usingPolling,
    markAsRead,
    markAllAsRead,
    refetch: () => fetchNotifications(false)
  };
};
