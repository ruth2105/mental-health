#!/usr/bin/env python3
"""
Simple test to verify peer system without authentication
"""

import os
import django
import sys

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mental_health_project.settings')
django.setup()

from django.contrib.auth import get_user_model
from appointments.models import Appointment
from video.models import VideoSession
from video.views import VideoSessionHeartbeatView, VideoSessionPeersView
from django.test import RequestFactory
from django.http import JsonResponse
import json
import time

User = get_user_model()

def test_peer_backend():
    """Test the peer system backend logic directly"""
    
    print("🧪 Testing Peer System Backend")
    print("=" * 40)
    
    # Get test users
    try:
        patient = User.objects.filter(email__icontains='ruth').first()
        therapist = User.objects.filter(email__icontains='will').first()
        
        if not patient or not therapist:
            print("❌ Test users not found")
            return
            
        print(f"👤 Patient: {patient.email}")
        print(f"👨‍⚕️ Therapist: {therapist.email}")
        
        # Get test appointment
        appointment = Appointment.objects.filter(
            patient=patient, 
            therapist=therapist
        ).first()
        
        if not appointment:
            print("❌ Test appointment not found")
            return
            
        print(f"📅 Appointment ID: {appointment.id}")
        
        # Clean up existing sessions
        VideoSession.objects.filter(appointment=appointment).delete()
        print("🧹 Cleaned up existing sessions")
        
        # Create request factory
        factory = RequestFactory()
        
        # Test 1: Patient joins
        print("\n📱 Test 1: Patient joins")
        request = factory.post('/api/video/session-heartbeat/', 
            data=json.dumps({
                'appointment_id': appointment.id,
                'action': 'join',
                'peer_id': 'test-patient-123'
            }),
            content_type='application/json'
        )
        request.user = patient
        
        view = VideoSessionHeartbeatView()
        response = view.post(request)
        
        if response.status_code == 200:
            data = json.loads(response.content)
            print(f"✅ Patient joined: {data}")
        else:
            print(f"❌ Patient join failed: {response.status_code}")
            return
        
        # Test 2: Therapist joins
        print("\n👨‍⚕️ Test 2: Therapist joins")
        request = factory.post('/api/video/session-heartbeat/', 
            data=json.dumps({
                'appointment_id': appointment.id,
                'action': 'join',
                'peer_id': 'test-therapist-456'
            }),
            content_type='application/json'
        )
        request.user = therapist
        
        response = view.post(request)
        
        if response.status_code == 200:
            data = json.loads(response.content)
            print(f"✅ Therapist joined: {data}")
        else:
            print(f"❌ Therapist join failed: {response.status_code}")
            return
        
        # Test 3: Get peers from patient perspective
        print("\n🔍 Test 3: Get peers (Patient perspective)")
        request = factory.get(f'/api/video/session-peers/?appointment_id={appointment.id}')
        request.user = patient
        
        peers_view = VideoSessionPeersView()
        response = peers_view.get(request)
        
        if response.status_code == 200:
            data = json.loads(response.content)
            peers = data.get('peers', [])
            print(f"✅ Peers found: {peers}")
            
            if 'test-therapist-456' in peers:
                print("✅ Therapist peer ID found!")
            else:
                print("❌ Therapist peer ID not found")
        else:
            print(f"❌ Get peers failed: {response.status_code}")
        
        # Test 4: Get peers from therapist perspective
        print("\n🔍 Test 4: Get peers (Therapist perspective)")
        request = factory.get(f'/api/video/session-peers/?appointment_id={appointment.id}')
        request.user = therapist
        
        response = peers_view.get(request)
        
        if response.status_code == 200:
            data = json.loads(response.content)
            peers = data.get('peers', [])
            print(f"✅ Peers found: {peers}")
            
            if 'test-patient-123' in peers:
                print("✅ Patient peer ID found!")
            else:
                print("❌ Patient peer ID not found")
        else:
            print(f"❌ Get peers failed: {response.status_code}")
        
        # Test 5: Check video session in database
        print("\n💾 Test 5: Check database")
        session = VideoSession.objects.filter(appointment=appointment).first()
        if session:
            print(f"✅ Video session exists: ID {session.id}")
            print(f"📊 Metadata: {session.metadata}")
            
            participants = session.metadata.get('online_participants', [])
            print(f"👥 Participants: {len(participants)}")
            for p in participants:
                print(f"   - User {p.get('user_id')}: {p.get('peer_id')}")
        else:
            print("❌ No video session found in database")
        
        print("\n🎉 Backend test completed!")
        
    except Exception as e:
        print(f"❌ Test error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_peer_backend()