from django.db import models
from django.conf import settings
import uuid


# -------------------------------
# 1️⃣ Therapy / Consultation Sessions
# -------------------------------
class TherapySession(models.Model):
    patient = models.ForeignKey(
        "users.PatientProfile",
        on_delete=models.CASCADE,
        related_name="therapy_sessions"
    )
    doctor = models.ForeignKey(
        "users.DoctorProfile",
        on_delete=models.CASCADE,
        related_name="therapy_sessions"
    )

    room_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    started = models.BooleanField(default=False)
    ended = models.BooleanField(default=False)
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Session {self.id} - {self.patient.user.email} with Dr. {self.doctor.user.email}"


# -------------------------------
# 2️⃣ Appointments
# -------------------------------
class Appointment(models.Model):
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='appointments_as_patient'
    )
    therapist = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='appointments_as_therapist'
    )

    scheduled_time = models.DateTimeField()
    paid = models.BooleanField(default=False)
    status = models.CharField(
        max_length=20,
        choices=[
            ('Scheduled', 'Scheduled'),
            ('Completed', 'Completed'),
            ('Cancelled', 'Cancelled')
        ],
        default='Scheduled'
    )

    session = models.OneToOneField(
        TherapySession,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='appointment'
    )
    
    # Session notes for therapists
    session_notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Appointment for {self.patient.email} with {self.therapist.email} at {self.scheduled_time}"


# -------------------------------
# 3️⃣ Appointment Feedback
# -------------------------------
class AppointmentFeedback(models.Model):
    appointment = models.OneToOneField(
        Appointment,
        on_delete=models.CASCADE,
        related_name='feedback'
    )

    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='appointment_feedbacks'
    )

    rating = models.PositiveIntegerField()  # e.g., 1–5
    feedback_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('appointment', 'patient')

    def __str__(self):
        return f"Feedback for Appointment {self.appointment.id} by {self.patient.email}"
