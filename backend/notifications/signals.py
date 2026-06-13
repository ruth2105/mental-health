"""
Signal handlers for automatic notification creation
"""
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from appointments.models import Appointment, AppointmentFeedback
from payments.models import Payment
from .services import NotificationService

# Try to import optional models
try:
    from video.models import VideoSession
    VIDEO_SESSION_AVAILABLE = True
except ImportError:
    VIDEO_SESSION_AVAILABLE = False
    VideoSession = None

try:
    from chat.models import Message
    CHAT_AVAILABLE = True
except ImportError:
    CHAT_AVAILABLE = False
    Message = None

try:
    from users.models import User
    USER_AVAILABLE = True
except ImportError:
    USER_AVAILABLE = False
    User = None


@receiver(post_save, sender=Appointment)
def handle_appointment_notification(sender, instance, created, **kwargs):
    """
    Send notifications when appointments are created or updated
    """
    if created:
        # Notify therapist of new booking
        NotificationService.create_notification(
            recipient=instance.therapist,
            notification_type='appointment_confirmed',
            title='New Appointment Booked',
            message=f'{instance.patient.full_name or instance.patient.email} has booked an appointment for {instance.scheduled_time.strftime("%B %d, %Y at %I:%M %p")}',
            priority='high',
            appointment=instance,
            metadata={
                'patient_id': instance.patient.id,
                'appointment_id': instance.id,
                'scheduled_time': instance.scheduled_time.isoformat(),
                'action_url': f'/therapist/appointments'
            }
        )
        
        # Notify patient of confirmation
        NotificationService.create_notification(
            recipient=instance.patient,
            notification_type='appointment_confirmed',
            title='Appointment Confirmed',
            message=f'Your appointment with Dr. {instance.therapist.full_name or instance.therapist.email} is confirmed for {instance.scheduled_time.strftime("%B %d, %Y at %I:%M %p")}',
            priority='medium',
            appointment=instance,
            metadata={
                'therapist_id': instance.therapist.id,
                'appointment_id': instance.id,
                'scheduled_time': instance.scheduled_time.isoformat(),
                'action_url': f'/appointments/{instance.id}'
            }
        )
    else:
        # Check if status changed to cancelled
        if instance.status == 'Cancelled':
            # Notify both patient and therapist
            NotificationService.create_notification(
                recipient=instance.patient,
                notification_type='appointment_cancelled',
                title='Appointment Cancelled',
                message=f'Your appointment with Dr. {instance.therapist.full_name or instance.therapist.email} on {instance.scheduled_time.strftime("%B %d, %Y")} has been cancelled',
                priority='high',
                appointment=instance,
                metadata={
                    'therapist_id': instance.therapist.id,
                    'appointment_id': instance.id,
                    'action_url': '/appointments'
                }
            )
            
            NotificationService.create_notification(
                recipient=instance.therapist,
                notification_type='appointment_cancelled',
                title='Appointment Cancelled',
                message=f'Appointment with {instance.patient.full_name or instance.patient.email} on {instance.scheduled_time.strftime("%B %d, %Y")} has been cancelled',
                priority='medium',
                appointment=instance,
                metadata={
                    'patient_id': instance.patient.id,
                    'appointment_id': instance.id,
                    'action_url': '/therapist/appointments'
                }
            )
        
        # Check if status changed to Completed
        elif instance.status == 'Completed':
            # Notify patient to provide feedback
            NotificationService.create_notification(
                recipient=instance.patient,
                notification_type='feedback_requested',
                title='Session Completed - Feedback Requested',
                message=f'Your session with Dr. {instance.therapist.full_name or instance.therapist.email} is complete. Please share your feedback!',
                priority='medium',
                appointment=instance,
                metadata={
                    'therapist_id': instance.therapist.id,
                    'appointment_id': instance.id,
                    'action_url': f'/appointments/{instance.id}/feedback'
                }
            )
            
            # Notify therapist
            NotificationService.create_notification(
                recipient=instance.therapist,
                notification_type='session_ended',
                title='Session Marked Complete',
                message=f'Session with {instance.patient.full_name or instance.patient.email} has been marked as complete',
                priority='low',
                appointment=instance,
                metadata={
                    'patient_id': instance.patient.id,
                    'appointment_id': instance.id,
                    'action_url': '/therapist/appointments'
                }
            )
        
        # Check if payment status changed
        elif instance.paid and not created:
            # Notify therapist that payment was received
            NotificationService.create_notification(
                recipient=instance.therapist,
                notification_type='appointment_updated',
                title='Payment Received',
                message=f'Payment received for appointment with {instance.patient.full_name or instance.patient.email} on {instance.scheduled_time.strftime("%B %d, %Y")}',
                priority='low',
                appointment=instance,
                metadata={
                    'patient_id': instance.patient.id,
                    'appointment_id': instance.id,
                    'action_url': '/therapist/appointments'
                }
            )


# Payment notifications
@receiver(post_save, sender=Payment)
def handle_payment_notification(sender, instance, created, **kwargs):
    """
    Send notifications when payments are processed
    """
    if created:
        # Notify user of payment initiation
        NotificationService.create_notification(
            recipient=instance.user,
            notification_type='system_alert',
            title='Payment Processing',
            message=f'Your payment of {instance.amount} {instance.currency} is being processed',
            priority='medium',
            metadata={
                'payment_id': instance.id,
                'amount': str(instance.amount),
                'currency': instance.currency,
                'reference': instance.reference
            }
        )
    else:
        # Check if payment status changed to success
        if instance.status == 'success':
            NotificationService.create_notification(
                recipient=instance.user,
                notification_type='system_alert',
                title='Payment Successful',
                message=f'Your payment of {instance.amount} {instance.currency} was successful!',
                priority='high',
                metadata={
                    'payment_id': instance.id,
                    'amount': str(instance.amount),
                    'currency': instance.currency,
                    'reference': instance.reference,
                    'action_url': '/payment-history'
                }
            )
        elif instance.status == 'failed':
            NotificationService.create_notification(
                recipient=instance.user,
                notification_type='payment_failed',
                title='Payment Failed',
                message=f'Your payment of {instance.amount} {instance.currency} failed. Please try again.',
                priority='high',
                metadata={
                    'payment_id': instance.id,
                    'amount': str(instance.amount),
                    'currency': instance.currency,
                    'reference': instance.reference,
                    'action_url': '/payment'
                }
            )


