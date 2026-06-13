"""
Script to create a completed appointment between a patient and therapist
This will populate the therapist's "My Patients" list
"""
import os
import django
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from appointments.models import Appointment

User = get_user_model()

def create_completed_appointment():
    print("=" * 60)
    print("Creating Completed Appointment for Testing")
    print("=" * 60)
    
    # Get or create test patient
    try:
        patient = User.objects.get(email='testpatient@example.com')
        print(f"✓ Found patient: {patient.email}")
    except User.DoesNotExist:
        patient = User.objects.create_user(
            email='testpatient@example.com',
            password='testpass123',
            full_name='Test Patient',
            role='patient'
        )
        print(f"✓ Created new patient: {patient.email}")
    
    # Get first available therapist (verified or not)
    therapist = User.objects.filter(role='therapist').first()
    
    if not therapist:
        print("✗ No therapists found!")
        print("  Run: python create_test_therapists.py first")
        return
    
    # Verify the therapist if not already verified
    if not therapist.is_verified:
        therapist.is_verified = True
        therapist.save()
        print(f"✓ Verified therapist: {therapist.email}")
    
    print(f"✓ Using therapist: {therapist.email} ({therapist.full_name})")
    
    # Create appointment in the past (yesterday)
    scheduled_time = datetime.now() - timedelta(days=1)
    
    # Check if appointment already exists
    existing = Appointment.objects.filter(
        patient=patient,
        therapist=therapist,
        status='Completed'
    ).first()
    
    if existing:
        print(f"\n✓ Completed appointment already exists!")
        print(f"  ID: {existing.id}")
        print(f"  Scheduled: {existing.scheduled_time}")
        print(f"  Status: {existing.status}")
        print(f"  Paid: {existing.paid}")
    else:
        # Create new completed appointment
        appointment = Appointment.objects.create(
            patient=patient,
            therapist=therapist,
            scheduled_time=scheduled_time,
            status='Completed',
            paid=True
        )
        
        print(f"\n✓ Created completed appointment!")
        print(f"  ID: {appointment.id}")
        print(f"  Scheduled: {appointment.scheduled_time}")
        print(f"  Status: {appointment.status}")
        print(f"  Paid: {appointment.paid}")
    
    print("\n" + "=" * 60)
    print("TESTING INSTRUCTIONS")
    print("=" * 60)
    print(f"1. Login as therapist: {therapist.email}")
    print(f"   Password: testpass123")
    print(f"2. Go to 'My Patients' tab")
    print(f"3. You should see: {patient.full_name}")
    print(f"4. Click on the patient to view their details")
    print("=" * 60)

if __name__ == '__main__':
    create_completed_appointment()
