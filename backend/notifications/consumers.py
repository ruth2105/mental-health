"""
WebSocket consumer for real-time notifications
"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone


class NotificationConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for handling real-time notification delivery
    """
    
    async def connect(self):
        """Handle WebSocket connection"""
        # Get user from scope (set by AuthMiddlewareStack)
        self.user = self.scope['user']
        
        # Reject unauthenticated connections
        if not self.user.is_authenticated:
            await self.close()
            return
        
        # Create user-specific channel group
        self.group_name = f'notifications_{self.user.id}'
        
        # Join the notification group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        
        # Accept the WebSocket connection
        await self.accept()
        
        # Send queued notifications on connect
        await self.send_queued_notifications()
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        # Leave the notification group
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )
    
    async def receive(self, text_data):
        """Handle incoming messages from WebSocket"""
        try:
            data = json.loads(text_data)
            action = data.get('action')
            
            if action == 'mark_read':
                notification_id = data.get('notification_id')
                await self.mark_notification_read(notification_id)
            elif action == 'mark_all_read':
                await self.mark_all_read()
            else:
                await self.send(text_data=json.dumps({
                    'error': 'Unknown action'
                }))
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'error': 'Invalid JSON'
            }))
        except Exception as e:
            await self.send(text_data=json.dumps({
                'error': str(e)
            }))
    
    async def notification_message(self, event):
        """
        Handle notification messages sent to the group
        Called when a notification is broadcast to this user's group
        """
        notification = event['notification']
        
        # Send notification to WebSocket
        await self.send(text_data=json.dumps(notification))
    
    @database_sync_to_async
    def send_queued_notifications(self):
        """Send any undelivered notifications when user reconnects"""
        from .models import Notification
        from .serializers import NotificationSerializer
        
        # Get undelivered notifications
        notifications = Notification.objects.filter(
            recipient=self.user,
            delivered_via_websocket=False
        ).order_by('created_at')[:50]  # Limit to 50 most recent
        
        # Send each notification
        for notification in notifications:
            serializer = NotificationSerializer(notification)
            self.send(text_data=json.dumps(serializer.data))
            
            # Mark as delivered
            notification.delivered_via_websocket = True
            notification.save()
    
    @database_sync_to_async
    def mark_notification_read(self, notification_id):
        """Mark a single notification as read"""
        from .models import Notification
        
        try:
            notification = Notification.objects.get(
                id=notification_id,
                recipient=self.user
            )
            notification.is_read = True
            notification.read_at = timezone.now()
            notification.save()
            
            # Send confirmation
            return {
                'success': True,
                'notification_id': notification_id
            }
        except Notification.DoesNotExist:
            return {
                'success': False,
                'error': 'Notification not found'
            }
    
    @database_sync_to_async
    def mark_all_read(self):
        """Mark all notifications as read for this user"""
        from .models import Notification
        
        count = Notification.objects.filter(
            recipient=self.user,
            is_read=False
        ).update(
            is_read=True,
            read_at=timezone.now()
        )
        
        return {
            'success': True,
            'count': count
        }
