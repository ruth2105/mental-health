# 👨‍⚕️ Doctor & 🏥 Patient Complete Workflow

## Visual Connection Map

```
┌─────────────────────────────────────────────────────────────────┐
│                         PATIENT JOURNEY                          │
└─────────────────────────────────────────────────────────────────┘

1. REGISTER → 2. LOGIN → 3. ASSESSMENT → 4. BROWSE THERAPISTS
                                                    ↓
                                          5. SELECT THERAPIST
                                                    ↓
                                          6. BOOK APPOINTMENT
                                                    ↓
                                            7. MAKE PAYMENT
                                                    ↓
                                          8. WAIT FOR SESSION
                                                    ↓
                                          9. JOIN VIDEO CALL
                                                    ↓
                                         10. CHAT IN SESSION
                                                    ↓
                                         11. COMPLETE SESSION
                                                    ↓
                                         12. GIVE FEEDBACK

┌─────────────────────────────────────────────────────────────────┐
│                        THERAPIST JOURNEY                         │
└─────────────────────────────────────────────────────────────────┘

1. REGISTER → 2. WAIT APPROVAL → 3. LOGIN → 4. UPDATE PROFILE
                                                    ↓
                                          5. VIEW APPOINTMENTS
                                                    ↓
                                          6. SEE NEW BOOKING
                                                    ↓
                                          7. PREPARE FOR SESSION
                                                    ↓
                                          8. START VIDEO CALL
                                                    ↓
                                          9. CHAT WITH PATIENT
                                                    ↓
                                         10. WRITE SESSION NOTES
                                                    ↓
                                         11. MARK AS COMPLETED
                                                    ↓
                                         12. VIEW FEEDBACK
```

---

## 🏥 PATIENT Tasks & Connections

### 1. Registration & Login
**Page:** `/register` → `/login`
**Backend:** `POST /api/register/`, `POST /api/login/`
**What Happens:**
- Patient creates account
- Receives JWT token
- Redirected to dashboard

**Connects To:**
- Dashboard
- Authentication system
- User database

---

### 2. Dashboard
**Page:** `/patient/dashboard`
**Backend:** `GET /api/user/profile/`
**What Patient Sees:**
- Welcome message
- Upcoming appointments
- Quick actions
- Mental health tips

**Connects To:**
- Appointments
- Assessment
- Therapists list
- Profile settings

---

### 3. Mental Health Assessment
**Page:** `/patient/assessment`
**Backend:** `POST /api/assessment/`
**What Happens:**
- Patient answers questions
- AI analyzes responses
- Generates mental health score
- Recommends therapist types

**Connects To:**
- AI model (CatBoost)
- Assessment database
- Therapist recommendations

---

### 4. Browse Therapists
**Page:** `/patient/therapists`
**Backend:** `GET /api/therapists/`
**What Patient Sees:**
- List of approved therapists
- Specializations
- Ratings
- Prices
- Availability

**Connects To:**
- Therapist profiles
- Search/filter system
- Booking page

---

### 5. View Therapist Profile
**Page:** `/patient/therapist/:id`
**Backend:** `GET /api/therapists/:id/`
**What Patient Sees:**
- Full bio
- Specializations
- Experience
- Reviews
- Availability calendar
- Book button

**Connects To:**
- Booking system
- Feedback system
- Appointment creation

---

### 6. Book Appointment
**Page:** `/patient/book-appointment`
**Backend:** `POST /api/appointments/`
**What Happens:**
- Select therapist
- Choose date/time
- Create appointment (status: Scheduled)
- Redirect to payment

**Connects To:**
- Payment system
- Appointment database
- Notification system (therapist notified)

---

### 7. Make Payment
**Page:** `/patient/payment`
**Backend:** `POST /api/payments/`
**What Happens:**
- Enter payment details
- Process payment
- Mark appointment as paid
- Confirmation email

**Connects To:**
- Payment gateway
- Appointment update
- Email service
- Notification system

---

### 8. View Appointments
**Page:** `/patient/appointments`
**Backend:** `GET /api/appointments/`
**What Patient Sees:**
- Upcoming appointments
- Past appointments
- Appointment details
- Join session button (when time)

