# API Endpoint Audit & Connection Status

## Complete Backend API Endpoints

### 🔐 Authentication & Users (`/api/users/`)
| Endpoint | Method | Purpose | Frontend Connected |
|----------|--------|---------|-------------------|
| `/api/users/register/` | POST | Register new user | ✅ Register.tsx |
| `/api/users/login/` | POST | Login user | ✅ Login.tsx |
| `/api/auth/token/` | POST | Get JWT token (alias) | ✅ AuthContext |
| `/api/auth/token/refresh/` | POST | Refresh JWT token | ✅ Available |
| `/api/users/profile/` | GET | Get user profile | ✅ Settings.tsx |
| `/api/users/profile/` | PATCH | Update user profile | ✅ Settings.tsx |
| `/api/users/therapists/` | GET | List all therapists | ✅ Therapists.tsx |

### 📅 Appointments (`/api/appointments/`)
| Endpoint | Method | Purpose | Frontend Connected |
|----------|--------|---------|-------------------|
| `/api/appointments/` | GET | List user appointments | ✅ Appointments.tsx |
| `/api/appointments/` | POST | Create appointment | ✅ BookAppointment.tsx |
| `/api/appointments/{id}/` | GET | Get appointment details | ✅ AppointmentDetail.tsx |
| `/api/appointments/{id}/` | PATCH | Update appointment | ⚠️ Partial |
| `/api/appointments/{id}/` | DELETE | Cancel appointment | ❌ Not connected |
| `/api/appointments/feedback/` | POST | Submit feedback | ❌ Not connected |
| `/api/appointments/{id}/token/` | GET | Get video token | ✅ VideoSession.tsx |
| `/api/appointments/patients/` | GET | Therapist's patients | ✅ Patients.tsx |

### 💰 Payments (`/api/payments/`)
| Endpoint | Method | Purpose | Frontend Connected |
|----------|--------|---------|-------------------|
| `/api/payments/initiate/` | POST | Initiate payment | ✅ Payment.tsx |
| `/api/payments/webhook/` | POST | Payment webhook | N/A (External) |
| `/api/payments/verify/` | GET | Verify payment | ✅ Payment.tsx |
| `/api/payments/history/` | GET | Payment history | ❌ Not connected |

### 🎥 Video Sessions (`/api/video/`)
| Endpoint | Method | Purpose | Frontend Connected |
|----------|--------|---------|-------------------|
| `/api/video/token/` | POST | Get video token | ✅ VideoSession.tsx |
| `/api/video/start/` | POST | Start video session | ✅ VideoSession.tsx |
| `/api/video/end/` | POST | End video session | ✅ VideoSession.tsx |

### 🧠 Mental Health AI (`/api/mental_health/`)
| Endpoint | Method | Purpose | Frontend Connected |
|----------|--------|---------|-------------------|
| `/api/mental_health/questionnaire/` | GET | Get assessment questions | ✅ Assessment.tsx |
| `/api/mental_health/predict/` | POST | AI prediction | ✅ Assessment.tsx |
| `/api/mental_health/recommend/` | POST | Therapist recommendation | ❌ Not connected |

### 👥 Admin (`/api/users/admin/`)
| Endpoint | Method | Purpose | Frontend Connected |
|----------|--------|---------|-------------------|
| `/api/users/admin/stats/` | GET | Dashboard statistics | ✅ Dashboard.tsx |
| `/api/users/admin/users/` | GET | List all users | ✅ UsersManagement.tsx |
| `/api/users/admin/users/{id}/toggle/` | POST | Toggle user status | ✅ UsersManagement.tsx |
| `/api/users/admin/users/{id}/verify/` | POST | Verify therapist | ✅ UsersManagement.tsx |
| `/api/users/admin/users/{id}/delete/` | DELETE | Delete user | ✅ UsersManagement.tsx |
| `/api/users/admin/appointments/` | GET | All appointments | ✅ AppointmentsManagement.tsx |

### 🏥 Community & Notifications
| Endpoint | Method | Purpose | Frontend Connected |
|----------|--------|---------|-------------------|
| `/api/community/health/` | GET | Health check | ❌ Not connected |
| `/api/notifications/test/` | GET | Test notifications | ❌ Not connected |

---

## Missing Frontend Connections

### High Priority
1. **Payment History** - Should show in patient dashboard
2. **Appointment Cancellation** - Patients/therapists should be able to cancel
3. **Appointment Feedback** - Post-session feedback form
4. **Therapist Recommendations** - AI-based therapist matching

### Medium Priority
5. **Community Features** - Not implemented in frontend
6. **Notifications** - No notification system in frontend

---

## Frontend Pages Needing API Connections

### Patient Pages
- ✅ Dashboard.tsx - Mostly static, needs real data
- ✅ Assessment.tsx - Connected
- ✅ Therapists.tsx - Connected
- ✅ TherapistProfile.tsx - Connected
- ✅ BookAppointment.tsx - Connected
- ✅ Appointments.tsx - Connected
- ✅ AppointmentDetail.tsx - Connected
- ✅ Payment.tsx - Connected
- ⚠️ **Missing**: Payment history page

### Therapist Pages
- ⚠️ Dashboard.tsx - Mostly static, needs real data
- ✅ Patients.tsx - Connected
- ✅ Settings.tsx - Connected
- ⚠️ **Missing**: Appointments management page
- ⚠️ **Missing**: Patient detail page

### Session Pages
- ✅ VideoSession.tsx - Connected

### Admin Pages
- ✅ Dashboard.tsx - Connected
- ✅ UsersManagement.tsx - Connected
- ✅ AppointmentsManagement.tsx - Connected

---

## Next Steps to Complete Integration

1. Create Payment History page for patients
2. Add appointment cancellation functionality
3. Create feedback form after sessions
4. Implement therapist recommendation feature
5. Create therapist appointments management page
6. Create patient detail page for therapists
7. Connect real data to dashboards (replace static data)
