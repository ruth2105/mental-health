"""
Setup script for chat system
Run this after adding chat app to create migrations and tables
"""
import os
import django
import sys

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

print("=" * 60)
print("CHAT SYSTEM SETUP")
print("=" * 60)

print("\n1. Creating migrations for chat app...")
os.system('python manage.py makemigrations chat')

print("\n2. Running migrations...")
os.system('python manage.py migrate')

print("\n" + "=" * 60)
print("✅ CHAT SYSTEM SETUP COMPLETE!")
print("=" * 60)
print("\nChat system is ready to use!")
print("\nAPI Endpoints:")
print("  - GET/POST  /api/chat/rooms/")
print("  - GET       /api/chat/rooms/{id}/")
print("  - GET       /api/chat/rooms/{id}/messages/")
print("  - POST      /api/chat/rooms/{id}/send_message/")
print("\nNext steps:")
print("1. Restart Django server")
print("2. Test chat endpoints")
print("3. Implement frontend chat UI")
