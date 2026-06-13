"""
Video session notification service
"""
from notifications.services import NotificationService
from appointments.models import Appointment


def notify_session_started(appointment_id, user_who_joined):
    """
    Notify the other participant when someone joins a video session
    
    Args:
        appointment_id: ID of the appointment
        user_who_joined: User object of person who joined
    """
    try:
        appointment = Appointment.objects.select_related(
            'patient', 'therapist'
        ).get(id=appointment_id)
        
        # Determine who to notify (the person who didn't join)
        if user_who_joined == appointment.patient:
            # Patient joined, notify therapist
            recipient = appointment.therapist if appointment.therapist else None
            joiner_name = appointment.patient.full_name or appointment.patient.email
            recipient_role = "therapist"
        else:
            # Therapist joined, notify patient
            recipient = appointment.patient
            joiner_name = appointment.therapist.full_name or appointment.therapist.email if appointment.therapist else "Your therapist"
            recipient_role = "patient"
        
        if not recipient:
            return
        
        # Create notification
        NotificationService.create_notification(
            recipient=recipient,
            notification_type='session_starting',
            title='Video Session Started',
            message=f'{joiner_name} has joined the video session. Click to join now!',
            priority='high',
            appointment=appointment,
            metadata={
                'appointment_id': appointment_id,
                'joiner_id': user_who_joined.id,
                'joiner_name': joiner_name,
                'action_url': f'/session/{appointment_id}',
                'recipient_role': recipient_role
            }
        )
        
        return True
        
    except Appointment.DoesNotExist:
        print(f"Appointment {appointment_id} not found")
        return False
    except Exception as e:
        print(f"Error sending session notification: {e}")
        return False
