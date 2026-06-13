# 🏥 Mental Health Platform - Complete System Flow

## 📋 Table of Contents
1. [Patient Flow](#-1-patient-flow)
2. [Therapist Flow](#-2-therapist-flow)
3. [Admin Flow](#-3-admin-flow)
4. [Technical Architecture](#-technical-architecture)
5. [API Endpoints Summary](#-api-endpoints-summary)

---

## 🔵 1. PATIENT FLOW

### Complete Patient Journey (Start to End)

#### 1️⃣ Account Creation
**Action**: User registers as a patient

**Frontend**: `/register`
```
- Select role: "Patient"
- Enter: email, password, full_name, language
- Submit registration
```

**Backend**: `POST /api/users/register/`
```python
Creates:
- User(role="patient")
- PatientProfile (auto-created)
Returns: JWT tokens + user data
```

**Result**: Patient account created, logged in automatically

---

#### 2️⃣ Login & Authentication
**Action**: Patient logs into the platform

**Frontend**: `/login`
```
- Enter email & password
- Submit login
```

**Backend**: `POST /api/users/login/`
```python
Returns:
- access_token (JWT)
- refresh_token
- user data (id, email, role)
```

**Result**: Redirected to `/patient/dashboard`

---

#### 3️⃣ AI Mental Health Assessment
**Action**: Complete mental health screening

**Frontend**: `/assessment`
```
Questions include:
- PHQ-9 (Depression screening)
- GAD-7 (Anxiety screening)
- Additional mental health indicators
```

**Backend**: `POST /api/mental_health/predict/`
```python
Input: Assessment answers
AI Model processes data
Returns:
- predicted_disorder (e.g., "Depression", "Anxiety")
- severity_level (e.g., "Moderate")
- confidence_score
- recommended_specialization
```

**Result**: 
- Patient sees AI prediction results
- Recommended therapist specialization
- Suggested next steps

---

#### 4️⃣ Browse Therapists
**Action**: Find and filter therapists

**Frontend**: `/therapists`
```
Filters available:
- Specialization
- Language
- Price range
- Rating
- Availability
```

**Backend**: `GET /api/users/therapists/`
```python
Returns list of therapists with:
- specialization
- bio
- rating
- price
- languages
- is_verified (admin-approved)
```

**Result**: Patient views matching therapists

---

#### 5️⃣ Book Appointment
**Action**: Schedule session with therapist

**Frontend**: `/therapists/{id}/book`
```
Patient selects:
- Date & time slot
- Preferred language
- Session notes (optional)
```

**Backend**: `POST /api/appointments/create/`
```python
Creates:
- Appointment(status="pending", paid=False)
Returns:
- appointment_id
- scheduled_time
- therapist details
```

**Result**: Appointment created (pending payment)

---

#### 6️⃣ Payment Processing
**Action**: Pay for appointment

**Frontend**: `/payment`
```
Payment methods:
- Credit/Debit Card
- Telebirr
- Chapa
```

**Backend**: `POST /api/payments/initiate/`
```python
Integration: Chapa Payment Gateway
Creates:
- Payment transaction
- Chapa checkout URL
Returns:
- checkout_url (redirect to Chapa)
- transaction_reference
```

**Callback**: `POST /api/payments/verify/`
```python
After payment:
- Appointment.paid = True
- Appointment.status = "confirmed"
- Send confirmation notifications
```

**Result**: 
- Payment confirmed
- Appointment confirmed
- Notifications sent to patient & therapist

---

#### 7️⃣ Video Therapy Session
**Action**: Join live video session

**Frontend**: `/appointments/{id}` → "Join Session"
```
At appointment time:
- Click "Join Session" button
- Request video token
```

**Backend**: `GET /api/video/token/?appointment_id={id}`
```python
Video Integration: Agora/Twilio/Vonage
Returns:
- rtc_token
- channel_name (room_id)
- uid (user_id)
- therapist info
```

**Frontend**: Video Session Interface
```
Features:
- Local video (patient camera)
- Remote video (therapist camera)
- Mic control (mute/unmute)
- Camera control (on/off)
- End session button
- Chat (optional)
```

**Backend**: `POST /api/video/end-session/`
```python
When session ends:
- Update appointment: status="completed"
- Record session duration
- Trigger feedback request
```

**Result**: Therapy session completed

---

#### 8️⃣ Provide Feedback
**Action**: Rate therapist and session

**Frontend**: Feedback modal after session
```
Patient provides:
- Rating (1-5 stars)
- Written feedback
- Session quality
```

**Backend**: `POST /api/appointments/{id}/feedback/`
```python
Updates:
- Appointment.rating
- Appointment.feedback
- Therapist.average_rating (recalculated)
```

**Result**: Feedback recorded, therapist rating updated

---

#### 9️⃣ View History
**Action**: Access past appointments and records

**Frontend**: `/appointments`
```
Patient can view:
- Upcoming appointments
- Past sessions
- Payment history
- AI assessment results
- Medical records (if available)
```

**Backend**: `GET /api/appointments/`
```python
Returns:
- All patient appointments
- Filtered by status
- Sorted by date
```

**Result**: Complete therapy history visible

---

### 📊 Patient Flow Summary
```
1. Register → 2. Login → 3. AI Assessment → 4. Browse Therapists → 
5. Book Appointment → 6. Pay → 7. Video Session → 8. Feedback → 9. History
```

---

## 🟣 2. THERAPIST FLOW

### Complete Therapist Journey

#### 1️⃣ Account Creation
**Action**: Register as therapist

**Frontend**: `/register`
```
- Select role: "Therapist"
- Enter: email, password, full_name
- Additional fields:
  - specialization
  - bio
  - languages
  - price per session
```

**Backend**: `POST /api/users/register/`
```python
Creates:
- User(role="therapist")
- DoctorProfile(is_verified=False)
```

**Result**: 
- Therapist account created
- Pending admin verification (optional)

---

#### 2️⃣ Login & Dashboard
**Action**: Access therapist dashboard

**Frontend**: `/login` → `/therapist/dashboard`
```
Dashboard shows:
- Today's appointments
- Upcoming sessions
- Patient requests
- Earnings summary
- Rating overview
```

**Backend**: `GET /api/users/profile/`
```python
Returns therapist data:
- specialization
- rating
- total_sessions
- is_verified
```

**Result**: Therapist sees personalized dashboard

---

#### 3️⃣ Manage Profile
**Action**: Update professional information

**Frontend**: `/therapist/settings`
```
Therapist can update:
- Specialization
- Bio
- Languages
- Price
- Availability calendar
- Profile photo
```

**Backend**: `PATCH /api/users/profile/`
```python
Updates DoctorProfile:
- specialization
- bio
- languages
- price
```

**Result**: Profile updated and visible to patients

---

#### 4️⃣ View Appointments
**Action**: Manage appointment schedule

**Frontend**: `/therapist/appointments`
```
Categories:
- Upcoming (confirmed, paid)
- Pending (awaiting payment)
- Completed (past sessions)
- Cancelled
```

**Backend**: `GET /api/appointments/therapist/`
```python
Returns:
- All therapist appointments
- Patient details
- Scheduled times
- Payment status
```

**Result**: Complete appointment overview

---

#### 5️⃣ Start Video Session
**Action**: Join therapy session with patient

**Frontend**: `/therapist/appointments/{id}` → "Start Session"
```
At appointment time:
- Click "Start Session"
- Request video token
```

**Backend**: `GET /api/video/token/?appointment_id={id}&role=therapist`
```python
Returns:
- rtc_token
- channel_name
- patient info
```

**Frontend**: Video Session Interface
```
Therapist features:
- Patient video feed
- Own video feed
- Session controls
- Session notes (optional)
- End session
```

**Result**: Live therapy session conducted

---

#### 6️⃣ Post-Session Actions
**Action**: Complete session documentation

**Frontend**: After session ends
```
Therapist can:
- Add session notes
- Mark session complete
- View patient feedback
```

**Backend**: `POST /api/appointments/{id}/notes/`
```python
Updates:
- Session notes (private)
- Session status
- Duration
```

**Result**: Session documented and completed

---

#### 7️⃣ View Patients
**Action**: Access patient list and history

**Frontend**: `/therapist/patients`
```
Therapist sees:
- All patients
- Session history per patient
- Patient notes
- Treatment progress
```

**Backend**: `GET /api/therapist/patients/`
```python
Returns:
- List of patients
- Session count
- Last session date
```

**Result**: Patient management interface

---

#### 8️⃣ Earnings & Analytics
**Action**: Track income and performance

**Frontend**: `/therapist/earnings` (optional)
```
Shows:
- Total earnings
- Sessions completed
- Average rating
- Patient retention
```

**Backend**: `GET /api/payments/therapist/earnings/`
```python
Returns:
- Total revenue
- Pending payments
- Payment history
```

**Result**: Financial overview

---

### 📊 Therapist Flow Summary
```
1. Register → 2. Login → 3. Complete Profile → 4. View Appointments → 
5. Start Session → 6. Add Notes → 7. Manage Patients → 8. Track Earnings
```

---

## 🟡 3. ADMIN FLOW

### Complete Admin Journey

#### 1️⃣ Admin Access
**Action**: Login as administrator

**Credentials**:
```
Email: admin@test.com
Password: admin123
```

**Frontend**: `/login` → `/admin/dashboard`

**Result**: Access to admin control panel

---

#### 2️⃣ Dashboard Overview
**Action**: Monitor system statistics

**Frontend**: `/admin/dashboard`
```
Statistics displayed:
- Total users (patients, therapists, admins)
- Recent registrations (last 7 days)
- Total appointments
- Pending appointments
- System activity
```

**Backend**: `GET /api/users/admin/stats/`
```python
Returns:
{
  "users": {
    "total": 150,
    "patients": 120,
    "therapists": 28,
    "admins": 2,
    "recent": 15
  },
  "appointments": {
    "total": 450,
    "pending": 12,
    "confirmed": 8,
    "completed": 430
  }
}
```

**Result**: System health overview

---

#### 3️⃣ User Management
**Action**: Manage all platform users

**Frontend**: `/admin/dashboard` → Users Management Tab
```
Features:
- Search users (by email/name)
- Filter by role
- View user details
- Activate/deactivate accounts
- Delete users
```

**Backend**: `GET /api/users/admin/users/`
```python
Query parameters:
- ?role=therapist
- ?search=john
- ?status=active

Returns: List of users with full details
```

**Actions Available**:

**Activate/Deactivate User**:
```
POST /api/users/admin/users/{id}/toggle/
Result: User.is_active toggled
```

**Delete User**:
```
DELETE /api/users/admin/users/{id}/delete/
Result: Soft delete (is_active=False)
```

**Result**: Complete user control

---

#### 4️⃣ Therapist Verification
**Action**: Approve and verify therapists

**Frontend**: Users Management → Filter: Therapists
```
Admin can:
- View therapist profiles
- Check credentials
- Verify therapists
- Unverify if needed
```

**Backend**: `POST /api/users/admin/users/{id}/verify/`
```python
Updates:
- DoctorProfile.is_verified = True
- Therapist gets "Verified" badge
- Visible to patients
```

**Result**: Verified therapists displayed with badge

---

#### 5️⃣ Appointments Monitoring
**Action**: Oversee all appointments

**Frontend**: `/admin/dashboard` → Appointments Tab
```
Features:
- View all appointments
- Filter by status
- See patient-therapist pairs
- Monitor payment status
```

**Backend**: `GET /api/users/admin/appointments/`
```python
Query parameters:
- ?status=pending
- ?status=confirmed
- ?status=completed

Returns: All appointments with details
```

**Result**: Complete appointment oversight

---

#### 6️⃣ System Monitoring
**Action**: Track platform health

**Admin can monitor**:
- Active video sessions
- Payment transactions
- User activity
- Error logs (Django admin)
- Database status

**Tools**:
- Admin Dashboard: `/admin/dashboard`
- Django Admin: `http://127.0.0.1:8000/admin`

**Result**: System health monitoring

---

#### 7️⃣ Content Management (Optional)
**Future features**:
- Manage blog posts
- Update FAQs
- Edit landing page
- System announcements
- Email templates

---

### 📊 Admin Flow Summary
```
1. Login → 2. View Dashboard → 3. Manage Users → 4. Verify Therapists → 
5. Monitor Appointments → 6. System Health → 7. Content Management
```

---

## 🏗️ Technical Architecture

### System Components

#### Frontend (React + TypeScript)
```
- React 18
- TypeScript
- Vite
- React Router
- Tailwind CSS
- shadcn/ui components
- Axios for API calls
```

#### Backend (Django + DRF)
```
- Django 4.x
- Django REST Framework
- JWT Authentication (Simple JWT)
- SQLite Database (dev) / PostgreSQL (prod)
- CORS enabled
```

#### AI Module
```
- CatBoost ML model
- Mental health prediction
- Trained on real dataset
- Disorder classification
- Severity assessment
```

#### Payment Integration
```
- Chapa Payment Gateway
- Multiple payment methods
- Transaction tracking
- Webhook callbacks
```

#### Video Integration
```
- Agora/Twilio/Vonage RTC
- Real-time video/audio
- Token-based authentication
- Session recording (optional)
```

---

## 📡 API Endpoints Summary

### Authentication
```
POST   /api/users/register/          - Register new user
POST   /api/users/login/              - Login user
POST   /api/users/token/refresh/      - Refresh JWT token
GET    /api/users/profile/            - Get user profile
PATCH  /api/users/profile/            - Update profile
```

### Therapists
```
GET    /api/users/therapists/         - List all therapists
GET    /api/users/therapists/{id}/    - Get therapist details
```

### AI Assessment
```
POST   /api/mental_health/predict/    - AI prediction
GET    /api/mental_health/history/    - Assessment history
```

### Appointments
```
GET    /api/appointments/             - List appointments
POST   /api/appointments/create/      - Create appointment
GET    /api/appointments/{id}/        - Get appointment details
PATCH  /api/appointments/{id}/        - Update appointment
POST   /api/appointments/{id}/feedback/ - Submit feedback
```

### Payments
```
POST   /api/payments/initiate/        - Initiate payment
POST   /api/payments/verify/          - Verify payment
GET    /api/payments/history/         - Payment history
```

### Video Sessions
```
GET    /api/video/token/              - Get RTC token
POST   /api/video/end-session/        - End video session
```

### Admin (Admin-only)
```
GET    /api/users/admin/stats/        - Dashboard statistics
GET    /api/users/admin/users/        - List all users
POST   /api/users/admin/users/{id}/toggle/  - Toggle user status
POST   /api/users/admin/users/{id}/verify/  - Verify therapist
DELETE /api/users/admin/users/{id}/delete/  - Delete user
GET    /api/users/admin/appointments/ - List all appointments
```

---

## 🎯 Key Features Summary

### For Patients:
✅ AI-powered mental health assessment  
✅ Browse and filter therapists  
✅ Book appointments  
✅ Secure payment processing  
✅ Live video therapy sessions  
✅ Rate and review therapists  
✅ View appointment history  

### For Therapists:
✅ Professional profile management  
✅ Appointment scheduling  
✅ Video session hosting  
✅ Patient management  
✅ Session notes  
✅ Earnings tracking  
✅ Rating system  

### For Admins:
✅ User management  
✅ Therapist verification  
✅ Appointment monitoring  
✅ System statistics  
✅ Payment oversight  
✅ Platform health monitoring  

---

## 🚀 Quick Start Links

- **Patient Dashboard**: http://localhost:5173/patient/dashboard
- **Therapist Dashboard**: http://localhost:5173/therapist/dashboard
- **Admin Dashboard**: http://localhost:5173/admin/dashboard
- **Landing Page**: http://localhost:5173/
- **Django Admin**: http://127.0.0.1:8000/admin

---

## 📞 Test Accounts

### Patient
```
Email: patient@test.com
Password: password123
```

### Therapist
```
Email: therapist@test.com
Password: password123
```

### Admin
```
Email: admin@test.com
Password: admin123
```

---

**This document provides the complete system flow for the Mental Health Platform. Share this with developers, stakeholders, or AI assistants for full context.** 🎉
