"""
Script to create migrations for notification models.
Run this after updating the notification models.
"""
import os
import sys
import django

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.core.management import call_command

print("Creating migrations for notifications app...")
call_command('makemigrations', 'notifications')
print("\nMigrations created successfully!")
print("\nTo apply migrations, run:")
print("  python manage.py migrate")
