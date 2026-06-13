from django.urls import path
from .views import (
    AppointmentListCreateView,
    AppointmentDetailView,
    AppointmentFeedbackCreateView,
    AppointmentFeedbackListView,
    TherapistPatientsView
)
from .video_views import VideoTokenView
from .session_notes_views import SessionNotesView, PatientNotesListView
from .admin_feedback_views import (
    AdminFeedbackListView,
    AdminFeedbackStatsView,
    AdminFeedbackDetailView,
    AdminFeedbackDeleteView
)

urlpatterns = [
    path('', AppointmentListCreateView.as_view(), name='appointment-list-create'),
    path('<int:pk>/', AppointmentDetailView.as_view(), name='appointment-detail'),
    path('feedback/', AppointmentFeedbackCreateView.as_view(), name='appointment-feedback-create'),
    path('feedback/list/', AppointmentFeedbackListView.as_view(), name='appointment-feedback-list'),
    path('<int:appointment_id>/token/', VideoTokenView.as_view(), name='video-token'),
    path('<int:appointment_id>/notes/', SessionNotesView.as_view(), name='session-notes'),
    path('patients/<int:patient_id>/notes/', PatientNotesListView.as_view(), name='patient-notes'),
    path('patients/', TherapistPatientsView.as_view(), name='therapist-patients'),
    
    # Admin feedback management endpoints
    path('admin/feedback/', AdminFeedbackListView.as_view(), name='admin-feedback-list'),
    path('admin/feedback/stats/', AdminFeedbackStatsView.as_view(), name='admin-feedback-stats'),
    path('admin/feedback/<int:feedback_id>/', AdminFeedbackDetailView.as_view(), name='admin-feedback-detail'),
    path('admin/feedback/<int:feedback_id>/delete/', AdminFeedbackDeleteView.as_view(), name='admin-feedback-delete'),
]
