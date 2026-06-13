import os
import sys
import django

sys.path.insert(0, os.path.dirname(__file__))
os.environ['DJANGO_SETTINGS_MODULE'] = 'backend.settings'
django.setup()

from users.models import User

therapists = User.objects.filter(role='therapist')
print('\n=== VALID THERAPIST USER IDs FOR BOOKING ===\n')
for t in therapists:
    print(f'✅ User ID: {t.id:3d} | {t.email:30s} | {t.full_name or "N/A"}')
print(f'\n📊 Total: {therapists.count()} therapists available\n')
