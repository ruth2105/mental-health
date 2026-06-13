"""
Advanced Role-Based Access Control (RBAC) System
Implements granular permissions for mental health application
"""
from rest_framework import permissions
from django.contrib.auth import get_user_model
from functools import wraps
from django.http import JsonResponse
import logging

User = get_user_model()
logger = logging.getLogger(__name__)

class IsPatient(permissions.BasePermission):
    """Permission class for patient-only access"""
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'patient'
        )

class IsTherapist(permissions.BasePermission):
    """Permission class for therapist-only access"""
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'therapist'
        )

class IsAdmin(permissions.BasePermission):
    """Permission class for admin-only access"""
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            (request.user.role == 'admin' or 
             request.user.is_staff or 
             request.user.is_superuser)
        )

class IsApprovedTherapist(permissions.BasePermission):
    """Permission class for approved therapists only"""
    
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        
        if request.user.role != 'therapist':
            return False
        
        # Check if therapist is approved
        if hasattr(request.user, 'doctor_profile'):
            return request.user.doctor_profile.approval_status == 'approved'
        
        return False

class IsOwnerOrAdmin(permissions.BasePermission):
    """Permission class for resource owners or admins"""
    
    def has_object_permission(self, request, view, obj):
        # Admin can access everything
        if request.user.role == 'admin' or request.user.is_staff:
            return True
        
        # Check if user owns the resource
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'patient'):
            return obj.patient == request.user
        elif hasattr(obj, 'therapist'):
            return obj.therapist == request.user
        
        return False

class IsAppointmentParticipant(permissions.BasePermission):
    """Permission for appointment participants (patient or therapist)"""
    
    def has_object_permission(self, request, view, obj):
        # Admin can access everything
        if request.user.role == 'admin' or request.user.is_staff:
            return True
        
        # Check if user is participant in appointment
        return (obj.patient == request.user or obj.therapist == request.user)

class IsChatParticipant(permissions.BasePermission):
    """Permission for chat room participants"""
    
    def has_object_permission(self, request, view, obj):
        # Admin can access everything
        if request.user.role == 'admin' or request.user.is_staff:
            return True
        
        # Check if user is participant in chat
        return (obj.patient == request.user or obj.therapist == request.user)

class IsVideoSessionParticipant(permissions.BasePermission):
    """Permission for video session participants"""
    
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        
        # Get appointment ID from request
        appointment_id = (
            request.data.get('appointment_id') or 
            request.query_params.get('appointment_id') or
            view.kwargs.get('appointment_id')
        )
        
        if not appointment_id:
            return False
        
        # Check if user is participant in the appointment
        from appointments.models import Appointment
        try:
            appointment = Appointment.objects.get(id=appointment_id)
            return (
                appointment.patient == request.user or 
                appointment.therapist == request.user or
                request.user.role == 'admin'
            )
        except Appointment.DoesNotExist:
            return False

def role_required(*allowed_roles):
    """
    Decorator for view functions to require specific roles
    Usage: @role_required('admin', 'therapist')
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return JsonResponse({'error': 'Authentication required'}, status=401)
            
            if request.user.role not in allowed_roles:
                logger.warning(f"Access denied for user {request.user.email} with role {request.user.role}")
                return JsonResponse({'error': 'Insufficient permissions'}, status=403)
            
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator

def admin_required(view_func):
    """Decorator for admin-only views"""
    return role_required('admin')(view_func)

def therapist_required(view_func):
    """Decorator for therapist-only views"""
    return role_required('therapist')(view_func)

def patient_required(view_func):
    """Decorator for patient-only views"""
    return role_required('patient')(view_func)

class SecureModelPermissions:
    """
    Utility class for model-level security checks
    """
    
    @staticmethod
    def can_access_user_data(requesting_user, target_user):
        """Check if requesting user can access target user's data"""
        # Users can access their own data
        if requesting_user == target_user:
            return True
        
        # Admins can access any user's data
        if requesting_user.role == 'admin' or requesting_user.is_staff:
            return True
        
        # Therapists can access their patients' data (through appointments)
        if requesting_user.role == 'therapist':
            from appointments.models import Appointment
            return Appointment.objects.filter(
                therapist=requesting_user,
                patient=target_user
            ).exists()
        
        return False
    
    @staticmethod
    def can_access_appointment(user, appointment):
        """Check if user can access appointment"""
        # Participants can access
        if appointment.patient == user or appointment.therapist == user:
            return True
        
        # Admins can access
        if user.role == 'admin' or user.is_staff:
            return True
        
        return False
    
    @staticmethod
    def can_access_payment(user, payment):
        """Check if user can access payment"""
        # Payment owner can access
        if payment.user == user:
            return True
        
        # Admins can access
        if user.role == 'admin' or user.is_staff:
            return True
        
        # Therapists can access payments for their appointments
        if user.role == 'therapist' and hasattr(payment, 'appointment'):
            return payment.appointment.therapist == user
        
        return False