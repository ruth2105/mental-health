"""
Notification service for creating and broadcasting notifications
"""
from django.utils import timezone
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Notification, NotificationPreferences
from .serializers import NotificationSerializer
from .email_service import EmailService


class NotificationService:
    """Service for managing notification creation and delivery"""
    
    @staticmethod
    def create_notification(
        recipient,
        notification_type,
        title,
        message,
        priority='medium',
        **kwargs
    ):
        """
        Create and broadcast a notification
        
        Args:
            recipient: User object who will receive the notification
            notification_type: Type of notification (from Notification.TYPE_CHOICES)
            title: Notification title
            message: Notification message
            priority: Priority level (high/medium/low)
            **kwargs: Additional fields (appointment, metadata, etc.)
        
        Returns:
            Notification object
        """
        # Create notification
        notification = Notification.objects.create(
            recipient=recipient,
            notification_type=notification_type,
            title=title,
            message=message,
            priority=priority,
            appointment=kwargs.get('appointment'),
            metadata=kwargs.get('metadata', {})
        )
        
        # Check user preferences
        if NotificationService.should_deliver_notification(recipient, notification):
            # Broadcast via WebSocket
            NotificationService.broadcast_notification(notification)
            
            # Send email if enabled and high priority
            prefs = NotificationService.get_user_preferences(recipient)
            if priority == 'high' or (prefs and prefs.enable_email):
                NotificationService.send_email_notification(notification)
        
        return notification
    
    @staticmethod
    def broadcast_notification(notification):
        """
        Broadcast notification via WebSocket
        
        Args:
            notification: Notification object to broadcast
        """
        try:
            channel_layer = get_channel_layer()
            group_name = f'notifications_{notification.recipient.id}'
            
            # Serialize notification
            serializer = NotificationSerializer(notification)
            
            # Send to channel group
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    'type': 'notification_message',
                    'notification': serializer.data
                }
            )
            
            # Mark as delivered via WebSocket
            notification.delivered_via_websocket = True
            notification.delivery_attempts += 1
            notification.save()
            
        except Exception as e:
            print(f"Failed to broadcast notification: {e}")
            notification.delivery_attempts += 1
            notification.save()
    
    @staticmethod
    def send_email_notification(notification):
        """
        Send notification via email as fallback
        
        Args:
            notification: Notification object to send
        """
        try:
            # Use existing EmailService
            # This is a placeholder - implement based on your EmailService
            notification.delivered_via_email = True
            notification.save()
        except Exception as e:
            print(f"Failed to send email notification: {e}")
    
    @staticmethod
    def get_user_preferences(user):
        """
        Get or create user notification preferences
        
        Args:
            user: User object
        
        Returns:
            NotificationPreferences object
        """
        prefs, created = NotificationPreferences.objects.get_or_create(user=user)
        return prefs
    
    @staticmethod
    def should_deliver_notification(user, notification):
        """
        Check if notification should be delivered based on user preferences
        
        Args:
            user: User object
            notification: Notification object
        
        Returns:
            Boolean indicating if notification should be delivered
        """
        # High priority notifications always get delivered
        if notification.priority == 'high':
            return True
        
        # Get user preferences
        prefs = NotificationService.get_user_preferences(user)
        
        # Check if WebSocket is enabled
        if not prefs.enable_websocket:
            return False
        
        # Check category preferences
        category_map = {
            'appointment_confirmed': prefs.appointment_notifications,
            'appointment_cancelled': prefs.appointment_notifications,
            'appointment_reminder': prefs.appointment_notifications,
            'appointment_updated': prefs.appointment_notifications,
            'message_received': prefs.message_notifications,
            'assessment_completed': prefs.assessment_notifications,
            'session_starting': prefs.session_notifications,
            'session_ended': prefs.session_notifications,
            'feedback_requested': prefs.session_notifications,
            'therapist_registered': prefs.system_notifications,
            'payment_failed': prefs.system_notifications,
            'system_alert': prefs.system_notifications,
        }
        
        category_enabled = category_map.get(notification.notification_type, True)
        if not category_enabled:
            return False
        
        # Check quiet hours
        if prefs.quiet_hours_enabled and prefs.quiet_hours_start and prefs.quiet_hours_end:
            current_time = timezone.now().time()
            if prefs.quiet_hours_start <= current_time <= prefs.quiet_hours_end:
                return False
        
        return True
    
    @staticmethod
    def consolidate_messages(recipient, sender, time_window_seconds=30):
        """
        Check if recent notifications from same sender should be consolidated
        
        Args:
            recipient: User receiving notification
            sender: User sending messages
            time_window_seconds: Time window for consolidation (default 30 seconds)
        
        Returns:
            Boolean indicating if messages should be consolidated
        """
        from datetime import timedelta
        
        time_threshold = timezone.now() - timedelta(seconds=time_window_seconds)
        
        recent_notifications = Notification.objects.filter(
            recipient=recipient,
            notification_type='message_received',
            created_at__gte=time_threshold,
            metadata__sender_id=sender.id
        ).count()
        
        return recent_notifications > 0
    
    @staticmethod
    def get_unread_count(user):
        """
        Get count of unread notifications for a user
        
        Args:
            user: User object
        
        Returns:
            Integer count of unread notifications
        """
        return Notification.objects.filter(recipient=user, is_read=False).count()
    
    @staticmethod
    def get_recent_notifications(user, limit=10):
        """
        Get recent notifications for a user
        
        Args:
            user: User object
            limit: Maximum number of notifications to return
        
        Returns:
            QuerySet of Notification objects
        """
        return Notification.objects.filter(recipient=user).order_by('-created_at')[:limit]
    
    @staticmethod
    def mark_as_read(notification_id, user):
        """
        Mark a notification as read
        
        Args:
            notification_id: ID of notification to mark as read
            user: User object (for permission check)
        
        Returns:
            Boolean indicating success
        """
        try:
            notification = Notification.objects.get(id=notification_id, recipient=user)
            notification.is_read = True
            notification.read_at = timezone.now()
            notification.save()
            return True
        except Notification.DoesNotExist:
            return False
    
    @staticmethod
    def mark_all_as_read(user):
        """
        Mark all notifications as read for a user
        
        Args:
            user: User object
        
        Returns:
            Integer count of notifications marked as read
        """
        count = Notification.objects.filter(recipient=user, is_read=False).update(
            is_read=True,
            read_at=timezone.now()
        )
        return count
