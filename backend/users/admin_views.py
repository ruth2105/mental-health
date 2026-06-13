from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Q
from .models import User, PatientProfile, DoctorProfile
from appointments.models import Appointment
from datetime import datetime, timedelta


def is_admin(user):
    """Check if user has admin role"""
    return user.is_authenticated and user.role == 'admin'


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard_stats(request):
    """Get admin dashboard statistics"""
    if not is_admin(request.user):
        return Response({"detail": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)
    
    total_users = User.objects.count()
    total_patients = User.objects.filter(role='patient').count()
    total_therapists = User.objects.filter(role='therapist').count()
    total_admins = User.objects.filter(role='admin').count()
    
    total_appointments = Appointment.objects.count()
    pending_appointments = Appointment.objects.filter(status='Scheduled', paid=False).count()
    confirmed_appointments = Appointment.objects.filter(status='Scheduled', paid=True).count()
    completed_appointments = Appointment.objects.filter(status='Completed').count()
    
    # Recent registrations (last 7 days) - User model doesn't have date_joined
    recent_users = 0  # TODO: Add created_at field to User model
    
    stats = {
        "users": {
            "total": total_users,
            "patients": total_patients,
            "therapists": total_therapists,
            "admins": total_admins,
            "recent": recent_users
        },
        "appointments": {
            "total": total_appointments,
            "pending": pending_appointments,
            "confirmed": confirmed_appointments,
            "completed": completed_appointments
        }
    }
    
    return Response(stats)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_users_list(request):
    """Get list of all users with filters"""
    if not is_admin(request.user):
        return Response({"detail": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)
    
    role = request.GET.get('role', None)
    search = request.GET.get('search', None)
    
    users = User.objects.all().order_by('-id')  # Order by ID since date_joined doesn't exist
    
    if role:
        users = users.filter(role=role)
    
    if search:
        users = users.filter(
            Q(email__icontains=search) | 
            Q(full_name__icontains=search)
        )
    
    users_data = []
    for user in users:
        user_info = {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name or user.email,
            "role": user.role,
            "is_active": user.is_active,
            "date_joined": "N/A",  # User model doesn't have date_joined field
            "language": getattr(user, 'language', 'en')
        }
        
        # Add profile info
        if user.role == 'therapist' and hasattr(user, 'doctor_profile'):
            profile = user.doctor_profile
            user_info['profile'] = {
                "specialization": profile.specialization,
                "rating": profile.rating,
                "price": profile.price,
                "is_verified": profile.is_verified
            }
        elif user.role == 'patient' and hasattr(user, 'patient_profile'):
            profile = user.patient_profile
            user_info['profile'] = {
                "age": profile.age,
                "gender": profile.gender
            }
        
        users_data.append(user_info)
    
    return Response(users_data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_toggle_user_status(request, user_id):
    """Activate or deactivate a user"""
    if not is_admin(request.user):
        return Response({"detail": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id)
        user.is_active = not user.is_active
        user.save()
        
        return Response({
            "id": user.id,
            "email": user.email,
            "is_active": user.is_active,
            "message": f"User {'activated' if user.is_active else 'deactivated'} successfully"
        })
    except User.DoesNotExist:
        return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_pending_therapists(request):
    """Get list of therapists pending approval"""
    if not is_admin(request.user):
        return Response({"detail": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)
    
    pending_profiles = DoctorProfile.objects.select_related('user').filter(
        approval_status='pending'
    ).order_by('-applied_at')
    
    therapists_data = []
    for profile in pending_profiles:
        therapists_data.append({
            "id": profile.id,
            "user_id": profile.user.id,
            "email": profile.user.email,
            "full_name": profile.user.full_name,
            "specialization": profile.specialization,
            "bio": profile.bio,
            "license_number": profile.license_number,
            "years_of_experience": profile.years_of_experience,
            "education": profile.education,
            "price": profile.price,
            "languages": profile.languages,
            "applied_at": profile.applied_at,
            "approval_status": profile.approval_status
        })
    
    return Response(therapists_data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_approve_therapist(request, profile_id):
    """Approve a therapist application"""
    if not is_admin(request.user):
        return Response({"detail": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        profile = DoctorProfile.objects.get(id=profile_id)
        profile.approval_status = 'approved'
        profile.is_verified = True
        profile.reviewed_at = datetime.now()
        profile.reviewed_by = request.user
        profile.save()
        
        # Send approval notification email if available
        try:
            from notifications.email_service import EmailService
            EmailService.send_therapist_approval_email(profile.user)
        except:
            pass
        
        return Response({
            "message": "Therapist approved successfully",
            "profile_id": profile.id,
            "user_email": profile.user.email,
            "approval_status": profile.approval_status
        })
    except DoctorProfile.DoesNotExist:
        return Response({"detail": "Therapist profile not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_reject_therapist(request, profile_id):
    """Reject a therapist application"""
    if not is_admin(request.user):
        return Response({"detail": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        profile = DoctorProfile.objects.get(id=profile_id)
        rejection_reason = request.data.get('reason', 'Application did not meet requirements')
        
        profile.approval_status = 'rejected'
        profile.rejection_reason = rejection_reason
        profile.reviewed_at = datetime.now()
        profile.reviewed_by = request.user
        profile.save()
        
        # Send rejection notification email if available
        try:
            from notifications.email_service import EmailService
            EmailService.send_therapist_rejection_email(profile.user, rejection_reason)
        except:
            pass
        
        return Response({
            "message": "Therapist application rejected",
            "profile_id": profile.id,
            "user_email": profile.user.email,
            "approval_status": profile.approval_status,
            "rejection_reason": rejection_reason
        })
    except DoctorProfile.DoesNotExist:
        return Response({"detail": "Therapist profile not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_verify_therapist(request, user_id):
    """Verify or unverify a therapist (legacy endpoint - use approve/reject instead)"""
    if not is_admin(request.user):
        return Response({"detail": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id, role='therapist')
        
        if not hasattr(user, 'doctor_profile'):
            return Response({"detail": "Therapist profile not found"}, status=status.HTTP_404_NOT_FOUND)
        
        profile = user.doctor_profile
        profile.is_verified = not profile.is_verified
        profile.save()
        
        return Response({
            "id": user.id,
            "email": user.email,
            "is_verified": profile.is_verified,
            "message": f"Therapist {'verified' if profile.is_verified else 'unverified'} successfully"
        })
    except User.DoesNotExist:
        return Response({"detail": "Therapist not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_create_admin(request):
    """Create a new admin user (super admin only)"""
    if not is_admin(request.user) or not request.user.is_superuser:
        return Response({"detail": "Super admin access required"}, status=status.HTTP_403_FORBIDDEN)
    
    email = request.data.get('email', '').strip()
    full_name = request.data.get('full_name', '').strip()
    password = request.data.get('password', '').strip()
    
    # Validation
    if not email:
        return Response({"detail": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    if not password:
        return Response({"detail": "Password is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    if len(password) < 6:
        return Response({"detail": "Password must be at least 6 characters"}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if user already exists
    if User.objects.filter(email=email).exists():
        return Response({"detail": "User with this email already exists"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Create admin user
        admin_user = User.objects.create_user(
            email=email,
            password=password,
            full_name=full_name,
            role='admin',
            is_staff=True,
            is_active=True
        )
        
        return Response({
            "message": "Admin user created successfully",
            "admin": {
                "id": admin_user.id,
                "email": admin_user.email,
                "full_name": admin_user.full_name,
                "role": admin_user.role,
                "is_active": admin_user.is_active,
                "is_staff": admin_user.is_staff
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({"detail": f"Failed to create admin user: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def admin_delete_user(request, user_id):
    """Delete a user permanently"""
    if not is_admin(request.user):
        return Response({"detail": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id)
        
        # Prevent deleting yourself
        if user.id == request.user.id:
            return Response({"detail": "Cannot delete your own account"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Prevent deleting other admins unless you're a superuser
        if user.role == 'admin' and not request.user.is_superuser:
            return Response({"detail": "Only super admin can delete admin users"}, status=status.HTTP_400_BAD_REQUEST)
        
        user_email = user.email
        
        # Hard delete - this will cascade delete related profiles and data
        user.delete()
        
        return Response({
            "message": f"User {user_email} deleted successfully"
        })
    except User.DoesNotExist:
        return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_appointments_list(request):
    """Get list of all appointments"""
    if not is_admin(request.user):
        return Response({"detail": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)
    
    status_filter = request.GET.get('status', None)
    
    appointments = Appointment.objects.select_related('patient', 'therapist').all().order_by('-scheduled_time')
    
    if status_filter:
        appointments = appointments.filter(status=status_filter)
    
    appointments_data = []
    for apt in appointments:
        appointments_data.append({
            "id": apt.id,
            "patient": {
                "id": apt.patient.id,
                "name": apt.patient.full_name or apt.patient.email,
                "email": apt.patient.email
            },
            "therapist": {
                "id": apt.therapist.id,
                "name": apt.therapist.full_name or apt.therapist.email,
                "email": apt.therapist.email
            },
            "scheduled_time": apt.scheduled_time,
            "status": apt.status,
            "paid": apt.paid,
            "session_notes": apt.session_notes or ""
        })
    
    return Response(appointments_data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_payment_stats(request):
    """Get payment statistics"""
    if not is_admin(request.user):
        return Response({"detail": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        from payments.models import Payment
        from django.db.models import Sum, Count
        
        total_revenue = Payment.objects.filter(status='completed').aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        pending_count = Payment.objects.filter(status='pending').count()
        completed_count = Payment.objects.filter(status='completed').count()
        
        # Calculate therapist earnings (assuming 80% goes to therapist)
        therapist_earnings = total_revenue * 0.8
        
        return Response({
            "total_revenue": float(total_revenue),
            "pending_payments": pending_count,
            "completed_payments": completed_count,
            "therapist_earnings": float(therapist_earnings)
        })
    except Exception as e:
        return Response({
            "total_revenue": 0,
            "pending_payments": 0,
            "completed_payments": 0,
            "therapist_earnings": 0
        })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_payments_list(request):
    """Get list of all payments"""
    if not is_admin(request.user):
        return Response({"detail": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        from payments.models import Payment
        
        status_filter = request.GET.get('status', None)
        
        payments = Payment.objects.select_related(
            'appointment__patient',
            'appointment__therapist'
        ).all().order_by('-created_at')
        
        if status_filter:
            payments = payments.filter(status=status_filter)
        
        payments_data = []
        for payment in payments:
            payments_data.append({
                "id": payment.id,
                "appointment_id": payment.appointment.id,
                "patient": {
                    "id": payment.appointment.patient.id,
                    "name": payment.appointment.patient.full_name or payment.appointment.patient.email,
                    "email": payment.appointment.patient.email
                },
                "therapist": {
                    "id": payment.appointment.therapist.id,
                    "name": payment.appointment.therapist.full_name or payment.appointment.therapist.email,
                    "email": payment.appointment.therapist.email
                },
                "amount": float(payment.amount),
                "status": payment.status,
                "payment_method": payment.payment_method,
                "reference": payment.reference,
                "created_at": payment.created_at
            })
        
        return Response(payments_data)
    except Exception as e:
        return Response([], status=status.HTTP_200_OK)
