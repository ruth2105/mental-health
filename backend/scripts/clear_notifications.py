#!/usr/bin/env python
"""
Clear all notifications from the database
Useful for removing test/demo notifications
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
django.setup()

from notifications.models import Notification

def clear_all_notifications():
    """Delete all notifications"""
    count = Notification.objects.count()
    
    if count == 0:
        print("✅ No notifications to clear")
        return
    
    print(f"Found {count} notifications")
    confirm = input(f"Delete all {count} notifications? (yes/no): ")
    
    if confirm.lower() in ['yes', 'y']:
        Notification.objects.all().delete()
        print(f"✅ Deleted {count} notifications")
    else:
        print("❌ Cancelled")

def clear_read_notifications():
    """Delete only read notifications"""
    count = Notification.objects.filter(is_read=True).count()
    
    if count == 0:
        print("✅ No read notifications to clear")
        return
    
    print(f"Found {count} read notifications")
    confirm = input(f"Delete {count} read notifications? (yes/no): ")
    
    if confirm.lower() in ['yes', 'y']:
        Notification.objects.filter(is_read=True).delete()
        print(f"✅ Deleted {count} read notifications")
    else:
        print("❌ Cancelled")

def clear_old_notifications(days=30):
    """Delete notifications older than specified days"""
    from datetime import datetime, timedelta
    
    cutoff_date = datetime.now() - timedelta(days=days)
    count = Notification.objects.filter(created_at__lt=cutoff_date).count()
    
    if count == 0:
        print(f"✅ No notifications older than {days} days")
        return
    
    print(f"Found {count} notifications older than {days} days")
    confirm = input(f"Delete {count} old notifications? (yes/no): ")
    
    if confirm.lower() in ['yes', 'y']:
        Notification.objects.filter(created_at__lt=cutoff_date).delete()
        print(f"✅ Deleted {count} old notifications")
    else:
        print("❌ Cancelled")

def main():
    print("\n" + "="*50)
    print("🗑️  Notification Cleanup Tool")
    print("="*50 + "\n")
    
    print("Options:")
    print("1. Clear ALL notifications")
    print("2. Clear only READ notifications")
    print("3. Clear notifications older than 30 days")
    print("4. Exit")
    
    choice = input("\nSelect option (1-4): ")
    
    if choice == '1':
        clear_all_notifications()
    elif choice == '2':
        clear_read_notifications()
    elif choice == '3':
        clear_old_notifications(30)
    elif choice == '4':
        print("Exiting...")
    else:
        print("Invalid option")

if __name__ == '__main__':
    main()
