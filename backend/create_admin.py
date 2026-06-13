#!/usr/bin/env python
"""
Create admin user for the mental health app
"""
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Setup Django
django.setup()

from users.models import User

def create_admin():
    """Create admin user if it doesn't exist"""
    email = 'admin@mindcare.com'
    password = 'admin123'
    
    if User.objects.filter(email=email).exists():
        print(f"✅ Admin user already exists: {email}")
        return
    
    try:
        admin_user = User.objects.create_superuser(
            email=email,
            password=password,
            full_name='Admin User',
            role='admin'
        )
        print(f"✅ Created admin user: {email}")
        print(f"🔑 Password: {password}")
    except Exception as e:
        print(f"❌ Failed to create admin user: {e}")

if __name__ == '__main__':
    create_admin()