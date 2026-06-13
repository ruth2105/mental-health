# How to Add Notifications to Your App (5 Minutes)

## ✅ Everything is Ready - Just Add the Bell Icon!

The notification system is 95% complete. You just need to add the `<NotificationBell />` component to your pages.

## Quick Integration (Choose One Method)

### Method 1: Add to Patient Dashboard (Easiest - 2 minutes)

Open `frontend/src/pages/patient/Dashboard.tsx` and add these two lines:

**At the top with other imports:**
```tsx
import { NotificationBell } from '@/components/NotificationBell';
```

**In your JSX, add a header section (around line 100, before your main content):**
```tsx
export default function Dashboard() {
  // ... existing code ...
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* ADD THIS HEADER */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h2 className="text-xl font-semibold">MindCare</h2>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <span className="text-sm text-gray-600">{user?.full_name || user?.email}</span>
          </div>
        </div>
      </div>
      
      {/* Your existing dashboard content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ... rest of your code ... */}
```

### Method 2: Add to Therapist Dashboard (2 minutes)

Same as above, but in `frontend/src/pages/therapist/Dashboard.tsx`

### Method 3: Create Shared Header Component (5 minutes - Best for Production)

Create `frontend/src/components/AppHeader.tsx`:

```tsx
import { NotificationBell } from './NotificationBell';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';

export const AppHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              MindCare
            </h1>
            <span className="text-xs text-gray-500 capitalize">
              {user?.role}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="text-sm text-gray-700">
              {user?.full_name || user?.email}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
```

Then import it in any page:
```tsx
import { AppHeader } from '@/components/AppHeader';

export default function Dashboard() {
  return (
    <div>
      <AppHeader />
      {/* Your page content */}
    </div>
  );
}
```

## Test It Works

1. **Start Redis** (if not running):
   ```bash
   redis-server
   ```

2. **Start Backend with ASGI**:
   ```bash
   cd backend
   daphne -b 0.0.0.0 -p 8000 backend.asgi:application
   ```

3. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

4. **Test**:
   - Login as a patient
   - You should see the bell icon in the header
   - Book an appointment
   - You should see:
     - A toast notification pop up
     - The bell icon turn blue with a badge showing "1"
     - Click the bell to see the notification

## What You'll See

### Before Notifications:
```
┌─────────────────────────────────────┐
│  Dashboard                          │
│                                     │
│  [Your content here]                │
└─────────────────────────────────────┘
```

### After Adding NotificationBell:
```
┌─────────────────────────────────────┐
│  MindCare              🔔(1)  User  │  ← Bell with badge
├─────────────────────────────────────┤
│  Dashboard                          │
│                                     │
│  [Your content here]                │
└─────────────────────────────────────┘
```

### When You Click the Bell:
```
┌─────────────────────────────────────┐
│  MindCare              🔔(1)  User  │
│                        ┌───────────┐│
│                        │Notifications│
│                        │Mark all read│
│                        ├───────────┤│
│                        │● New Appt ││
│                        │  Dr. Smith││
│                        │  5m ago   ││
│                        └───────────┘│
│  Dashboard                          │
└─────────────────────────────────────┘
```

## Verify WebSocket Connection

Open browser console (F12) and you should see:
```
WebSocket connected
```

If you see errors, check:
1. Redis is running
2. Backend is using Daphne (not runserver)
3. You're logged in

## That's It!

Once you add the `<NotificationBell />` component to your pages, the entire notification system will be live and working.

All the backend logic, WebSocket connections, and automatic notifications are already implemented and ready to go!
