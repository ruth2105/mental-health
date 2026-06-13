#!/usr/bin/env python3
"""
Debug script to identify why real-time chat is not working between doctor and patient
"""

import os
import sys
import django
import requests
import json
from pathlib import Path

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from chat.models import ChatRoom, Message
from appointments.models import Appointment

User = get_user_model()

def check_server_type():
    """Check if server is running with WebSocket support"""
    print("🔍 Checking Server Configuration...")
    print("=" * 50)
    
    try:
        # Test HTTP endpoint
        response = requests.get('http://localhost:8000/api/auth/token/', timeout=5)
        print("✅ HTTP server is running on port 8000")
        
        # Check if it's Daphne or Django runserver
        headers = response.headers
        server_header = headers.get('Server', 'Unknown')
        print(f"📡 Server type: {server_header}")
        
        if 'daphne' in server_header.lower():
            print("✅ Daphne ASGI server detected - WebSocket support available")
            return True
        else:
            print("❌ Django runserver detected - NO WebSocket support")
            print("⚠️  You must use Daphne for WebSocket connections!")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ No server running on port 8000")
        print("💡 Start server with: cd backend && start-websocket-server.bat")
        return False
    except Exception as e:
        print(f"❌ Server check failed: {e}")
        return False

def check_database_setup():
    """Check if chat models are properly set up"""
    print("\n🗄️  Checking Database Setup...")
    print("=" * 50)
    
    try:
        # Check if chat tables exist
        room_count = ChatRoom.objects.count()
        message_count = Message.objects.count()
        
        print(f"✅ ChatRoom table exists - {room_count} rooms")
        print(f"✅ Message table exists - {message_count} messages")
        
        # Check users
        patients = User.objects.filter(role='patient').count()
        therapists = User.objects.filter(role='therapist').count()
        
        print(f"👥 Users: {patients} patients, {therapists} therapists")
        
        if patients == 0 or therapists == 0:
            print("⚠️  Need both patient and therapist users for testing")
            return False
            
        return True
        
    except Exception as e:
        print(f"❌ Database check failed: {e}")
        print("💡 Run migrations: python manage.py migrate")
        return False

