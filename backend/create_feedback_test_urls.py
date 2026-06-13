#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from users.models import User
from appointments.models import Appointment, AppointmentFeedback

def create_feedback_test_urls():
    try:
        # Get test users
        patient = User.objects.get(email='patient@test.com')
        therapist = User.objects.get(email='therapist@test.com')
        
        # Get appointments
        appointments = Appointment.objects.filter(
            patient=patient, 
            therapist=therapist
        ).order_by('-id')
        
        print("🎯 Feedback System Test URLs:")
        print("=" * 50)
        
        for appointment in appointments:
            has_feedback = AppointmentFeedback.objects.filter(
                appointment=appointment
            ).exists()
            
            status = "✅ Has Feedback" if has_feedback else "📝 No Feedback"
            
            print(f"Appointment {appointment.id}: {status}")
            print(f"   📄 Feedback Form: http://localhost:5173/appointments/{appointment.id}/feedback")
            
            if has_feedback:
                feedback = AppointmentFeedback.objects.get(appointment=appointment)
                print(f"   ⭐ Rating: {feedback.rating}/5")
                print(f"   💬 Text: {feedback.feedback_text[:50]}...")
            
            print()
        
        # Therapist profile URL
        therapist_profile = therapist.doctor_profile
        print(f"👨‍⚕️ Therapist Profile: http://localhost:5173/therapists/{therapist_profile.id}")
        print(f"   📊 Current Rating: {therapist_profile.rating}")
        
        # Test accounts
        print("\n🔐 Test Accounts:")
        print("Patient: patient@test.com / testpass123")
        print("Therapist: therapist@test.com / testpass123")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == '__main__':
    create_feedback_test_urls()