# Feedback notifications
@receiver(post_save, sender=AppointmentFeedback)
def handle_feedback_notification(sender, instance, created, **kwargs):
    """
    Send notifications when feedback is submitted
    """
    if created:
        # Notify therapist of new feedback
        NotificationService.create_notification(
            recipient=instance.appointment.therapist,
            notification_type='system_alert',
            title='New Feedback Received',
            message=f'{instance.patient.full_name or instance.patient.email} left you a {instance.rating}-star review!',
            priority='medium',
            appointment=instance.appointment,
            metadata={
                'feedback_id': instance.id,
                'rating': instance.rating,
                'patient_id': instance.patient.id,
                'action_url': '/therapist/feedback'
            }
        )


# Chat message notifications
if CHAT_AVAILABLE and Message:
    @receiver(post_save, sender=Message)
    def handle_message_notification(sender, instance, created, **kwargs):
        """
        Send notifications when new messages are received
        """
        if created:
            # Get the receiver (the other person in the chat)
            receiver = instance.room.therapist if instance.sender == instance.room.patient else instance.room.patient
            
            NotificationService.create_notification(
                recipient=receiver,
                notification_type='message_received',
                title='New Message',
                message=f'{instance.sender.full_name or instance.sender.email}: {instance.content[:50]}{"..." if len(instance.content) > 50 else ""}',
                priority='medium',
                metadata={
                    'message_id': instance.id,
                    'sender_id': instance.sender.id,
                    'room_id': instance.room.id,
                    'action_url': f'/chat/{instance.room.id}'
                }
            )


# User profile notifications
if USER_AVAILABLE and User:
    @receiver(post_save, sender=User)
    def handle_user_notification(sender, instance, created, **kwargs):
        """
        Send notifications for user-related events
        """
        if created:
            # Welcome notification for new users
            NotificationService.create_notification(
                recipient=instance,
                notification_type='system_alert',
                title='Welcome to MindCare!',
                message=f'Welcome {instance.full_name or instance.email}! Your account has been created successfully.',
                priority='low',
                metadata={
                    'user_id': instance.id,
                    'action_url': '/patient/dashboard' if instance.role == 'patient' else '/therapist/dashboard'
                }
            )
            
            # If therapist, notify about approval process
            if instance.role == 'therapist':
                NotificationService.create_notification(
                    recipient=instance,
                    notification_type='therapist_registered',
                    title='Therapist Registration Received',
                    message='Your therapist registration is under review. You will be notified once approved.',
                    priority='medium',
                    metadata={
                        'user_id': instance.id,
                        'action_url': '/therapist/dashboard'
                    }
                )


# Only register VideoSession signal if the model is available
if VIDEO_SESSION_AVAILABLE and VideoSession:
    @receiver(post_save, sender=VideoSession)
    def handle_video_session_notification(sender, instance, created, **kwargs):
        """
        Send notifications when video sessions start or end
        """
        if created and instance.started_at:
            # Session started - notify both parties
            if instance.patient:
                NotificationService.create_notification(
                    recipient=instance.patient,
                    notification_type='session_starting',
                    title='Video Session Starting',
                    message=f'Your video session with Dr. {instance.doctor.full_name or instance.doctor.email} is starting now',
                    priority='high',
                    metadata={
                        'session_id': instance.id,
                        'room_id': str(instance.room_id),
                        'therapist_id': instance.doctor.id if instance.doctor else None,
                        'action_url': f'/session/{instance.appointment.id if instance.appointment else instance.id}'
                    }
                )
            
            if instance.doctor:
                NotificationService.create_notification(
                    recipient=instance.doctor,
                    notification_type='session_starting',
                    title='Video Session Starting',
                    message=f'{instance.patient.full_name or instance.patient.email} has joined the video session',
                    priority='high',
                    metadata={
                        'session_id': instance.id,
                        'room_id': str(instance.room_id),
                        'patient_id': instance.patient.id if instance.patient else None,
                        'action_url': f'/session/{instance.appointment.id if instance.appointment else instance.id}'
                    }
                )
        
        # Check if session ended
        if instance.ended_at and not created:
            # Session ended - notify both parties
            if instance.patient:
                NotificationService.create_notification(
                    recipient=instance.patient,
                    notification_type='session_ended',
                    title='Session Completed',
                    message=f'Your session with Dr. {instance.doctor.full_name or instance.doctor.email} has ended. Please provide feedback!',
                    priority='medium',
                    metadata={
                        'session_id': instance.id,
                        'therapist_id': instance.doctor.id if instance.doctor else None,
                        'action_url': '/appointments'
                    }
                )
            
            if instance.doctor:
                NotificationService.create_notification(
                    recipient=instance.doctor,
                    notification_type='session_ended',
                    title='Session Completed',
                    message=f'Session with {instance.patient.full_name or instance.patient.email} has ended',
                    priority='low',
                    metadata={
                        'session_id': instance.id,
                        'patient_id': instance.patient.id if instance.patient else None,
                        'action_url': '/therapist/appointments'
                    }
                )
