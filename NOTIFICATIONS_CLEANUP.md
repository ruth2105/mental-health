# 🗑️ Notifications Cleanup Guide

## Overview

Your notification system is already configured to show **only real notifications** from the database. There are no hardcoded demo notifications in the code.

## Current Status ✅

**No Demo Notifications Found**:
- ✅ NotificationBell component - Shows only database notifications
- ✅ useNotifications hook - Fetches real data from API
- ✅ Backend API - Returns only actual notifications
- ✅ No hardcoded demo data anywhere

## How Notifications Work

### Real Notifications Are Created When:

1. **Appointment Booked**
   - Patient books appointment
   - Notification sent to therapist
   - Type: `appointment_confirmed`

2. **Session Starting**
   - 15 minutes before session
   - Notification sent to both parties
   - Type: `session_starting`
   - Includes "Join Session" button

3. **Payment Received**
   - Payment confirmed
   - Notification sent to patient
   - Type: `payment_confirmed`

4. **Feedback Submitted**
   - Patient submits feedback
   - Notification sent to therapist
   - Type: `feedback_received`

5. **Appointment Cancelled**
   - Either party cancels
   - Notification sent to other party
   - Type: `appointment_cancelled`

## Clear Existing Notifications

If you want to remove any existing notifications from the database:

### Option 1: Use Cleanup Script (Recommended)

```bash
# Windows
scripts\clear-notifications.bat

# Or directly
cd backend
.venv\Scripts\python scripts\clear_notifications.py
```

**Options Available**:
1. Clear ALL notifications
2. Clear only READ notifications
3. Clear notifications older than 30 days
4. Exit

### Option 2: Django Admin

1. Login to Django admin: http://localhost:8000/admin
2. Go to "Notifications"
3. Select notifications to delete
4. Choose "Delete selected notifications"

### Option 3: Django Shell

```bash
cd backend
.venv\Scripts\python manage.py shell
```

```python
from notifications.models import Notification

# Delete all notifications
Notification.objects.all().delete()

# Or delete only read notifications
Notification.objects.filter(is_read=True).delete()

# Or delete old notifications (older than 30 days)
from datetime import datetime, timedelta
cutoff = datetime.now() - timedelta(days=30)
Notification.objects.filter(created_at__lt=cutoff).delete()
```

### Option 4: SQL Direct

```bash
cd backend
.venv\Scripts\python manage.py dbshell
```

```sql
-- View all notifications
SELECT * FROM notifications_notification;

-- Delete all notifications
DELETE FROM notifications_notification;

-- Delete read notifications
DELETE FROM notifications_notification WHERE is_read = 1;
```

## Prevent Future Test Notifications

### During Development:

If you're testing and don't want notifications:

**1. Disable Notification Signals** (temporary):

Edit `backend/notifications/signals.py`:
```python
# Comment out signal connections
# post_save.connect(create_appointment_notification, sender=Appointment)
```

**2. Use Test Mode**:

Add to `backend/.env`:
```env
NOTIFICATIONS_ENABLED=False
```

Then in `backend/notifications/services.py`:
```python
import os

def create_notification(...):
    if os.getenv('NOTIFICATIONS_ENABLED', 'True') == 'False':
        return None
    # ... rest of code
```

## Notification Cleanup Schedule

### Recommended Cleanup:

**Weekly**: Clear read notifications older than 7 days
```python
from datetime import datetime, timedelta
cutoff = datetime.now() - timedelta(days=7)
Notification.objects.filter(is_read=True, created_at__lt=cutoff).delete()
```

**Monthly**: Clear all notifications older than 30 days
```python
from datetime import datetime, timedelta
cutoff = datetime.now() - timedelta(days=30)
Notification.objects.filter(created_at__lt=cutoff).delete()
```

### Automated Cleanup (Optional):

Create a Django management command:

`backend/notifications/management/commands/cleanup_notifications.py`:
```python
from django.core.management.base import BaseCommand
from datetime import datetime, timedelta
from notifications.models import Notification

class Command(BaseCommand):
    help = 'Clean up old notifications'

    def handle(self, *args, **options):
        cutoff = datetime.now() - timedelta(days=30)
        count = Notification.objects.filter(created_at__lt=cutoff).count()
        Notification.objects.filter(created_at__lt=cutoff).delete()
        self.stdout.write(f'Deleted {count} old notifications')
```

Run with:
```bash
python manage.py cleanup_notifications
```

## Verify No Demo Notifications

### Check Frontend:

**NotificationBell.tsx**:
- ✅ Uses `useNotifications()` hook
- ✅ Fetches from API
- ✅ No hardcoded data

**useNotifications.ts**:
- ✅ Connects to WebSocket
- ✅ Falls back to HTTP polling
- ✅ Fetches from `/api/notifications/`
- ✅ No demo data

### Check Backend:

**notifications/views.py**:
- ✅ Returns `Notification.objects.filter(user=request.user)`
- ✅ No demo data generation

**notifications/services.py**:
- ✅ Creates notifications based on events
- ✅ No automatic demo notifications

## Current Notification Count

To check how many notifications exist:

```bash
cd backend
.venv\Scripts\python manage.py shell
```

```python
from notifications.models import Notification

# Total notifications
print(f"Total: {Notification.objects.count()}")

# By user
from django.contrib.auth import get_user_model
User = get_user_model()

for user in User.objects.all():
    count = Notification.objects.filter(user=user).count()
    print(f"{user.email}: {count} notifications")

# Unread notifications
unread = Notification.objects.filter(is_read=False).count()
print(f"Unread: {unread}")
```

## Summary

✅ **No demo notifications in code**  
✅ **All notifications are real/event-based**  
✅ **Cleanup script provided**  
✅ **Multiple cleanup options available**  
✅ **Automated cleanup possible**  

Your notification system is clean and production-ready!

---

**To clear notifications now**:
```bash
scripts\clear-notifications.bat
```

**To prevent test notifications**:
- Use separate test database
- Disable signals during testing
- Clear after each test session
