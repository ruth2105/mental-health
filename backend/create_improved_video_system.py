#!/usr/bin/env python
"""
Create Improved Video Session System
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from appointments.models import Appointment
from video.models import VideoSession
from notifications.services import NotificationService
import uuid
from datetime import datetime, timedelta
from django.utils import timezone

User = get_user_model()

def create_test_appointment_with_session():
    """Create a test appointment ready for video session"""
    
    print("🎥 CREATING IMPROVED VIDEO SESSION SYSTEM")
    print("=" * 60)
    
    try:
        # Get or create test users
        patient = User.objects.filter(email='ruth@gmail.com').first()
        therapist = User.objects.filter(role='therapist').first()
        
        if not patient:
            print("❌ Patient user not found")
            return
            
        if not therapist:
            print("❌ Therapist user not found")
            return
            
        print(f"✅ Patient: {patient.email}")
        print(f"✅ Therapist: {therapist.email}")
        
        # Create appointment for today + 1 hour
        appointment_time = timezone.now() + timedelta(hours=1)
        
        appointment = Appointment.objects.create(
            patient=patient,
            therapist=therapist,
            scheduled_time=appointment_time,
            status='Scheduled',
            paid=True,
            session_notes='Test video session appointment'
        )
        
        print(f"✅ Created appointment: {appointment.id}")
        print(f"   Scheduled: {appointment.scheduled_time}")
        
        # Create video session record
        room_id = str(uuid.uuid4())
        video_session = VideoSession.objects.create(
            appointment=appointment,
            patient=patient,
            doctor=therapist,
            provider='dummy',
            room_id=room_id,
            metadata={
                'created_for_testing': True,
                'room_type': 'p2p'
            }
        )
        
        print(f"✅ Created video session: {video_session.id}")
        print(f"   Room ID: {room_id}")
        
        # Create notifications for both users
        NotificationService.create_notification(
            recipient=patient,
            notification_type='session_ready',
            title='Video Session Ready',
            message=f'Your therapy session with {therapist.full_name or therapist.email} is ready to start.',
            priority='high',
            appointment=appointment,
            metadata={
                'appointment_id': appointment.id,
                'session_id': video_session.id,
                'action_url': f'/session/{appointment.id}',
                'room_id': room_id
            }
        )
        
        NotificationService.create_notification(
            recipient=therapist,
            notification_type='session_ready',
            title='Video Session Ready',
            message=f'Your therapy session with {patient.full_name or patient.email} is ready to start.',
            priority='high',
            appointment=appointment,
            metadata={
                'appointment_id': appointment.id,
                'session_id': video_session.id,
                'action_url': f'/session/{appointment.id}',
                'room_id': room_id
            }
        )
        
        print(f"✅ Created notifications for both users")
        
        print(f"\n🔗 SESSION URLS:")
        print(f"   Patient: http://localhost:5173/session/{appointment.id}")
        print(f"   Therapist: http://localhost:5173/session/{appointment.id}")
        
        print(f"\n💡 TESTING INSTRUCTIONS:")
        print(f"   1. Open two browser windows/tabs")
        print(f"   2. Login as patient (ruth@gmail.com) in first tab")
        print(f"   3. Login as therapist in second tab")
        print(f"   4. Both navigate to the session URL")
        print(f"   5. First person joins → second gets notification")
        print(f"   6. Second person joins → video call connects")
        
        return appointment.id, video_session.id
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None, None

def create_session_status_api():
    """Create API endpoint to check session status"""
    
    api_code = '''
# Add this to video/views.py

class VideoSessionStatusView(APIView):
    """Check if other participant is online in video session"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        appointment_id = request.query_params.get('appointment_id')
        
        if not appointment_id:
            return Response(
                {'error': 'appointment_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            appointment = Appointment.objects.get(id=appointment_id)
            
            # Check if user is participant
            if request.user != appointment.patient and request.user != appointment.therapist:
                return Response(
                    {'error': 'Not authorized'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get video session
            video_session = VideoSession.objects.filter(appointment=appointment).first()
            
            if not video_session:
                return Response({
                    'session_exists': False,
                    'participants_online': 0,
                    'other_participant_online': False
                })
            
            # In a real implementation, you'd track online status
            # For now, we'll use session start time as indicator
            participants_online = 1 if video_session.started_at else 0
            
            return Response({
                'session_exists': True,
                'session_id': video_session.id,
                'room_id': video_session.room_id,
                'participants_online': participants_online,
                'other_participant_online': participants_online > 0,
                'session_started': video_session.started_at is not None,
                'session_ended': video_session.ended_at is not None
            })
            
        except Appointment.DoesNotExist:
            return Response(
                {'error': 'Appointment not found'},
                status=status.HTTP_404_NOT_FOUND
            )
'''
    
    print(f"\n📝 SESSION STATUS API CODE:")
    print(api_code)

if __name__ == '__main__':
    appointment_id, session_id = create_test_appointment_with_session()
    
    if appointment_id:
        print(f"\n🎉 VIDEO SESSION SYSTEM READY!")
        print(f"   Appointment ID: {appointment_id}")
        print(f"   Session ID: {session_id}")
        
        create_session_status_api()
    else:
        print(f"\n❌ FAILED TO CREATE VIDEO SESSION SYSTEM")