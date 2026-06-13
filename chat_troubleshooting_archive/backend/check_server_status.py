#!/usr/bin/env python3
"""
Quick check to see if server is running with WebSocket support
"""

import requests
import sys

def check_server():
    """Check server status and type"""
    print("🔍 Checking Django Server Status...")
    
    try:
        # Test if server is running
        response = requests.get('http://localhost:8000/api/', timeout=5)
        
        # Check server type from headers
        server_header = response.headers.get('Server', 'Unknown')
        
        print(f"✅ Server is running on port 8000")
        print(f"📡 Server type: {server_header}")
        
        if 'daphne' in server_header.lower():
            print("✅ DAPHNE detected - WebSocket support AVAILABLE")
            print("🎉 Real-time chat should work!")
            return True
        elif 'wsgiserver' in server_header.lower() or 'django' in server_header.lower():
            print("❌ DJANGO RUNSERVER detected - NO WebSocket support")
            print("⚠️  This is why chat is not working!")
            print()
            print("🔧 SOLUTION:")
            print("1. Stop current server (Ctrl+C)")
            print("2. Run: start-websocket-server.bat")
            print("3. Or run: daphne -b 0.0.0.0 -p 8000 backend.asgi:application")
            return False
        else:
            print(f"❓ Unknown server type: {server_header}")
            print("💡 Try restarting with Daphne for WebSocket support")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ No server running on port 8000")
        print("💡 Start server with: start-websocket-server.bat")
        return False
    except Exception as e:
        print(f"❌ Error checking server: {e}")
        return False

if __name__ == '__main__':
    if not check_server():
        sys.exit(1)
    else:
        print("\n✅ Server configuration looks good for real-time chat!")