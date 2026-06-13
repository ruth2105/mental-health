"""
Admin analytics and audit log views
"""
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Count, Q, Sum, Avg
from django.utils import timezone
from datetime import timedelta
from appointments.models import Appointment
from .audit_models import AuditLog, SystemMetrics

User = get_user_model()


class AdminAnalyticsView(APIView):
    """Get comprehensive analytics for admin dashboard"""
    permission_classes = [permissions.IsAdminUser]
    
    def get(self, request):
        # Time periods
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        # User statistics
        total_users = User.objects.count()
        total_patients = User.objects.filter(role='patient').count()
        total_therapists = User.objects.filter(role='therapist').count()
        pending_therapists = User.objects.filter(
            role='therapist',
            is_approved=False
        ).count()
        
        # New users this week/month
        new_users_week = User.objects.filter(
            date_joined__gte=timezone.now() - timedelta(days=7)
        ).count()
        new_users_month = User.objects.filter(
            date_joined__gte=timezone.now() - timedelta(days=30)
        ).count()
        
        # Appointment statistics
        total_appointments = Appointment.objects.count()
        scheduled_appointments = Appointment.objects.filter(status='Scheduled').count()
        completed_appointments = Appointment.objects.filter(status='Completed').count()
        cancelled_appointments = Appointment.objects.filter(status='Cancelled').count()
        
        # Recent appointments
        appointments_today = Appointment.objects.filter(
            scheduled_time__date=today
        ).count()
        appointments_week = Appointment.objects.filter(
            scheduled_time__date__gte=week_ago
        ).count()
        
        # Payment statistics
        paid_appointments = Appointment.objects.filter(paid=True).count()
        unpaid_appointments = Appointment.objects.filter(paid=False).count()
        
        # Activity statistics
        recent_logins = AuditLog.objects.filter(
            action='user_login',
            timestamp__gte=timezone.now() - timedelta(days=7)
        ).count()
        
        # Top therapists by appointments
        top_therapists = User.objects.filter(
            role='therapist'
        ).annotate(
            appointment_count=Count('appointments_as_therapist')
        ).order_by('-appointment_count')[:5]
        
        top_therapists_data = [{
            'id': t.id,
            'name': t.full_name or t.email,
            'email': t.email,
            'appointments': t.appointment_count
        } for t in top_therapists]
        
        # Recent activity
        recent_activities = AuditLog.objects.select_related('user').all()[:10]
        recent_activities_data = [{
            'id': log.id,
            'action': log.get_action_display(),
            'user': log.user.email if log.user else 'System',
            'description': log.description,
            'timestamp': log.timestamp
        } for log in recent_activities]
        
        return Response({
            'users': {
                'total': total_users,
                'patients': total_patients,
                'therapists': total_therapists,
                'pending_therapists': pending_therapists,
                'new_this_week': new_users_week,
                'new_this_month': new_users_month,
            },
            'appointments': {
                'total': total_appointments,
                'scheduled': scheduled_appointments,
                'completed': completed_appointments,
                'cancelled': cancelled_appointments,
                'today': appointments_today,
                'this_week': appointments_week,
            },
            'payments': {
                'paid': paid_appointments,
                'unpaid': unpaid_appointments,
            },
            'activity': {
                'recent_logins': recent_logins,
            },
            'top_therapists': top_therapists_data,
            'recent_activities': recent_activities_data,
        })


class AuditLogView(APIView):
    """View and filter audit logs"""
    permission_classes = [permissions.IsAdminUser]
    
    def get(self, request):
        # Get query parameters
        action = request.query_params.get('action')
        user_id = request.query_params.get('user_id')
        days = int(request.query_params.get('days', 7))
        limit = int(request.query_params.get('limit', 50))
        
        # Build query
        queryset = AuditLog.objects.select_related('user', 'target_user').all()
        
        # Filter by action
        if action:
            queryset = queryset.filter(action=action)
        
        # Filter by user
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Filter by date
        if days:
            since = timezone.now() - timedelta(days=days)
            queryset = queryset.filter(timestamp__gte=since)
        
        # Limit results
        logs = queryset[:limit]
        
        data = [{
            'id': log.id,
            'action': log.get_action_display(),
            'action_code': log.action,
            'user': {
                'id': log.user.id if log.user else None,
                'email': log.user.email if log.user else 'System',
                'name': log.user.full_name if log.user else 'System'
            },
            'target_user': {
                'id': log.target_user.id if log.target_user else None,
                'email': log.target_user.email if log.target_user else None,
                'name': log.target_user.full_name if log.target_user else None
            } if log.target_user else None,
            'description': log.description,
            'ip_address': log.ip_address,
            'timestamp': log.timestamp,
            'metadata': log.metadata
        } for log in logs]
        
        return Response({
            'count': queryset.count(),
            'logs': data
        })


class SystemMetricsView(APIView):
    """Get system metrics over time"""
    permission_classes = [permissions.IsAdminUser]
    
    def get(self, request):
        days = int(request.query_params.get('days', 30))
        since = timezone.now().date() - timedelta(days=days)
        
        metrics = SystemMetrics.objects.filter(
            date__gte=since
        ).order_by('date')
        
        data = [{
            'date': m.date,
            'users': {
                'total': m.total_users,
                'new': m.new_users,
                'active': m.active_users,
                'patients': m.total_patients,
                'therapists': m.total_therapists,
            },
            'appointments': {
                'total': m.total_appointments,
                'completed': m.completed_appointments,
                'cancelled': m.cancelled_appointments,
                'scheduled': m.scheduled_appointments,
            },
            'revenue': {
                'total': float(m.total_revenue),
                'payments': m.total_payments,
                'refunds': m.total_refunds,
            },
            'sessions': {
                'total': m.total_video_sessions,
                'avg_duration': m.avg_session_duration,
            },
            'engagement': {
                'messages': m.total_messages,
                'notifications': m.total_notifications,
            }
        } for m in metrics]
        
        return Response({
            'period_days': days,
            'metrics': data
        })


class UserBlockView(APIView):
    """Block/unblock users"""
    permission_classes = [permissions.IsAdminUser]
    
    def post(self, request, user_id):
        from .audit_service import log_activity, get_client_ip, get_user_agent
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        action = request.data.get('action')  # 'block' or 'unblock'
        reason = request.data.get('reason', '')
        
        if action == 'block':
            user.is_active = False
            user.save()
            
            log_activity(
                action='user_blocked',
                user=request.user,
                target_user=user,
                description=f"User {user.email} blocked. Reason: {reason}",
                ip_address=get_client_ip(request),
                user_agent=get_user_agent(request),
                metadata={'reason': reason}
            )
            
            return Response({'message': 'User blocked successfully'})
        
        elif action == 'unblock':
            user.is_active = True
            user.save()
            
            log_activity(
                action='user_unblocked',
                user=request.user,
                target_user=user,
                description=f"User {user.email} unblocked",
                ip_address=get_client_ip(request),
                user_agent=get_user_agent(request)
            )
            
            return Response({'message': 'User unblocked successfully'})
        
        return Response(
            {'error': 'Invalid action'},
            status=status.HTTP_400_BAD_REQUEST
        )
