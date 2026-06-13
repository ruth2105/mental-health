from django.db import models
from django.conf import settings


class Notification(models.Model):
    PRIORITY_CHOICES = [
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]
    
    TYPE_CHOICES = [
        ('appointment_confirmed', 'Appointment Confirmed'),
        ('appointment_cancelled', 'Appointment Cancelled'),
        ('appointment_reminder', 'Appointment Reminder'),
        ('appointment_updated', 'Appointment Updated'),
        ('message_received', 'Message Received'),
        ('assessment_completed', 'Assessment Completed'),
        ('session_starting', 'Session Starting'),
        ('session_ended', 'Session Ended'),
        ('feedback_requested', 'Feedback Requested'),
        ('therapist_registered', 'Therapist Registered'),
        ('payment_failed', 'Payment Failed'),
        ('system_alert', 'System Alert'),
    ]
    
    id = models.BigAutoField(primary_key=True)
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    notification_type = models.CharField(max_length=50, choices=TYPE_CHOICES, default='system_alert')
    title = models.CharField(max_length=255)
    message = models.TextField()
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # Optional references to related objects
    appointment = models.ForeignKey(
        'appointments.Appointment',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='notifications'
    )
    # Note: Assessment model reference will be added when assessment app is created
    # assessment = models.ForeignKey('assessments.Assessment', null=True, blank=True, on_delete=models.SET_NULL)
    
    # Metadata for additional context
    metadata = models.JSONField(default=dict, blank=True)
    
    # Delivery tracking
    delivered_via_websocket = models.BooleanField(default=False)
    delivered_via_email = models.BooleanField(default=False)
    delivery_attempts = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', '-created_at']),
            models.Index(fields=['recipient', 'is_read']),
        ]
    
    def __str__(self):
        return f"{self.recipient.email} - {self.title}"



class NotificationPreferences(models.Model):
    """User preferences for notification delivery and categories"""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notification_preferences'
    )
    
    # Channel preferences
    enable_websocket = models.BooleanField(default=True)
    enable_email = models.BooleanField(default=True)
    
    # Category preferences
    appointment_notifications = models.BooleanField(default=True)
    message_notifications = models.BooleanField(default=True)
    assessment_notifications = models.BooleanField(default=True)
    session_notifications = models.BooleanField(default=True)
    system_notifications = models.BooleanField(default=True)
    
    # Quiet hours
    quiet_hours_enabled = models.BooleanField(default=False)
    quiet_hours_start = models.TimeField(null=True, blank=True)
    quiet_hours_end = models.TimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Notification Preferences for {self.user.email}"
