#!/usr/bin/env python
"""
Complete development environment setup script
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
django.setup()

from django.core.management import call_command
from django.contrib.auth import get_user_model
from users.models import PatientProfile, DoctorProfile
from datetime import datetime, timedelta

User = get_user_model()

def setup_database():
    """Run migrations and setup database"""
    print("🔧 Running migrations...")
    call_command('migrate', '--noinput')
    print("✅ Migrations complete")

def create_superuser():
    """Create admin superuser"""
    if not User.objects.filter(email='admin@test.com').exists():
        print("👤 Creating admin user...")
        User.objects.create_superuser(
            email='admin@test.com',
            password='admin123',
            first_name='Admin',
            last_name='User'
        )
        print("✅ Admin created: admin@test.com / admin123")
    else:
        print("ℹ️  Admin user already exists")

def create_test_users():
    """Create test patient and therapist"""
    # Patient
    if not User.objects.filter(email='patient@test.com').exists():
        print("👤 Creating test patient...")
        patient = User.objects.create_user(
            email='patient@test.com',
            password='password123',
            first_name='John',
            last_name='Doe',
            role='patient'
        )
        PatientProfile.objects.get_or_create(user=patient)
        print("✅ Patient created: patient@test.com / password123")
    else:
        print("ℹ️  Test patient already exists")

    # Therapist
    if not User.objects.filter(email='therapist@test.com').exists():
        print("👤 Creating test therapist...")
        therapist = User.objects.create_user(
            email='therapist@test.com',
            password='password123',
            first_name='Dr. Jane',
            last_name='Smith',
            role='therapist',
            is_verified=True
        )
        DoctorProfile.objects.get_or_create(
            user=therapist,
            defaults={
                'specialization': 'Anxiety, Depression, PTSD',
                'bio': 'Experienced therapist with 10+ years helping patients overcome mental health challenges.',
                'price_per_session': 500,
                'languages': 'English, Amharic',
                'years_of_experience': 10,
                'education': 'PhD in Clinical Psychology',
                'license_number': 'PSY-12345'
            }
        )
        print("✅ Therapist created: therapist@test.com / password123")
    else:
        print("ℹ️  Test therapist already exists")

def create_sample_therapists():
    """Create additional sample therapists"""
    therapists_data = [
        {
            'email': 'dr.sarah@example.com',
            'first_name': 'Dr. Sarah',
            'last_name': 'Johnson',
            'specialization': 'Depression, Anxiety',
            'price': 450,
            'experience': 8
        },
        {
            'email': 'dr.michael@example.com',
            'first_name': 'Dr. Michael',
            'last_name': 'Chen',
            'specialization': 'PTSD, Trauma',
            'price': 600,
            'experience': 12
        },
        {
            'email': 'dr.emily@example.com',
            'first_name': 'Dr. Emily',
            'last_name': 'Williams',
            'specialization': 'Relationship Issues, Family Therapy',
            'price': 550,
            'experience': 15
        },
    ]

    for data in therapists_data:
        if not User.objects.filter(email=data['email']).exists():
            therapist = User.objects.create_user(
                email=data['email'],
                password='password123',
                first_name=data['first_name'],
                last_name=data['last_name'],
                role='therapist',
                is_verified=True
            )
            DoctorProfile.objects.create(
                user=therapist,
                specialization=data['specialization'],
                bio=f"Specialized in {data['specialization']} with {data['experience']} years of experience.",
                price_per_session=data['price'],
                languages='English',
                years_of_experience=data['experience']
            )
            print(f"✅ Created therapist: {data['email']}")

def collect_static():
    """Collect static files"""
    try:
        print("📦 Collecting static files...")
        call_command('collectstatic', '--noinput', '--clear')
        print("✅ Static files collected")
    except Exception as e:
        print(f"⚠️  Static files collection skipped: {e}")

def main():
    print("\n" + "="*50)
    print("🚀 Setting up development environment")
    print("="*50 + "\n")

    try:
        setup_database()
        create_superuser()
        create_test_users()
        create_sample_therapists()
        collect_static()

        print("\n" + "="*50)
        print("✅ Development environment ready!")
        print("="*50)
        print("\n📝 Test Accounts:")
        print("   Admin:     admin@test.com / admin123")
        print("   Patient:   patient@test.com / password123")
        print("   Therapist: therapist@test.com / password123")
        print("\n🚀 Start the server:")
        print("   python manage.py runserver")
        print("\n")

    except Exception as e:
        print(f"\n❌ Setup failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
