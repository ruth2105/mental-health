from django.db import models
from django.conf import settings


class VideoSession(models.Model):
    """Stores a record for each realtime video session started via the API.

    - `appointment` links to an `appointments.Appointment` if available
    - `patient` and `doctor` use the project's AUTH_USER_MODEL for easy lookups
    - `provider` stores which SDK/provider produced the token (twilio/agora/vonage/dummy)
    - `room_id` is a provider-specific room/channel identifier
    - `metadata` can store runtime details returned from provider
    """

    PROVIDER_CHOICES = (
        ('twilio', 'Twilio'),
        ('agora', 'Agora'),
        ('vonage', 'Vonage'),
        ('dummy', 'Dummy'),
    )

    id = models.BigAutoField(primary_key=True)
    appointment = models.ForeignKey(
        'appointments.Appointment',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='video_sessions'
    )

    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='video_sessions_as_patient'
    )

    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='video_sessions_as_doctor'
    )

    provider = models.CharField(max_length=32, choices=PROVIDER_CHOICES, default='dummy')
    room_id = models.CharField(max_length=255, blank=True, default='')
    token = models.TextField(blank=True, default='')
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    duration_seconds = models.PositiveIntegerField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"VideoSession {self.id} ({self.provider})"
