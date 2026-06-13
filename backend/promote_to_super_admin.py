#!/usr/bin/env python3
"""
Promote an existing admin user to super admin
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from users.models import User

def promote_to_super_admin(email):
    try:
        user = User.objects.get(email=email)
        
        if user.role != 'admin':
            print(f"❌ User {email} is not an admin (current role: {user.role})")
            print("Only admin users can be promoted to super admin.")
            return False
        
        if user.is_superuser:
            print(f"ℹ️  User {email} is already a super admin!")
            return True
        
        # Promote to super admin
        user.is_superuser = True
        user.is_staff = True
        user.save()
        
        print(f"✅ Successfully promoted {email} to super admin!")
        print(f"   Name: {user.full_name or 'Not set'}")
        print(f"   Role: {user.role}")
        print(f"   Staff: {user.is_staff}")
        print(f"   Superuser: {user.is_superuser}")
        
        return True
        
    except User.DoesNotExist:
        print(f"❌ User with email {email} not found!")
        print("\nAvailable admin users:")
        admins = User.objects.filter(role='admin')
        if admins.count() > 0:
            for admin in admins:
                status = "Super Admin" if admin.is_superuser else "Regular Admin"
                print(f"  - {admin.email} ({status})")
        else:
            print("  No admin users found.")
        return False
    
    except Exception as e:
        print(f"❌ Error promoting user: {str(e)}")
        return False

def main():
    if len(sys.argv) != 2:
        print("Usage: python promote_to_super_admin.py <email>")
        print("\nExample: python promote_to_super_admin.py admin@example.com")
        sys.exit(1)
    
    email = sys.argv[1]
    print("=" * 60)
    print(f"PROMOTING {email} TO SUPER ADMIN")
    print("=" * 60)
    
    success = promote_to_super_admin(email)
    
    if success:
        print("\n🎉 Promotion completed successfully!")
        print("The user can now:")
        print("  • Create new admin accounts")
        print("  • Delete admin accounts")
        print("  • Access all admin management features")
    else:
        print("\n💡 Need to create an admin first?")
        print("Run: python manage.py createsuperuser")
    
    print("=" * 60)

if __name__ == "__main__":
    main()