#!/usr/bin/env python3
"""
Start Django server with WebSocket support using Daphne
"""

import os
import sys
import subprocess
import django
from pathlib import Path

def check_daphne_installed():
    """Check if Daphne is installed"""
    try:
        import daphne
        print("✅ Daphne is installed")
        return True
    except ImportError:
        print("❌ Daphne is not installed")
        return False

def install_daphne():
    """Install Daphne"""
    print("📦 Installing Daphne...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "daphne"])
        print("✅ Daphne installed successfully")
        return True
    except subprocess.CalledProcessError:
        print("❌ Failed to install Daphne")
        return False

def start_server():
    """Start Django server with WebSocket support"""
    print("🚀 Starting Django server with WebSocket support...")
    print("📡 WebSocket endpoints will be available at:")
    print("   - ws://localhost:8000/ws/chat/<room_id>/?token=<jwt>")
    print("   - ws://localhost:8000/ws/notifications/")
    print("   - ws://localhost:8000/ws/video/<room_name>/")
    print()
    print("🌐 HTTP endpoints available at:")
    print("   - http://localhost:8000/api/")
    print("   - http://localhost:8000/admin/")
    print()
    print("Press Ctrl+C to stop the server")
    print("=" * 60)
    
    try:
        # Start Daphne server
        subprocess.run([
            sys.executable, "-m", "daphne", 
            "-b", "0.0.0.0", 
            "-p", "8000",
            "backend.asgi:application"
        ])
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")
    except FileNotFoundError:
        print("❌ Daphne not found. Please install it first:")
        print("   pip install daphne")

def main():
    """Main function"""
    print("🔧 Django WebSocket Server Starter")
    print("=" * 40)
    
    # Check if we're in the right directory
    if not os.path.exists('manage.py'):
        print("❌ Please run this script from the backend directory")
        print("   cd backend")
        print("   python start_with_websockets.py")
        return
    
    # Check Django settings
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    
    # Check if Daphne is installed
    if not check_daphne_installed():
        if input("Install Daphne now? (y/n): ").lower() == 'y':
            if not install_daphne():
                return
        else:
            print("❌ Daphne is required for WebSocket support")
            return
    
    # Start the server
    start_server()

if __name__ == '__main__':
    main()