def test_chat_api():
    """Test chat API endpoints"""
    print("\n🔌 Testing Chat API...")
    print("=" * 50)
    
    try:
        # Get test users
        patient = User.objects.filter(role='patient').first()
        therapist = User.objects.filter(role='therapist').first()
        
        if not patient or not therapist:
            print("❌ No test users found")
            return False
        
        print(f"👤 Patient: {patient.email}")
        print(f"👨‍⚕️ Therapist: {therapist.email}")
        
        # Test patient login
        login_data = {'email': patient.email, 'password': 'testpass123'}
        response = requests.post('http://localhost:8000/api/auth/token/', json=login_data)
        
        if response.status_code != 200:
            print(f"❌ Patient login failed: {response.status_code}")
            print("💡 Check user password or create test users")
            return False
        
        token = response.json()['access']
        print("✅ Patient authentication successful")
        
        # Test chat room creation
        headers = {'Authorization': f'Bearer {token}'}
        room_data = {'other_user_id': therapist.id}
        response = requests.post('http://localhost:8000/api/chat/rooms/', json=room_data, headers=headers)
        
        if response.status_code not in [200, 201]:
            print(f"❌ Chat room creation failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        room = response.json()
        print(f"✅ Chat room created: ID {room['id']}")
        
        # Test message sending
        message_data = {'content': 'Test message from debug script'}
        response = requests.post(f'http://localhost:8000/api/chat/rooms/{room["id"]}/send_message/', 
                               json=message_data, headers=headers)
        
        if response.status_code != 201:
            print(f"❌ Message sending failed: {response.status_code}")
            return False
        
        print("✅ Message sent successfully")
        return True
        
    except Exception as e:
        print(f"❌ API test failed: {e}")
        return False

def test_websocket_connection():
    """Test WebSocket connection"""
    print("\n🔗 Testing WebSocket Connection...")
    print("=" * 50)
    
    try:
        import websockets
        import asyncio
        
        async def test_ws():
            # Get test data
            patient = User.objects.filter(role='patient').first()
            therapist = User.objects.filter(role='therapist').first()
            
            # Get token
            login_data = {'email': patient.email, 'password': 'testpass123'}
            response = requests.post('http://localhost:8000/api/auth/token/', json=login_data)
            token = response.json()['access']
            
            # Get room
            headers = {'Authorization': f'Bearer {token}'}
            room_data = {'other_user_id': therapist.id}
            response = requests.post('http://localhost:8000/api/chat/rooms/', json=room_data, headers=headers)
            room_id = response.json()['id']
            
            # Test WebSocket
            ws_url = f"ws://localhost:8000/ws/chat/{room_id}/?token={token}"
            print(f"🔌 Connecting to: {ws_url}")
            
            try:
                async with websockets.connect(ws_url, timeout=10) as websocket:
                    print("✅ WebSocket connection successful!")
                    
                    # Send test message
                    test_msg = {
                        'type': 'chat_message',
                        'message': 'WebSocket test message'
                    }
                    await websocket.send(json.dumps(test_msg))
                    print("📤 Test message sent")
                    
                    # Wait for response
                    try:
                        response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                        data = json.loads(response)
                        print(f"📥 Received: {data['type']}")
                        return True
                    except asyncio.TimeoutError:
                        print("⏰ No response received (timeout)")
                        return False
                        
            except websockets.exceptions.ConnectionRefused:
                print("❌ WebSocket connection refused")
                print("💡 Server not running with WebSocket support")
                return False
            except websockets.exceptions.InvalidStatusCode as e:
                print(f"❌ WebSocket connection failed: {e}")
                return False
        
        return asyncio.run(test_ws())
        
    except ImportError:
        print("❌ websockets library not installed")
        print("💡 Install with: pip install websockets")
        return False
    except Exception as e:
        print(f"❌ WebSocket test failed: {e}")
        return False

def check_appointment_setup():
    """Check if there are appointments for testing"""
    print("\n📅 Checking Appointments...")
    print("=" * 50)
    
    try:
        appointments = Appointment.objects.filter(status='Scheduled').count()
        print(f"📋 Active appointments: {appointments}")
        
        if appointments == 0:
            print("⚠️  No scheduled appointments found")
            print("💡 Create an appointment to test video session chat")
            return False
        
        # Show recent appointment
        recent = Appointment.objects.filter(status='Scheduled').first()
        if recent:
            print(f"📋 Recent appointment: ID {recent.id}")
            print(f"   Patient: {recent.patient.email}")
            print(f"   Therapist: {recent.therapist.email}")
            print(f"   Date: {recent.appointment_date}")
        
        return True
        
    except Exception as e:
        print(f"❌ Appointment check failed: {e}")
        return False

def provide_solution():
    """Provide step-by-step solution"""
    print("\n🔧 SOLUTION STEPS:")
    print("=" * 50)
    
    print("1. 🛑 STOP current Django server (Ctrl+C)")
    print()
    print("2. 🚀 START server with WebSocket support:")
    print("   cd backend")
    print("   start-websocket-server.bat")
    print("   OR")
    print("   daphne -b 0.0.0.0 -p 8000 backend.asgi:application")
    print()
    print("3. ✅ VERIFY server is running with Daphne:")
    print("   Look for: 'Starting server at tcp:port=8000'")
    print()
    print("4. 🧪 TEST the chat system:")
    print("   - Login as patient")
    print("   - Join video session")
    print("   - Login as therapist (different browser)")
    print("   - Join same video session")
    print("   - Click chat button and send messages")
    print()
    print("5. 🔍 CHECK browser console for:")
    print("   ✅ 'Chat WebSocket connected successfully!'")
    print("   ❌ 'WebSocket connection failed'")

def main():
    """Run all diagnostic tests"""
    print("🩺 REAL-TIME CHAT DIAGNOSTIC TOOL")
    print("=" * 60)
    
    # Run all checks
    server_ok = check_server_type()
    db_ok = check_database_setup()
    api_ok = test_chat_api() if server_ok else False
    ws_ok = test_websocket_connection() if server_ok and api_ok else False
    appointment_ok = check_appointment_setup()
    
    # Summary
    print("\n📊 DIAGNOSTIC RESULTS:")
    print("=" * 30)
    print(f"Server (WebSocket): {'✅ PASS' if server_ok else '❌ FAIL'}")
    print(f"Database Setup:     {'✅ PASS' if db_ok else '❌ FAIL'}")
    print(f"Chat API:           {'✅ PASS' if api_ok else '❌ FAIL'}")
    print(f"WebSocket Connect:  {'✅ PASS' if ws_ok else '❌ FAIL'}")
    print(f"Appointments:       {'✅ PASS' if appointment_ok else '❌ FAIL'}")
    
    if all([server_ok, db_ok, api_ok, ws_ok]):
        print("\n🎉 ALL TESTS PASSED!")
        print("Real-time chat should be working now.")
        print("\nIf it's still not working in the browser:")
        print("1. Clear browser cache and cookies")
        print("2. Check browser console for errors")
        print("3. Try incognito/private browsing mode")
    else:
        provide_solution()

if __name__ == '__main__':
    main()