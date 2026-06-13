"""
Email notification service for the mental health platform
"""
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
import logging

logger = logging.getLogger(__name__)


class EmailService:
    """Handle all email notifications"""
    
    @staticmethod
    def send_appointment_confirmation(appointment):
        """Send appointment confirmation to patient"""
        try:
            subject = 'Appointment Confirmation - MindCare'
            
            context = {
                'patient_name': appointment.patient.full_name or appointment.patient.email,
                'therapist_name': appointment.therapist.full_name or 'Dr. ' + appointment.therapist.email.split('@')[0],
                'date': appointment.scheduled_time.strftime('%B %d, %Y'),
                'time': appointment.scheduled_time.strftime('%I:%M %p'),
                'appointment_id': appointment.id
            }
            
            # For now, use plain text. In production, create HTML templates
            message = f"""
Dear {context['patient_name']},

Your therapy appointment has been confirmed!

Appointment Details:
- Therapist: {context['therapist_name']}
- Date: {context['date']}
- Time: {context['time']}
- Appointment ID: {context['appointment_id']}

You will receive a reminder 24 hours before your appointment.

If you need to reschedule or cancel, please log in to your account.

Best regards,
MindCare Team
            """
            
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[appointment.patient.email],
                fail_silently=False,
            )
            
            logger.info(f"Appointment confirmation sent to {appointment.patient.email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send appointment confirmation: {str(e)}")
            return False
    
    @staticmethod
    def send_appointment_reminder(appointment):
        """Send appointment reminder 24 hours before"""
        try:
            subject = 'Appointment Reminder - Tomorrow'
            
            message = f"""
Dear {appointment.patient.full_name or appointment.patient.email},

This is a reminder about your upcoming therapy appointment tomorrow.

Appointment Details:
- Therapist: {appointment.therapist.full_name or 'Dr. ' + appointment.therapist.email.split('@')[0]}
- Date: {appointment.scheduled_time.strftime('%B %d, %Y')}
- Time: {appointment.scheduled_time.strftime('%I:%M %p')}

Please log in to your account 5 minutes before the scheduled time to join the video session.

See you tomorrow!

Best regards,
MindCare Team
            """
            
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[appointment.patient.email],
                fail_silently=False,
            )
            
            logger.info(f"Appointment reminder sent to {appointment.patient.email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send appointment reminder: {str(e)}")
            return False
    
    @staticmethod
    def send_therapist_notification(appointment):
        """Notify therapist of new appointment"""
        try:
            subject = 'New Appointment Booked'
            
            message = f"""
Dear Dr. {appointment.therapist.full_name or appointment.therapist.email.split('@')[0]},

A new appointment has been booked with you.

Patient: {appointment.patient.full_name or appointment.patient.email}
Date: {appointment.scheduled_time.strftime('%B %d, %Y')}
Time: {appointment.scheduled_time.strftime('%I:%M %p')}
Appointment ID: {appointment.id}

Please log in to your dashboard to view details.

Best regards,
MindCare Team
            """
            
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[appointment.therapist.email],
                fail_silently=False,
            )
            
            logger.info(f"Therapist notification sent to {appointment.therapist.email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send therapist notification: {str(e)}")
            return False
    
    @staticmethod
    def send_feedback_notification(feedback):
        """Notify therapist of new feedback"""
        try:
            appointment = feedback.appointment
            subject = 'New Patient Feedback Received'
            
            message = f"""
Dear Dr. {appointment.therapist.full_name or appointment.therapist.email.split('@')[0]},

You have received new feedback from a patient.

Patient: {feedback.patient.full_name or feedback.patient.email}
Rating: {feedback.rating}/5 stars
Session Date: {appointment.scheduled_time.strftime('%B %d, %Y')}

Log in to your dashboard to view the complete feedback.

Best regards,
MindCare Team
            """
            
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[appointment.therapist.email],
                fail_silently=False,
            )
            
            logger.info(f"Feedback notification sent to {appointment.therapist.email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send feedback notification: {str(e)}")
            return False
    
    @staticmethod
    def send_welcome_email(user):
        """Send welcome email to new users"""
        try:
            subject = 'Welcome to MindCare!'
            
            role_message = {
                'patient': 'You can now take mental health assessments, find therapists, and book appointments.',
                'therapist': 'Please complete your profile to start accepting appointments from patients.',
                'admin': 'You have full access to manage users and monitor the platform.'
            }
            
            message = f"""
Dear {user.full_name or user.email},

Welcome to MindCare - Your Mental Health Companion!

Your account has been successfully created.

{role_message.get(user.role, 'Thank you for joining us.')}

Get started by logging in to your account:
{settings.FRONTEND_URL}/login

If you have any questions, feel free to reach out to our support team.

Best regards,
MindCare Team
            """
            
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
            
            logger.info(f"Welcome email sent to {user.email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send welcome email: {str(e)}")
            return False