**Connects To:**
- Video session
- Payment history
- Feedback form

---

### 9. Join Video Session
**Page:** `/video-session/:appointmentId`
**Backend:** WebSocket + WebRTC
**What Happens:**
- Click "Join Session"
- Connect to video room
- See therapist video
- Enable camera/mic

**Connects To:**
- WebRTC signaling server
- Video/audio streams
- Chat system
- Session database

---

### 10. In-Session Chat
**Component:** Chat sidebar in video session
**Backend:** `POST /api/chat/messages/`, WebSocket
**What Happens:**
- Send text messages
- Share notes
- Real-time communication

**Connects To:**
- Chat database
- WebSocket server
- Message history

---

### 11. Session Completion
**Automatic:** When therapist marks complete
**Backend:** `PATCH /api/appointments/:id/`
**What Happens:**
- Status changes to "Completed"
- Session duration recorded
- Feedback form appears

**Connects To:**
- Appointment database
- Feedback system
- Payment confirmation

---

### 12. Give Feedback
**Page:** `/patient/feedback/:appointmentId`
**Backend:** `POST /api/feedback/`
**What Patient Does:**
- Rate therapist (1-5 stars)
- Write review
- Submit feedback

**Connects To:**
- Feedback database
- Therapist rating update
- Notification to therapist

---

## 👨‍⚕️ THERAPIST (Doctor) Tasks & Connections

### 1. Registration
**Page:** `/register` (role: therapist)
**Backend:** `POST /api/register/`
**What Happens:**
- Therapist creates account
- Status: Pending approval
- Admin notified

**Connects To:**
- Admin approval system
- User database
- Email notification

---

### 2. Wait for Approval
**Status:** Account inactive until approved
**Backend:** Admin uses `PATCH /api/admin/therapists/:id/approve/`
**What Happens:**
- Admin reviews credentials
- Approves or rejects
- Therapist receives email

**Connects To:**
- Admin dashboard
- Email service
- User status update

---

### 3. Login & Dashboard
**Page:** `/therapist/dashboard`
**Backend:** `GET /api/therapist/stats/`
**What Therapist Sees:**
- Today's appointments
- Total patients
- Upcoming sessions
- Recent feedback

**Connects To:**
- Appointments
- Patients list
- Profile settings
- Session notes

---

### 4. Update Profile
**Page:** `/therapist/settings`
**Backend:** `PATCH /api/therapist/profile/`
**What Therapist Can Update:**
- Bio
- Specializations
- Price
- Availability
- Profile photo

**Connects To:**
- Therapist profile database
- Public therapist listing
- Search/filter system

---

### 5. View Appointments
**Page:** `/therapist/appointments`
**Backend:** `GET /api/appointments/`
**What Therapist Sees:**
- All appointments (tabs: All, Scheduled, Completed, Cancelled)
- Patient details
- Appointment time
- Payment status
- Action buttons

**Connects To:**
- Appointment database
- Patient profiles
- Video session
- Session notes

---

### 6. View Patients
**Page:** `/therapist/patients`
**Backend:** `GET /api/therapist/patients/`
**What Therapist Sees:**
- List of all patients
- Total sessions per patient
- Last session date
- Patient history

**Connects To:**
- Patient database
- Appointment history
- Session notes
- Assessment results

---

### 7. Start Video Session
**Page:** `/video-session/:appointmentId`
**Backend:** WebSocket + WebRTC
**What Happens:**
- Click "Start Session"
- Create video room
- Wait for patient
- Enable camera/mic

**Connects To:**
- WebRTC signaling
- Video/audio streams
- Chat system
- Session timer

---

### 8. In-Session Chat
**Component:** Chat in video session
**Backend:** `POST /api/chat/messages/`, WebSocket
**What Happens:**
- Send messages to patient
- Share resources
- Take quick notes

**Connects To:**
- Chat database
- WebSocket server
- Message history

---

### 9. Write Session Notes
**Page:** `/therapist/session-notes/:appointmentId`
**Backend:** `POST /api/appointments/:id/notes/`
**What Therapist Writes:**
- Session summary
- Patient progress
- Treatment plan
- Next steps
- Private notes

