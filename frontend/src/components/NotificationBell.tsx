import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../context/AuthContext';
import { Bell, BellRing, Video } from 'lucide-react';
import { toast } from 'sonner';

export const NotificationBell = () => {
  const { notifications, unreadCount, connected, usingPolling, markAsRead, markAllAsRead } = useNotifications();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    setIsOpen(false);
    
    // Handle different notification types
    const actionUrl = notification.metadata?.action_url;
    
    if (actionUrl) {
      switch (notification.notification_type) {
        case 'session_starting':
          toast.success('Joining video session...');
          navigate(actionUrl);
          break;
        case 'session_ready':
          toast.success('Session is ready to start!');
          navigate(actionUrl);
          break;
        case 'appointment_confirmed':
        case 'appointment_cancelled':
        case 'appointment_updated':
          navigate(actionUrl);
          break;
        case 'feedback_requested':
          toast.info('Please provide your feedback');
          navigate(actionUrl);
          break;
        default:
          // Default navigation for any notification with action_url
          navigate(actionUrl);
      }
    } else {
      // Fallback navigation based on notification type
      switch (notification.notification_type) {
        case 'session_starting':
        case 'session_ready':
          if (notification.metadata?.appointment_id) {
            toast.success('Joining video session...');
            navigate(`/session/${notification.metadata.appointment_id}`);
          }
          break;
        default:
          // Role-aware fallback navigation
          if (user?.role === 'therapist') {
            navigate('/therapist/appointments');
          } else if (user?.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/appointments');
          }
      }
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-red-500 bg-red-50';
      case 'medium':
        return 'border-l-4 border-blue-500 bg-blue-50';
      case 'low':
        return 'border-l-4 border-gray-500 bg-gray-50';
      default:
        return 'border-l-4 border-gray-300';
    }
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
        aria-label="Notifications"
      >
        {unreadCount > 0 ? (
          <BellRing className="h-6 w-6 text-blue-600" />
        ) : (
          <Bell className="h-6 w-6" />
        )}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>
            {/* Connection Status */}
            <div className="flex items-center gap-2 text-xs">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : usingPolling ? 'bg-yellow-500' : 'bg-gray-400'}`} />
              <span className="text-gray-600">
                {connected ? 'Real-time' : usingPolling ? 'Polling' : 'Offline'}
              </span>
            </div>
          </div>
          
          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.is_read ? 'bg-blue-50' : ''
                    } ${getPriorityColor(notification.priority)}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        {(notification.notification_type === 'session_starting' || notification.notification_type === 'session_ready') && (
                          <Video className="h-4 w-4 text-green-600" />
                        )}
                        {notification.notification_type === 'appointment_confirmed' && (
                          <Bell className="h-4 w-4 text-blue-600" />
                        )}
                        {notification.notification_type === 'feedback_requested' && (
                          <BellRing className="h-4 w-4 text-orange-600" />
                        )}
                        <h4 className={`text-sm font-semibold ${
                          !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h4>
                      </div>
                      {!notification.is_read && (
                        <span className="ml-2 h-2 w-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500">{formatTime(notification.created_at)}</p>
                      {(notification.notification_type === 'session_starting' || notification.notification_type === 'session_ready') && (
                        <span className="text-xs font-medium text-green-600">Click to join →</span>
                      )}
                      {notification.notification_type === 'feedback_requested' && (
                        <span className="text-xs font-medium text-orange-600">Give feedback →</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
