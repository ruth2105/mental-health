import React from 'react';
import { toast } from 'sonner';
import { Bell, Calendar, Video, MessageCircle, AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';

interface NotificationData {
  id: number;
  notification_type: string;
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  metadata?: Record<string, any>;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'appointment_confirmed':
    case 'appointment_reminder':
    case 'appointment_updated':
      return Calendar;
    case 'session_starting':
    case 'session_ended':
      return Video;
    case 'message_received':
      return MessageCircle;
    case 'appointment_cancelled':
    case 'payment_failed':
      return XCircle;
    case 'assessment_completed':
    case 'feedback_requested':
      return CheckCircle;
    case 'system_alert':
      return AlertCircle;
    default:
      return Bell;
  }
};

const getNotificationColor = (priority: string, type: string) => {
  if (priority === 'high' || type === 'payment_failed' || type === 'appointment_cancelled') {
    return 'text-red-600';
  }
  if (type === 'session_starting' || type === 'appointment_confirmed') {
    return 'text-green-600';
  }
  if (type === 'message_received') {
    return 'text-blue-600';
  }
  return 'text-gray-600';
};

export const showNotificationToast = (notification: NotificationData, onClick?: () => void) => {
  const Icon = getNotificationIcon(notification.notification_type);
  const iconColor = getNotificationColor(notification.priority, notification.notification_type);
  
  const toastContent = (
    <div className="flex items-start gap-3 cursor-pointer" onClick={onClick}>
      <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm">{notification.title}</p>
        <p className="text-gray-600 text-sm mt-0.5">{notification.message}</p>
        {notification.metadata?.action_text && (
          <p className="text-blue-600 text-xs mt-1 font-medium">
            {notification.metadata.action_text} →
          </p>
        )}
      </div>
    </div>
  );

  if (notification.priority === 'high') {
    toast.error(toastContent, {
      duration: 8000,
      className: 'cursor-pointer',
    });
  } else if (notification.priority === 'medium') {
    toast.info(toastContent, {
      duration: 6000,
      className: 'cursor-pointer',
    });
  } else {
    toast(toastContent, {
      duration: 5000,
      className: 'cursor-pointer',
    });
  }
};
