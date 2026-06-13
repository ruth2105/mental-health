#!/usr/bin/env python3
"""
Complete fix for real-time chat between doctor and patient
"""

import os
import sys
import django
import subprocess
from pathlib import Path

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.core.management import execute_from_command_line
from chat.models import ChatRoom, Message

User = get_user_model()

def check_dependencies():
    """Check if all required packages are installed"""
    print("📦 Checking Dependencies...")
    
    required_packages = ['daphne', 'channels', 'websockets']
    missing = []
    
    for package in required_packages:
        try:
            __import__(package)
            print(f"✅ {package} installed")
        except ImportError:
            print(f"❌ {package} missing")
            missing.append(package)
    
    if missing:
        print(f"\n💡 Installing missing packages: {', '.join(missing)}")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install"] + missing)
            print("✅ All packages installed successfully")
        except subprocess.CalledProcessError:
            print("❌ Failed to install packages")
            return False
    
    return True

def run_migrations():
    """Ensure all migrations are applied"""
    print("\n🗄️  Running Migrations...")
    
    try:
        # Make migrations for chat app
        execute_from_command_line(['manage.py', 'makemigrations', 'chat'])
        print("✅ Chat migrations created")
        
        # Apply all migrations
        execute_from_command_line(['manage.py', 'migrate'])
        print("✅ All migrations applied")
        
        return True
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False

def create_test_users():
    """Create test users if they don't exist"""
    print("\n👥 Setting up Test Users...")
    
    try:
        # Create test patient
        patient, created = User.objects.get_or_create(
            email='patient@test.com',
            defaults={
                'full_name': 'Test Patient',
                'role': 'patient',
                'is_active': True
            }
        )
        if created:
            patient.set_password('testpass123')
            patient.save()
            print("✅ Test patient created: patient@test.com / testpass123")
        else:
            print("✅ Test patient exists: patient@test.com")
        
        # Create test therapist
        therapist, created = User.objects.get_or_create(
            email='therapist@test.com',
            defaults={
                'full_name': 'Test Therapist',
                'role': 'therapist',
                'is_active': True
            }
        )
        if created:
            therapist.set_password('testpass123')
            therapist.save()
            print("✅ Test therapist created: therapist@test.com / testpass123")
        else:
            print("✅ Test therapist exists: therapist@test.com")
        
        return True
    except Exception as e:
        print(f"❌ User creation failed: {e}")
        return False

def test_chat_room_creation():
    """Test chat room creation between patient and therapist"""
    print("\n🏠 Testing Chat Room Creation...")
    
    try:
        patient = User.objects.get(email='patient@test.com')
        therapist = User.objects.get(email='therapist@test.com')
        
        # Create or get chat room
        room, created = ChatRoom.objects.get_or_create(
            patient=patient,
            therapist=therapist
        )
        
        if created:
            print(f"✅ Chat room created: ID {room.id}")
        else:
            print(f"✅ Chat room exists: ID {room.id}")
        
        # Test message creation
        message = Message.objects.create(
            room=room,
            sender=patient,
            content="Test message from fix script"
        )
        print(f"✅ Test message created: ID {message.id}")
        
        return True
    except Exception as e:
        print(f"❌ Chat room test failed: {e}")
        return False

def create_startup_script():
    """Create a simple startup script"""
    print("\n📝 Creating Startup Script...")
    
    script_content = '''@echo off
echo 🚀 Starting Django with Real-Time Chat Support
echo.

REM Activate virtual environment
if exist ".venv\\Scripts\\activate.bat" (
    call .venv\\Scripts\\activate.bat
    echo ✅ Virtual environment activated
) else (
    echo ⚠️  Virtual environment not found, using system Python
)

REM Check if Daphne is installed
python -c "import daphne" 2>nul
if errorlevel 1 (
    echo 📦 Installing Daphne...
    pip install daphne channels websockets
)

echo.
echo 🌐 Server will be available at:
echo    HTTP: http://localhost:8000
echo    WebSocket: ws://localhost:8000/ws/
echo.
echo 💬 Real-time chat endpoints:
echo    ws://localhost:8000/ws/chat/^<room_id^>/?token=^<jwt^>
echo.
echo Press Ctrl+C to stop the server
echo ==========================================
echo.

daphne -b 0.0.0.0 -p 8000 backend.asgi:application
'''
    
    try:
        with open('start_chat_server.bat', 'w') as f:
            f.write(script_content)
        print("✅ Created start_chat_server.bat")
        return True
    except Exception as e:
        print(f"❌ Script creation failed: {e}")
        return False

def provide_instructions():
    """Provide final instructions"""
    print("\n🎯 FINAL INSTRUCTIONS:")
    print("=" * 50)
    print("1. 🛑 STOP any running Django server (Ctrl+C)")
    print()
    print("2. 🚀 START server with WebSocket support:")
    print("   Double-click: start_chat_server.bat")
    print("   OR run: daphne -b 0.0.0.0 -p 8000 backend.asgi:application")
    print()
    print("3. ✅ VERIFY server startup message:")
    print("   Look for: 'Starting server at tcp:port=8000'")
    print("   NOT: 'Starting development server'")
    print()
    print("4. 🧪 TEST real-time chat:")
    print("   a) Login as patient@test.com / testpass123")
    print("   b) Book appointment with therapist")
    print("   c) Join video session")
    print("   d) Open new browser/incognito window")
    print("   e) Login as therapist@test.com / testpass123")
    print("   f) Join same video session")
    print("   g) Click chat button (💬) on both sides")
    print("   h) Send messages - should appear instantly")
    print()
    print("5. 🔍 TROUBLESHOOT if needed:")
    print("   - Check browser console for WebSocket errors")
    print("   - Run: python debug_chat_issue.py")
    print("   - Ensure both users are in same appointment")

def main():
    """Run complete fix process"""
    print("🔧 COMPLETE REAL-TIME CHAT FIX")
    print("=" * 60)
    
    steps = [
        ("Dependencies", check_dependencies),
        ("Migrations", run_migrations),
        ("Test Users", create_test_users),
        ("Chat Room Test", test_chat_room_creation),
        ("Startup Script", create_startup_script)
    ]
    
    success_count = 0
    for step_name, step_func in steps:
        print(f"\n🔄 {step_name}...")
        if step_func():
            success_count += 1
        else:
            print(f"❌ {step_name} failed")
    
    print(f"\n📊 RESULTS: {success_count}/{len(steps)} steps completed")
    
    if success_count == len(steps):
        print("\n🎉 ALL SETUP COMPLETE!")
        provide_instructions()
    else:
        print("\n⚠️  Some steps failed. Check errors above.")
        print("💡 Try running individual steps manually.")

if __name__ == '__main__':
    main()