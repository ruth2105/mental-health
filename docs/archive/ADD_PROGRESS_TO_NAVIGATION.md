# 🔗 Adding Progress Links to Navigation

## Quick Guide to Add Progress Links

### For Patient Dashboard

Add this to the quick actions array in `frontend/src/pages/patient/Dashboard.tsx`:

```typescript
const quickActions = [
  // ... existing actions ...
  {
    title: 'My Progress',
    description: 'Track your mental health journey',
    icon: TrendingUp, // Import from lucide-react
    gradient: 'from-green-500 to-teal-500',
    link: '/patient/progress',
    badge: 'New',
    badgeColor: 'bg-green-500'
  }
];
```

### For Therapist Dashboard

Add this to the navigation in `frontend/src/pages/therapist/Dashboard.tsx`:

```typescript
const navigationItems = [
  // ... existing items ...
  {
    title: 'My Impact',
    description: 'View your professional progress',
    icon: TrendingUp, // Import from lucide-react
    gradient: 'from-blue-500 to-purple-500',
    link: '/therapist/progress',
    badge: 'New',
    badgeColor: 'bg-blue-500'
  }
];
```

### Alternative: Add to Sidebar/Header

If you have a sidebar or header navigation, add:

```typescript
// For Patient
<Link to="/patient/progress" className="nav-link">
  <TrendingUp className="w-5 h-5" />
  <span>My Progress</span>
</Link>

// For Therapist
<Link to="/therapist/progress" className="nav-link">
  <TrendingUp className="w-5 h-5" />
  <span>My Impact</span>
</Link>
```

---

## Import Required

Don't forget to import the icon:

```typescript
import { TrendingUp } from 'lucide-react';
```

---

## Routes Already Added ✅

The routes are already configured:
- `/patient/progress` → Patient Progress Page
- `/therapist/progress` → Therapist Progress Page

Just add the navigation links and users can access them!
