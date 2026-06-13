# 🚀 Developer Quick Reference

> Fast lookup for routes, APIs, and common tasks

---

## 📍 Frontend Routes

### Patient Routes
```
/patient/dashboard          → Home
/assessment                 → AI Test
/therapists                 → Browse
/therapists/:id/book        → Book
/payment                    → Pay
/appointments               → List
/appointments/:id/session   → Video
```

### Therapist Routes
```
/therapist/dashboard        → Home
/therapist/profile          → Edit
/therapist/appointments     → Manage
/therapist/session/:id      → Video
/therapist/patients         → List
```

### Admin Routes
```
/admin/dashboard            → Control Panel
```

---

## 🔌 API Endpoints

### Auth
```
POST /api/users/register/
POST /api/users/login/
POST /api/users/token/refresh/
```

### Profile
```
GET  /api/users/profile/
PATCH /api/users/profile/
GET  /api/users/therapists/
```

### AI
```
POST /api/mental_health/predict/
GET  /api/mental_health/history/
```

### Appointments
```
GET  /api/appointments/
POST /api/appointments/create/
GET  /api/appointments/{id}/
POST /api/appointments/{id}/feedback/
```

### Payments
```
POST /api/payments/initiate/
POST /api/payments/verify/
GET  /api/payments/history/
```

### Video
```
GET  /api/video/token/
POST /api/video/end-session/
```

### Admin
```
GET    /api/users/admin/stats/
GET    /api/users/admin/users/
POST   /api/users/admin/users/{id}/toggle/
POST   /api/users/admin/users/{id}/verify/
DELETE /api/users/admin/users/{id}/delete/
GET    /api/users/admin/appointments/
```

---

## 🔑 Test Accounts

```
Patient:    patient@test.com / password123
Therapist:  therapist@test.com / password123
Admin:      admin@test.com / admin123
```

---

## 🛠️ Common Commands

### Start Backend
```bash
cd backend
.venv\Scripts\python.exe manage.py runserver
```

### Start Frontend
```bash
cd frontend
npm run dev
```

### Run Tests
```bash
cd backend
.venv\Scripts\python.exe test_all_apis.py
```

### Create Admin
```bash
cd backend
.venv\Scripts\python.exe create_admin_user.py
```

### Migrations
```bash
cd backend
.venv\Scripts\python.exe manage.py makemigrations
.venv\Scripts\python.exe manage.py migrate
```

---

## 📦 Project Structure

```
mental-health-app/
├── backend/
│   ├── users/              → Auth & profiles
│   ├── mental_health_app/  → AI predictions
│   ├── appointments/       → Booking system
│   ├── payments/           → Chapa integration
│   ├── video/              → RTC tokens
│   └── manage.py
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Auth/       → Login, Register
│   │   │   ├── patient/    → Patient pages
│   │   │   ├── therapist/  → Therapist pages
│   │   │   ├── admin/      → Admin pages
│   │   │   └── public/     → Landing, About
│   │   ├── components/     → Reusable components
│   │   ├── hooks/          → Custom hooks
│   │   ├── context/        → Auth context
│   │   └── routes/         → Route config
│   └── package.json
│
└── docs/                   → All .md files
```

---

## 🎨 UI Components (shadcn/ui)

```typescript
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table } from '@/components/ui/table';
import { Tabs } from '@/components/ui/tabs';
import { toast } from 'sonner';
```

---

## 🔐 Auth Flow

### Login
```typescript
const { login } = useAuth();
await login(email, password);
// Stores JWT in localStorage
// Redirects based on role
```

### Protected Route
```typescript
<ProtectedRoute role="patient">
  <PatientDashboard />
</ProtectedRoute>
```

### API Call with Auth
```typescript
const { get, post } = useApi();
const data = await get('/appointments/');
```

---

## 🐛 Debugging

### Backend Not Starting
```bash
# Check if port 8000 is in use
netstat -ano | findstr :8000

# Check migrations
.venv\Scripts\python.exe manage.py showmigrations

# Check database
.venv\Scripts\python.exe manage.py dbshell
```

### Frontend Not Starting
```bash
# Clear cache
rm -rf node_modules
npm install

# Check port 5173
netstat -ano | findstr :5173
```

### API Errors
```bash
# Test endpoint
curl http://127.0.0.1:8000/api/users/therapists/

# Check logs
# Backend terminal shows Django logs
```

---

## 📚 Documentation Index

- **Setup**: `SETUP_INSTRUCTIONS.md`
- **System Flow**: `SYSTEM_FLOW.md`
- **Frontend**: `FRONTEND_ARCHITECTURE.md`
- **APIs**: `ALL_APIS_WORKING.md`
- **Admin**: `ADMIN_QUICK_START.md`
- **Testing**: `FRONTEND_TESTING_GUIDE.md`

---

## 🎯 Quick Tasks

### Add New Page
1. Create component in `frontend/src/pages/`
2. Add route in `AppRoutes.tsx`
3. Add navigation link
4. Test route protection

### Add New API
1. Create view in Django app
2. Add URL pattern
3. Test with curl/Postman
4. Add to frontend API client
5. Update documentation

### Add New Feature
1. Backend: Model → Migration → View → URL
2. Frontend: Component → Route → API call
3. Test: Backend test → Frontend test
4. Document: Update relevant .md files

---

## 🔗 Useful Links

- **Frontend**: http://localhost:5173
- **Backend**: http://127.0.0.1:8000
- **API Root**: http://127.0.0.1:8000/api/
- **Django Admin**: http://127.0.0.1:8000/admin

---

## 💡 Pro Tips

1. **Always check both terminals** (backend + frontend)
2. **Use browser DevTools** → Network tab for API debugging
3. **Check Django logs** for backend errors
4. **Use React DevTools** for component debugging
5. **Test with different roles** (patient, therapist, admin)
6. **Clear localStorage** if auth issues occur
7. **Check CORS** if API calls fail
8. **Verify JWT token** is being sent in headers

---

**Keep this file open while developing!** 🚀
