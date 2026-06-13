import { Routes, Route } from "react-router-dom";

// Public pages
import Landing from "../pages/public/Landing";
import About from "../pages/public/About";
import Testimonials from "../pages/public/Testimonials";

// Auth
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ForgotPassword from "../pages/Auth/ForgotPassword";

// Patient
import PatientDashboard from "../pages/patient/Dashboard";
import Assessment from "../pages/patient/Assessment";
import ChatAssessment from "../pages/patient/ChatAssessment";
import AssessmentResult from "../pages/patient/AssessmentResult";
import Therapists from "../pages/patient/Therapists";
import TherapistProfile from "../pages/patient/TherapistProfile";
import BookAppointment from "../pages/patient/BookAppointment";
import Appointments from "../pages/patient/Appointments";
import AppointmentDetail from "../pages/patient/AppointmentDetail";
import FeedbackForm from "../pages/patient/FeedbackForm";
import TestimonialForm from "../pages/patient/TestimonialForm";
import PaymentHistory from "../pages/patient/PaymentHistory";
import PatientProgress from "../pages/patient/Progress";
import PatientSettings from "../pages/patient/Settings";

// Session
import VideoSession from "../pages/session/VideoSessionReal";
import SessionComplete from "../pages/session/SessionComplete";
import SessionWaitingRoom from "../pages/session/SessionWaitingRoom";
import Payment from "../pages/patient/Payment";
import PaymentSuccess from "../pages/patient/PaymentSuccess";
import ChapaCheckout from "../pages/test/ChapaCheckout";
import NotificationTest from "../pages/test/NotificationTest";
import HeartbeatTest from "../pages/test/HeartbeatTest";
import VideoConnectionTest from "../pages/test/VideoConnectionTest";
import SSETest from "../pages/test/SSETest";
import RealtimeChatTest from "../pages/test/RealtimeChatTest";
import ChatWebSocketTest from "../pages/test/ChatWebSocketTest";
import SimpleTest from "../pages/test/SimpleTest";

// Therapist
import TDashboard from "../pages/therapist/Dashboard";
import Patients from "../pages/therapist/Patients";
import PatientDetail from "../pages/therapist/PatientDetail";
import TherapistAppointments from "../pages/therapist/TherapistAppointments";
import SessionNotes from "../pages/therapist/SessionNotes";
import Settings from "../pages/therapist/Settings";
import TherapistProgress from "../pages/therapist/Progress";

// Admin
import AdminDashboard from "../pages/admin/Dashboard";
import TherapistApprovals from "../pages/admin/TherapistApprovals";
import AdminManagement from "../pages/admin/AdminManagement";

// Error
import NotFound from "../pages/error/NotFound";

// Layout
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      
      {/* PUBLIC */}
      <Route path="/" element={<Landing />} />
      <Route path="/about" element={<About />} />
      <Route path="/testimonials" element={<Testimonials />} />
      
      {/* TEST ROUTES */}
      <Route path="/test/chapa-checkout" element={<ChapaCheckout />} />
      <Route path="/test/notifications" element={<NotificationTest />} />
      <Route path="/test/heartbeat/:appointmentId" element={<HeartbeatTest />} />
      <Route path="/test/video-connection" element={<VideoConnectionTest />} />
      <Route path="/test/sse/:appointmentId" element={<SSETest />} />
      <Route path="/test/realtime-chat/:roomId?" element={<RealtimeChatTest />} />
      <Route path="/test/chat-websocket" element={<ChatWebSocketTest />} />
      <Route path="/test/simple" element={<SimpleTest />} />

      {/* AUTH */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* PUBLIC THERAPIST BROWSING */}
      <Route path="/therapists" element={<Therapists />} />
      <Route path="/therapists/:id" element={<TherapistProfile />} />

      {/* BOOKING ROUTE (must come before appointments/:id) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/therapists/:id/book" element={<BookAppointment />} />
      </Route>

      {/* PATIENT ROUTES (protected) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/patient/progress" element={<PatientProgress />} />
        <Route path="/patient/settings" element={<PatientSettings />} />
        <Route path="/patient/testimonial" element={<TestimonialForm />} />
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/chat-assessment" element={<ChatAssessment />} />
        <Route path="/assessment/result" element={<AssessmentResult />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment-history" element={<PaymentHistory />} />
        <Route path="/session/:appointmentId" element={<VideoSession />} />
        <Route path="/session/:appointmentId/complete" element={<SessionComplete />} />
        {/* Specific routes before dynamic :id route */}
        <Route path="/appointments/:appointmentId/feedback" element={<FeedbackForm />} />
        {/* Dynamic route must come last */}
        <Route path="/appointments/:id" element={<AppointmentDetail />} />
      </Route>

      {/* THERAPIST ROUTES (protected) */}
      <Route element={<ProtectedRoute role="therapist" />}>
        <Route path="/therapist/dashboard" element={<TDashboard />} />
        <Route path="/therapist/progress" element={<TherapistProgress />} />
        <Route path="/therapist/patients" element={<Patients />} />
        <Route path="/therapist/patients/:id" element={<PatientDetail />} />
        <Route path="/therapist/appointments" element={<TherapistAppointments />} />
        <Route path="/therapist/appointments/:appointmentId" element={<SessionWaitingRoom />} />
        <Route path="/therapist/appointments/:appointmentId/notes" element={<SessionNotes />} />
        <Route path="/therapist/settings" element={<Settings />} />
      </Route>

      {/* ADMIN ROUTES (protected) */}
      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/therapists/approvals" element={<TherapistApprovals />} />
        <Route path="/admin/manage-admins" element={<AdminManagement />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
