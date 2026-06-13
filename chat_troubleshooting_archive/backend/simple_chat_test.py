#!/usr/bin/env python3
"""
Simple step-by-step chat diagnostic
"""

import requests
import json
import sys
import os

def test_step_1_server_running():
    """Test if server is running"""
    print("🔍 STEP 1: Checking if server is running...")
    
    try:
        response = requests.get('http://localhost:8000/', timeout=5)
        print("✅ Server is running on port 8000")
        
        # Check server type
        server = response.headers.get('Server', 'Unknown')
        print(f"📡 Server type: {server}")
        
        if 'daphne' in server.lower():
            print("✅ Daphne detected - WebSocket support available")
            return True
        else:
            print("❌ Not Daphne - WebSocket support missing")
            print("💡 You need to start with: daphne -b 0.0.0.0 -p 8000 backend.asgi:application")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ No server running on port 8000")
        print("💡 Start server first")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_step_2_login():
    """Test user login"""
    print("\n🔍 STEP 2: Testing user login...")
    
    # Test patient login
    login_data = {
        'email': 'emily@gmail.com',  # Use existing user from logs
        'password': 'testpass123'
    }
    
    try:
        response = requests.post('http://localhost:8000/api/auth/token/', json=login_data)
        
        if response.status_code == 200:
            token = response.json()['access']
            print("✅ Patient login successful")
            print(f"🔑 Token: {token[:50]}...")
            return token
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"Response: {response.text}")
            
            # Try alternative login
            alt_login = {'email': 'patient@test.com', 'password': 'testpass123'}
            response = requests.post('http://localhost:8000/api/auth/token/', json=alt_login)
            
            if response.status_code == 200:
                token = response.json()['access']
                print("✅ Alternative patient login successful")
                return token
            else:
                print("❌ Alternative login also failed")
                return None
                
    except Exception as e:
        print(f"❌ Login error: {e}")
        return None

def test_step_3_chat_api(token):
    """Test chat API endpoints"""
    print("\n🔍 STEP 3: Testing chat API...")
    
    if not token:
        print("❌ No token available")
        return None
    
    headers = {'Authorization': f'Bearer {token}'}
    
    # Test chat room creation
    room_data = {'other_user_id': 3}  # Use therapist ID from logs
    
    try:
        response = requests.post('http://localhost:8000/api/chat/rooms/', json=room_data, headers=headers)
        
        if response.status_code in [200, 201]:
            room = response.json()
            print(f"✅ Chat room created/found: ID {room['id']}")
            return room['id']
        else:
            print(f"❌ Chat room creation failed: {response.status_code}")
            print(f"Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Chat API error: {e}")
        return None

def test_step_4_websocket(room_id, token):
    """Test WebSocket connection"""
    print("\n🔍 STEP 4: Testing WebSocket connection...")
    
    if not room_id or not token:
        print("❌ Missing room_id or token")
        return False
    
    try:
        import websockets
        import asyncio
        
        async def test_ws():
            ws_url = f"ws://localhost:8000/ws/chat/{room_id}/?token={token}"
            print(f"🔌 Connecting to: {ws_url}")
            
            try:
                async with websockets.connect(ws_url, timeout=10) as websocket:
                    print("✅ WebSocket connected!")
                    
                    # Send test message
                    message = {
                        'type': 'chat_message',
                        'message': 'Test from diagnostic script'
                    }
                    await websocket.send(json.dumps(message))
                    print("📤 Message sent")
                    
                    # Wait for response
                    try:
                        response = await asyncio.wait_for(websocket.recv(), timeout=5)
                        data = json.loads(response)
                        print(f"📥 Response received: {data.get('type')}")
                        return True
                    except asyncio.TimeoutError:
                        print("⏰ No response (timeout)")
                        return False
                        
            except websockets.exceptions.ConnectionRefused:
                print("❌ WebSocket connection refused")
                return False
            except websockets.exceptions.InvalidStatusCode as e:
                print(f"❌ WebSocket error: {e}")
                return False
        
        return asyncio.run(test_ws())
        
    except ImportError:
        print("❌ websockets library not installed")
        print("💡 Install with: pip install websockets")
        return False
    except Exception as e:
        print(f"❌ WebSocket test error: {e}")
        return False

def provide_specific_fix(server_ok, login_ok, api_ok, ws_ok):
    """Provide specific fix based on test results"""
    print("\n🔧 SPECIFIC FIX NEEDED:")
    print("=" * 40)
    
    if not server_ok:
        print("❌ SERVER ISSUE:")
        print("1. Stop current server (Ctrl+C)")
        print("2. Install Daphne: pip install daphne")
        print("3. Start with: daphne -b 0.0.0.0 -p 8000 backend.asgi:application")
        print("4. Look for: 'Starting server at tcp:port=8000'")
        
    elif not login_ok:
        print("❌ LOGIN ISSUE:")
        print("1. Check user exists in database")
        print("2. Verify password is correct")
        print("3. Try creating test user:")
        print("   python manage.py shell")
        print("   from django.contrib.auth import get_user_model")
        print("   User = get_user_model()")
        print("   user = User.objects.create_user('test@test.com', password='test123')")
        print("   user.role = 'patient'")
        print("   user.save()")
        
    elif not api_ok:
        print("❌ CHAT API ISSUE:")
        print("1. Check chat app is in INSTALLED_APPS")
        print("2. Run migrations: python manage.py migrate")
        print("3. Check chat URLs are included")
        
    elif not ws_ok:
        print("❌ WEBSOCKET ISSUE:")
        print("1. Verify ASGI configuration in settings.py")
        print("2. Check chat routing is included")
        print("3. Verify JWT middleware is working")
        print("4. Check channels is installed: pip install channels")
        
    else:
        print("✅ ALL TESTS PASSED!")
        print("Chat should be working. If not:")
        print("1. Clear browser cache")
        print("2. Try incognito mode")
        print("3. Check browser console for errors")

def main():
    """Run diagnostic tests"""
    print("🩺 SIMPLE CHAT DIAGNOSTIC")
    print("=" * 50)
    
    # Run tests step by step
    server_ok = test_step_1_server_running()
    
    if server_ok:
        token = test_step_2_login()
        login_ok = token is not None
        
        if login_ok:
            room_id = test_step_3_chat_api(token)
            api_ok = room_id is not None
            
            if api_ok:
                ws_ok = test_step_4_websocket(room_id, token)
            else:
                ws_ok = False
        else:
            api_ok = False
            ws_ok = False
    else:
        login_ok = False
        api_ok = False
        ws_ok = False
    
    # Summary
    print(f"\n📊 TEST RESULTS:")
    print(f"Server Running: {'✅' if server_ok else '❌'}")
    print(f"User Login:     {'✅' if login_ok else '❌'}")
    print(f"Chat API:       {'✅' if api_ok else '❌'}")
    print(f"WebSocket:      {'✅' if ws_ok else '❌'}")
    
    provide_specific_fix(server_ok, login_ok, api_ok, ws_ok)

if __name__ == '__main__':
    main()