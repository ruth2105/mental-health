#!/usr/bin/env python
"""
Update therapist names in the database
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def update_therapist_names():
    """Update therapist names to show proper names"""
    
    therapists = User.objects.filter(role='therapist')
    
    if not therapists.exists():
        print("❌ No therapists found in database")
        return
    
    print(f"Found {therapists.count()} therapists\n")
    
    for therapist in therapists:
        print(f"\nTherapist: {therapist.email}")
        print(f"Current full_name: {getattr(therapist, 'full_name', 'N/A')}")
        print(f"Current first_name: {getattr(therapist, 'first_name', 'N/A')}")
        print(f"Current last_name: {getattr(therapist, 'last_name', 'N/A')}")
        
        # If no name is set, create one from email
        if not getattr(therapist, 'full_name', None):
            # Extract name from email
            email_name = therapist.email.split('@')[0]
            
            # Capitalize and format
            if hasattr(therapist, 'full_name'):
                therapist.full_name = f"Dr. {email_name.replace('.', ' ').title()}"
                therapist.save()
                print(f"✅ Updated full_name to: {therapist.full_name}")
            elif hasattr(therapist, 'first_name'):
                therapist.first_name = "Dr."
                therapist.last_name = email_name.replace('.', ' ').title()
                therapist.save()
                print(f"✅ Updated to: {therapist.first_name} {therapist.last_name}")
        else:
            print("✓ Name already set")

def main():
    print("="*50)
    print("Updating Therapist Names")
    print("="*50)
    
    update_therapist_names()
    
    print("\n" + "="*50)
    print("✅ Update complete!")
    print("="*50)
    print("\nRestart your backend to see changes:")
    print("  cd backend")
    print("  .venv\\Scripts\\python manage.py runserver")

if __name__ == '__main__':
    main()
