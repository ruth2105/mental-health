#!/usr/bin/env python3
"""
Add an avatar to ruth@gmail.com for testing
"""
import os
import sys
import django
from pathlib import Path
from PIL import Image
import io

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from users.models import User
from django.core.files.base import ContentFile

def create_test_avatar(color='lightcoral'):
    """Create a simple test avatar image"""
    # Create a simple 100x100 colored image
    img = Image.new('RGB', (100, 100), color=color)
    
    # Save to bytes
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    
    return ContentFile(img_bytes.read(), name=f'ruth_avatar.png')

def add_avatar_to_ruth():
    """Add avatar to ruth@gmail.com"""
    
    print("🔍 Adding Avatar to Ruth")
    print("=" * 50)
    
    # Find ruth
    ruth = User.objects.filter(email='ruth@gmail.com').first()
    
    if not ruth:
        print("❌ User ruth@gmail.com not found")
        return
    
    print(f"👤 User: {ruth.email}")
    print(f"🖼️ Current Avatar: {ruth.avatar}")
    
    # Add avatar if she doesn't have one
    if not ruth.avatar:
        avatar_file = create_test_avatar('lightcoral')
        ruth.avatar = avatar_file
        ruth.save()
        print(f"✅ Added avatar to Ruth: {ruth.avatar}")
    else:
        print(f"📋 Ruth already has avatar: {ruth.avatar}")
    
    # Verify avatar file exists
    if ruth.avatar:
        avatar_path = Path(backend_dir) / 'media' / str(ruth.avatar)
        if avatar_path.exists():
            print(f"✅ Avatar file exists: {avatar_path}")
        else:
            print(f"❌ Avatar file missing: {avatar_path}")
    
    # Test API response
    from appointments.models import Appointment
    from appointments.serializers import AppointmentSerializer
    
    appointment = Appointment.objects.filter(patient=ruth).first()
    if appointment:
        class MockRequest:
            def build_absolute_uri(self, path):
                return f"http://localhost:8000{path}"
        
        context = {'request': MockRequest()}
        serializer = AppointmentSerializer(appointment, context=context)
        data = serializer.data
        
        print(f"\n📋 API Response:")
        patient_data = data.get('patient', {})
        print(f"   Patient: {patient_data.get('full_name')}")
        print(f"   Avatar URL: {patient_data.get('avatar')}")
    
    return ruth

if __name__ == "__main__":
    add_avatar_to_ruth()