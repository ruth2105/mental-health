#!/usr/bin/env python3
"""
Get authentication tokens for testing video connections
"""

import os
import django
import requests
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mental_health_project.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

def get_tokens():
    """Get JWT tokens for test users"""
    
    print("🔐 Getting Authentication Tokens")
    print("=" * 40)
    
    # Find test users
    patient = User.objects.filter(email__icontains='ruth').first()
    therapist = User.objects.filter(email__icontains='will').first()
    
    if not patient:
        print("❌ Patient user not found")
        return
        
    if not therapist:
        print("❌ Therapist user not found")
        return
    
    print(f"👤 Patient: {patient.email} (ID: {patient.id})")
    print(f"👨‍⚕️ Therapist: {therapist.email} (ID: {therapist.id})")
    
    # Generate tokens
    patient_refresh = RefreshToken.for_user(patient)
    patient_access = str(patient_refresh.access_token)
    
    therapist_refresh = RefreshToken.for_user(therapist)
    therapist_access = str(therapist_refresh.access_token)
    
    print("\n🎫 PATIENT TOKEN:")
    print(f"Access: {patient_access}")
    
    print("\n🎫 THERAPIST TOKEN:")
    print(f"Access: {therapist_access}")
    
    # Create JavaScript code for easy copy-paste
    print("\n📋 COPY-PASTE FOR FRONTEND:")
    print("=" * 40)
    
    print("\n// Patient Login:")
    print("localStorage.clear();")
    print(f"localStorage.setItem('access_token', '{patient_access}');")
    print(f"localStorage.setItem('user', JSON.stringify({{")
    print(f"  id: {patient.id},")
    print(f"  email: '{patient.email}',")
    print(f"  user_type: 'patient'")
    print(f"}}));")
    
    print("\n// Therapist Login:")
    print("localStorage.clear();")
    print(f"localStorage.setItem('access_token', '{therapist_access}');")
    print(f"localStorage.setItem('user', JSON.stringify({{")
    print(f"  id: {therapist.id},")
    print(f"  email: '{therapist.email}',")
    print(f"  user_type: 'therapist'")
    print(f"}}));")
    
    print("\n✅ Tokens generated successfully!")
    print("\nTo test video connection:")
    print("1. Open Chrome: http://localhost:3000/test/video-connection")
    print("2. Open browser console (F12)")
    print("3. Paste patient login code and press Enter")
    print("4. Click 'Login as Patient'")
    print("5. Open new browser window/incognito")
    print("6. Repeat steps 1-3 with therapist login code")
    print("7. Click 'Login as Therapist'")
    print("8. Both should connect automatically!")

if __name__ == "__main__":
    get_tokens()