**Connects To:**
- Appointment database
- Patient history
- Medical records

---

### 10. Mark Session Complete
**Action:** Button in appointments
**Backend:** `PATCH /api/appointments/:id/`
**What Happens:**
- Status → "Completed"
- Patient can give feedback
- Session recorded in history

**Connects To:**
- Appointment database
- Patient notification
- Feedback system

---

### 11. View Feedback
**Page:** `/therapist/dashboard` or `/therapist/feedback`
**Backend:** `GET /api/feedback/?therapist_id=X`
**What Therapist Sees:**
- All patient reviews
- Average rating
- Individual feedback
- Improvement areas

**Connects To:**
- Feedback database
- Rating calculation
- Public profile rating

---

### 12. Manage Patients
**Page:** `/therapist/patients`
**Backend:** `GET /api/therapist/patients/`
**What Therapist Can Do:**
- View patient list
- See session history
- Access session notes
- Track progress

**Connects To:**
- Patient database
- Appointment history
- Session notes
- Assessment results

---

## 🔗 Key Connections & Data Flow

### Appointment Lifecycle
```
Patient Books → Payment → Scheduled → Both Notified → 
Video Session → Chat → Complete → Feedback → History
```

### Database Connections
```
User (Patient/Therapist)
  ↓
Appointment
  ├→ Payment
  ├→ Video Session
  ├→ Chat Messages
  ├→ Session Notes
  └→ Feedback
```

### Real-Time Connections
```
WebSocket Server
  ├→ Video Signaling (WebRTC)
  ├→ Chat Messages
  └→ Notifications
```

---

## 📊 Complete Feature Matrix

| Feature | Patient | Therapist | Backend API | Frontend Page |
|---------|---------|-----------|-------------|---------------|
| Register | ✅ | ✅ | `/api/register/` | `/register` |
| Login | ✅ | ✅ | `/api/login/` | `/login` |
| Dashboard | ✅ | ✅ | `/api/user/profile/` | `/dashboard` |
| Assessment | ✅ | ❌ | `/api/assessment/` | `/patient/assessment` |
| Browse Therapists | ✅ | ❌ | `/api/therapists/` | `/patient/therapists` |
| Book Appointment | ✅ | ❌ | `POST /api/appointments/` | `/patient/book` |
| Make Payment | ✅ | ❌ | `POST /api/payments/` | `/patient/payment` |
| View Appointments | ✅ | ✅ | `GET /api/appointments/` | `/appointments` |
| Video Session | ✅ | ✅ | WebSocket + WebRTC | `/video-session/:id` |
| Chat | ✅ | ✅ | `/api/chat/` + WebSocket | In video session |
| Session Notes | ❌ | ✅ | `/api/appointments/:id/notes/` | `/therapist/session-notes` |
| Give Feedback | ✅ | ❌ | `POST /api/feedback/` | `/patient/feedback` |
| View Feedback | ❌ | ✅ | `GET /api/feedback/` | `/therapist/feedback` |
| View Patients | ❌ | ✅ | `/api/therapist/patients/` | `/therapist/patients` |
| Update Profile | ✅ | ✅ | `PATCH /api/profile/` | `/settings` |
| Notifications | ✅ | ✅ | WebSocket | Notification bell |

---

## 🎯 Critical Connection Points

### 1. **Appointment Creation**
- Patient selects therapist → Creates appointment → Therapist notified

### 2. **Payment Processing**
- Appointment created → Payment required → Appointment marked paid

### 3. **Video Session**
- Appointment time arrives → Both can join → WebRTC connection

### 4. **Session Completion**
- Therapist marks complete → Patient notified → Feedback requested

### 5. **Feedback Loop**
- Patient submits feedback → Therapist rating updated → Visible to future patients

---

## ✅ Everything is Connected!

Your system has all these connections working:
- ✅ Patient can book with therapist
- ✅ Payment processes correctly
- ✅ Video sessions work
- ✅ Chat is integrated
- ✅ Notifications flow
- ✅ Feedback system active
- ✅ All data persists in database

**The workflow is complete and functional!**
