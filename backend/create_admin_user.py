"""
Create an admin user for testing the admin dashboard
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from users.models import User

def create_admin():
    email = "admin@test.com"
    password = "admin123"
    
    # Check if admin already exists
    if User.objects.filter(email=email).exists():
        print(f"❌ Admin user with email {email} already exists!")
        admin = User.objects.get(email=email)
        print(f"✅ Existing admin: {admin.email} (role: {admin.role})")
        return
    
    # Create admin user
    admin = User.objects.create_user(
        email=email,
        password=password,
        full_name="Admin User",
        role="admin",
        is_staff=True,
        is_active=True
    )
    
    print("✅ Admin user created successfully!")
    print(f"📧 Email: {email}")
    print(f"🔑 Password: {password}")
    print(f"👤 Role: {admin.role}")
    print(f"\n🚀 You can now login at: http://localhost:5173/login")
    print(f"📊 Admin Dashboard: http://localhost:5173/admin/dashboard")

if __name__ == "__main__":
    create_admin()
