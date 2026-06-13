"""
Serializers for notification models
"""
from rest_framework import serializers
from .models import Notification, NotificationPreferences


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model"""
    
    recipient_email = serializers.EmailField(source='recipient.email', read_only=True)
    recipient_name = serializers.CharField(source='recipient.full_name', read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id',
            'recipient',
            'recipient_email',
            'recipient_name',
            'notification_type',
            'title',
            'message',
            'priority',
            'is_read',
            'created_at',
            'read_at',
            'appointment',
            'metadata',
            'delivered_via_websocket',
            'delivered_via_email',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'delivered_via_websocket',
            'delivered_via_email',
        ]


class NotificationPreferencesSerializer(serializers.ModelSerializer):
    """Serializer for NotificationPreferences model"""
    
    class Meta:
        model = NotificationPreferences
        fields = [
            'user',
            'enable_websocket',
            'enable_email',
            'appointment_notifications',
            'message_notifications',
            'assessment_notifications',
            'session_notifications',
            'system_notifications',
            'quiet_hours_enabled',
            'quiet_hours_start',
            'quiet_hours_end',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']
    
    def validate(self, data):
        """Validate quiet hours configuration"""
        quiet_hours_enabled = data.get('quiet_hours_enabled')
        quiet_hours_start = data.get('quiet_hours_start')
        quiet_hours_end = data.get('quiet_hours_end')
        
        if quiet_hours_enabled:
            if not quiet_hours_start or not quiet_hours_end:
                raise serializers.ValidationError(
                    "Both quiet_hours_start and quiet_hours_end must be set when quiet hours are enabled"
                )
        
        return data
