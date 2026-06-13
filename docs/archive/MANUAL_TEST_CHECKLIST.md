# 📋 Complete Manual Testing Checklist

## Prerequisites
- ✅ Backend server running (http://localhost:8000)
- ✅ Frontend server running (http://localhost:3000)
- ✅ Database migrated
- ✅ Test accounts created

---

## 🧪 1. PATIENT FLOW TESTS

### 1.1 Registration & Login
- [ ] Go to http://localhost:3000/register
- [ ] Register as patient
- [ ] Verify email validation works
- [ ] Login with credentials
- [ ] Check dashboard loads

### 1.2 Browse Therapists
- [ ] Click "Find Therapists"
- [ ] See list of therapists
- [ ] Use search bar
- [ ] Use filters (specialty, language, price)
- [ ] Scroll to load more (infinite scroll)
- [ ] Click on therapist card

### 1.3 Book Appointment
- [ ] On therapist profile, click "Book Appointment"
- [ ] Select date from calendar
- [ ] See appointment summary
- [ ] Click "Proceed to Payment"
- [ ] Verify redirected to payment page

### 1.4 Make Payment
- [ ] See appointment details on payment page
- [ ] Select payment method
- [ ] Click "Pay ETB 1,500"
- [ ] See success message
- [ ] Verify redirected to "My Appointments"

### 1.5 View Appointments
- [ ] See booked appointment in list
- [ ] Check status shows "Scheduled"
- [ ] Check badge shows "Paid"
- [ ] See "Join Session" button
- [ ] Click "View Details"

### 1.6 Join Video Session
- [ ] Click "Join Session" button
- [ ] Video page loads
- [ ] Camera/microphone permissions requested
- [ ] Video preview shows
- [ ] Can toggle camera/mic

### 1.7 Give Feedback
- [ ] After session, feedback form available
- [ ] Rate therapist (1-5 stars)
- [ ] Write feedback text
- [ ] Submit feedback
- [ ] See success message

### 1.8 Payment History
- [ ] Navigate to "Payment History"
- [ ] See all payments listed
- [ ] Check payment details shown
- [ ] Verify appointment info displayed

---

## 👨‍⚕️ 2. THERAPIST FLOW TESTS

### 2.1 Registration & Approval
- [ ] Register as therapist
- [ ] Fill complete profile
- [ ] Submit for approval
- [ ] Status shows "Pending"
- [ ] Admin approves account
- [ ] Status changes to "Approved"

### 2.2 Login & Dashboard
- [ ] Login as therapist
- [ ] Dashboard loads
- [ ] See statistics
- [ ] See upcoming appointments
- [ ] See recent patients

### 2.3 View Patients
- [ ] Navigate to "My Patients"
- [ ] See list of patients who booked
- [ ] Check patient details shown
- [ ] See session count
- [ ] Click on patient

### 2.4 Patient Details
- [ ] Patient history page loads
- [ ] See all appointments with patient
- [ ] See session notes
- [ ] See assessment results
- [ ] Can navigate back

### 2.5 View Appointments
- [ ] Navigate to "My Appointments"
- [ ] See all appointments
- [ ] Check patient names shown
- [ ] See date/time
- [ ] See status
- [ ] See "Join Session" button

### 2.6 Join Video Session
- [ ] Click "Join Session"
- [ ] Video page loads
- [ ] Can see/hear patient
- [ ] Can toggle camera/mic
- [ ] Session works smoothly

### 2.7 Write Session Notes
- [ ] After session, click "Add Notes"
- [ ] Notes form loads
- [ ] Write session notes
- [ ] Save notes
- [ ] Notes saved successfully
- [ ] Can view notes later

### 2.8 Update Profile
- [ ] Navigate to "Settings"
- [ ] Update profile information
- [ ] Change specialization
- [ ] Update bio
- [ ] Save changes
- [ ] Changes reflected

---

## 👑 3. ADMIN FLOW TESTS

### 3.1 Login & Dashboard
- [ ] Login as admin
- [ ] Dashboard loads
- [ ] See user statistics
- [ ] See appointment statistics
- [ ] See charts/graphs

### 3.2 Therapist Approvals
- [ ] Navigate to "Therapist Approvals"
- [ ] See pending therapists
- [ ] View therapist details
- [ ] Click "Approve"
- [ ] Therapist approved
- [ ] Therapist can now login

### 3.3 User Management
- [ ] Navigate to "Users"
- [ ] See all users
- [ ] Filter by role
- [ ] Search users
- [ ] View user details
- [ ] Can activate/deactivate

### 3.4 Appointment Management
- [ ] Navigate to "Appointments"
- [ ] See all appointments
- [ ] Filter by status
- [ ] View appointment details
- [ ] Can cancel appointments

---

## 🎥 4. VIDEO SESSION TESTS

### 4.1 Patient Side
- [ ] Join session as patient
- [ ] Camera works
- [ ] Microphone works
- [ ] Can see therapist
- [ ] Can hear therapist
- [ ] Can toggle camera
- [ ] Can toggle microphone
- [ ] Can end session

### 4.2 Therapist Side
- [ ] Join session as therapist
- [ ] Camera works
- [ ] Microphone works
- [ ] Can see patient
- [ ] Can hear patient
- [ ] Can toggle camera
- [ ] Can toggle microphone
- [ ] Can end session

### 4.3 Connection Quality
- [ ] Video is clear
- [ ] Audio is clear
- [ ] No significant lag
- [ ] Connection stable
- [ ] Reconnects if dropped

---

## 🔔 5. NOTIFICATION TESTS

### 5.1 Appointment Notifications
- [ ] Book appointment
- [ ] Receive confirmation notification
- [ ] Notification bell shows count
- [ ] Click notification bell
- [ ] See notification list
- [ ] Click notification
- [ ] Redirects to appointment

### 5.2 Real-time Updates
- [ ] Notifications appear instantly
- [ ] No page refresh needed
- [ ] Sound plays (if enabled)
- [ ] Badge updates automatically

---

## 💬 6. CHAT SYSTEM TESTS

### 6.1 Patient Chat
- [ ] Open chat with therapist
- [ ] Send message
- [ ] Message appears
- [ ] Receive reply
- [ ] See message history
- [ ] Typing indicator works

### 6.2 Therapist Chat
- [ ] Open chat with patient
- [ ] Send message
- [ ] Message appears
- [ ] Receive reply
- [ ] See message history
- [ ] Typing indicator works

---

## 🔍 7. SEARCH & FILTER TESTS

### 7.1 Therapist Search
- [ ] Search by name
- [ ] Search by specialty
- [ ] Results update instantly
- [ ] Clear search works

### 7.2 Therapist Filters
- [ ] Filter by specialty
- [ ] Filter by language
- [ ] Filter by price range
- [ ] Filter by rating
- [ ] Multiple filters work together
- [ ] Clear filters works

---

## 📱 8. RESPONSIVE DESIGN TESTS

### 8.1 Desktop (1920x1080)
- [ ] All pages display correctly
- [ ] Navigation works
- [ ] Forms are usable
- [ ] Tables are readable

### 8.2 Tablet (768x1024)
- [ ] Layout adapts
- [ ] Navigation collapses
- [ ] Touch targets adequate
- [ ] Content readable

### 8.3 Mobile (375x667)
- [ ] Mobile menu works
- [ ] Forms are usable
- [ ] Text is readable
- [ ] Buttons are tappable

---

## 🔒 9. SECURITY TESTS

### 9.1 Authentication
- [ ] Can't access protected pages without login
- [ ] Token expires after time
- [ ] Logout works
- [ ] Redirects to login when needed

### 9.2 Authorization
- [ ] Patient can't access therapist pages
- [ ] Therapist can't access admin pages
- [ ] Can only see own data
- [ ] API returns 403 for unauthorized

### 9.3 Data Validation
- [ ] Email validation works
- [ ] Password requirements enforced
- [ ] Form validation prevents bad data
- [ ] SQL injection prevented

---

## ⚡ 10. PERFORMANCE TESTS

### 10.1 Page Load Times
- [ ] Dashboard loads < 2 seconds
- [ ] Therapist list loads < 3 seconds
- [ ] Appointments load < 2 seconds
- [ ] Video session starts < 5 seconds

### 10.2 API Response Times
- [ ] Login < 1 second
- [ ] Get appointments < 1 second
- [ ] Get therapists < 2 seconds
- [ ] Book appointment < 1 second

---

## 🐛 11. ERROR HANDLING TESTS

### 11.1 Network Errors
- [ ] Shows error message when offline
- [ ] Retry button works
- [ ] Graceful degradation

### 11.2 Validation Errors
- [ ] Shows field-specific errors
- [ ] Error messages are clear
- [ ] Can correct and resubmit

### 11.3 Server Errors
- [ ] 500 errors handled gracefully
- [ ] User-friendly error messages
- [ ] Can navigate away

---

## 📊 TEST RESULTS SUMMARY

### Passed: _____ / _____
### Failed: _____ / _____
### Blocked: _____ / _____

### Critical Issues Found:
1. 
2. 
3. 

### Minor Issues Found:
1. 
2. 
3. 

### Notes:


---

## ✅ SIGN-OFF

- [ ] All critical features working
- [ ] No blocking bugs
- [ ] Performance acceptable
- [ ] Security measures in place
- [ ] Ready for deployment

**Tested By**: _______________
**Date**: _______________
**Signature**: _______________
