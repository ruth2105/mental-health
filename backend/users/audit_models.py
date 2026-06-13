"""
Audit logging models for tracking system activities
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class AuditLog(models.Model):
    """Track all important system activities"""
    
    ACTION_CHOICES = [
        ('user_login', 'User Login'),
        ('user_logout', 'User Logout'),
        ('user_created', 'User Created'),
        ('user_updated', 'User Updated'),
        ('user_deleted', 'User Deleted'),
        ('therapist_approved', 'Therapist Approved'),
        ('therapist_rejected', 'Therapist Rejected'),
        ('appointment_created', 'Appointment Created'),
        ('appointment_cancelled', 'Appointment Cancelled'),
        ('payment_processed', 'Payment Processed'),
        ('payment_refunded', 'Payment Refunded'),
        ('video_session_started', 'Video Session Started'),
        ('video_session_ended', 'Video Session Ended'),
        ('settings_changed', 'Settings Changed'),
        ('user_blocked', 'User Blocked'),
        ('user_unblocked', 'User Unblocked'),
    ]
    
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs'
    )
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    target_user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs_as_target'
    )
    description = models.TextField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    timestamp = models.DateTimeField(default=timezone.now, db_index=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['-timestamp']),
            models.Index(fields=['action']),
            models.Index(fields=['user']),
        ]
    
    def __str__(self):
        return f"{self.action} by {self.user} at {self.timestamp}"


class SystemMetrics(models.Model):
    """Store daily system metrics for analytics"""
    
    date = models.DateField(unique=True, db_index=True)
    
    # User metrics
    total_users = models.IntegerField(default=0)
    new_users = models.IntegerField(default=0)
    active_users = models.IntegerField(default=0)
    total_patients = models.IntegerField(default=0)
    total_therapists = models.IntegerField(default=0)
    
    # Appointment metrics
    total_appointments = models.IntegerField(default=0)
    completed_appointments = models.IntegerField(default=0)
    cancelled_appointments = models.IntegerField(default=0)
    scheduled_appointments = models.IntegerField(default=0)
    
    # Financial metrics
    total_revenue = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_payments = models.IntegerField(default=0)
    total_refunds = models.IntegerField(default=0)
    
    # Session metrics
    total_video_sessions = models.IntegerField(default=0)
    avg_session_duration = models.IntegerField(default=0)  # in minutes
    
    # Engagement metrics
    total_messages = models.IntegerField(default=0)
    total_notifications = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date']
        verbose_name_plural = 'System Metrics'
    
    def __str__(self):
        return f"Metrics for {self.date}"
