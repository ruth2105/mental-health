#!/usr/bin/env python3
"""
Quick script to make the first admin user a super admin
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from users.models import User

def make_super_admin():
    print("=" * 60)
    print("MAKING FIRST ADMIN A SUPER ADMIN")
    print("=" * 60)
    
    # Find the first admin user
    admin_users = User.objects.filter(role='admin').order_by('id')
    
    if not admin_users.exists():
        print("❌ No admin users found!")
        print("\nTo create an admin user:")
        print("1. Register as admin through the web interface")
        print("2. Or run: python manage.py createsuperuser")
        return
    
    first_admin = admin_users.first()
    
    print(f"\n📋 First admin user found: {first_admin.email}")
    print(f"   Current status:")
    print(f"   - Role: {first_admin.role}")
    print(f"   - Staff: {first_admin.is_staff}")
    print(f"   - Superuser: {first_admin.is_superuser}")
    
    if first_admin.is_superuser:
        print(f"\n✅ {first_admin.email} is already a super admin!")
    else:
        print(f"\n🔧 Making {first_admin.email} a super admin...")
        first_admin.is_superuser = True
        first_admin.is_staff = True
        first_admin.save()
        print(f"✅ {first_admin.email} is now a super admin!")
    
    print(f"\n🎉 Super admin setup complete!")
    print(f"   Email: {first_admin.email}")
    print(f"   You can now:")
    print(f"   • Create new admin accounts")
    print(f"   • Access admin management features")
    print(f"   • See the purple 'Super Admin Controls' card")
    
    print("\n💡 Next steps:")
    print("1. Logout and login again to refresh your session")
    print("2. Go to /admin/dashboard")
    print("3. Look for the purple 'Super Admin Controls' card")
    print("4. Click 'Manage Admins' to create new admin accounts")
    
    print("=" * 60)

if __name__ == "__main__":
    make_super_admin()