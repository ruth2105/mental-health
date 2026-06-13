from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, LoginView, ProfileView, TherapistsListView, TherapistDetailView, AvatarUploadView
from .admin_views import (
    admin_dashboard_stats,
    admin_users_list,
    admin_toggle_user_status,
    admin_verify_therapist,
    admin_delete_user,
    admin_appointments_list,
    admin_pending_therapists,
    admin_approve_therapist,
    admin_reject_therapist,
    admin_payment_stats,
    admin_payments_list,
    admin_create_admin
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/avatar/', AvatarUploadView.as_view(), name='avatar_upload'),
    path('therapists/', TherapistsListView.as_view(), name='therapists'),
    path('therapists/<int:id>/', TherapistDetailView.as_view(), name='therapist_detail'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Admin endpoints
    path('admin/stats/', admin_dashboard_stats, name='admin_stats'),
    path('admin/users/', admin_users_list, name='admin_users'),
    path('admin/users/create-admin/', admin_create_admin, name='admin_create_admin'),
    path('admin/users/<int:user_id>/toggle/', admin_toggle_user_status, name='admin_toggle_user'),
    path('admin/users/<int:user_id>/verify/', admin_verify_therapist, name='admin_verify_therapist'),
    path('admin/users/<int:user_id>/delete/', admin_delete_user, name='admin_delete_user'),
    path('admin/appointments/', admin_appointments_list, name='admin_appointments'),
    
    # Therapist approval endpoints
    path('admin/therapists/pending/', admin_pending_therapists, name='admin_pending_therapists'),
    path('admin/therapists/<int:profile_id>/approve/', admin_approve_therapist, name='admin_approve_therapist'),
    path('admin/therapists/<int:profile_id>/reject/', admin_reject_therapist, name='admin_reject_therapist'),
    
    # Payment management endpoints
    path('admin/payments/stats/', admin_payment_stats, name='admin_payment_stats'),
    path('admin/payments/list/', admin_payments_list, name='admin_payments_list'),
]
