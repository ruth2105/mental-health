#!/usr/bin/env python
"""Create test data for development"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mental_health_project.settings')
django.setup()

from django.contrib.auth import get_user_model
from users.models import PatientProfile, DoctorProfile

User = get_user_model()


def create_test_users():
    """Create test users for all roles"""
    
    # Create patient
    if not User.objects.filter(email='patient@test.com').exists():
        patient = User.objects.create_user(
            email='patient@test.com',
            password='password123',
            first_name='John',
            last_name='Doe',
            role='patient'
        )
        PatientProfile.objects.get_or_create(user=patient)
        print('✅ Created patient: patient@test.com / password123')
    
    # Create therapist
    if not User.objects.filter(email='therapist@test.com').exists():
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
                'specialization': 'Anxiety, Depression',
                'bio': 'Experienced therapist specializing in anxiety and depression',
                'price_per_session': 500,
                'languages': 'English, Amharic'
            }
        )
        print('✅ Created therapist: therapist@test.com / password123')
    
    # Create admin
    if not User.objects.filter(email='admin@test.com').exists():
        admin = User.objects.create_superuser(
            email='admin@test.com',
            password='admin123',
            first_name='Admin',
            last_name='User'
        )
        print('✅ Created admin: admin@test.com / admin123')


if __name__ == '__main__':
    print('Creating test data...')
    create_test_users()
    print('\n✨ Test data created successfully!')
    print('\nTest Accounts:')
    print('  Patient: patient@test.com / password123')
    print('  Therapist: therapist@test.com / password123')
    print('  Admin: admin@test.com / admin123')
