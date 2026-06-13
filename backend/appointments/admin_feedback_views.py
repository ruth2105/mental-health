"""
Admin Feedback Management Views
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db.models import Avg, Count, Q
from django.utils import timezone
from datetime import datetime, timedelta
from .models import AppointmentFeedback, Appointment
from users.models import User

class AdminFeedbackListView(APIView):
    """Admin view to list all feedback with filtering and search"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Check if user is admin/staff
        if not (request.user.is_staff or request.user.is_superuser or getattr(request.user, 'role', None) == 'admin'):
            return Response(
                {"error": "Admin access required"},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            # Get query parameters
            rating_filter = request.query_params.get('rating', None)
            therapist_filter = request.query_params.get('therapist', None)
            date_from = request.query_params.get('date_from', None)
            date_to = request.query_params.get('date_to', None)
            search_query = request.query_params.get('search', None)
            page = int(request.query_params.get('page', 1))
            page_size = int(request.query_params.get('page_size', 20))

            # Base queryset with related data
            feedbacks = AppointmentFeedback.objects.select_related(
                'patient', 'appointment__therapist'
            ).order_by('-created_at')

            # Apply filters
            if rating_filter and rating_filter != 'all':
                feedbacks = feedbacks.filter(rating=int(rating_filter))

            if therapist_filter and therapist_filter != 'all':
                feedbacks = feedbacks.filter(appointment__therapist_id=therapist_filter)

            if date_from:
                try:
                    from_date = datetime.strptime(date_from, '%Y-%m-%d').date()
                    feedbacks = feedbacks.filter(created_at__date__gte=from_date)
                except ValueError:
                    pass

            if date_to:
                try:
                    to_date = datetime.strptime(date_to, '%Y-%m-%d').date()
                    feedbacks = feedbacks.filter(created_at__date__lte=to_date)
                except ValueError:
                    pass

            if search_query:
                feedbacks = feedbacks.filter(
                    Q(feedback_text__icontains=search_query) |
                    Q(patient__full_name__icontains=search_query) |
                    Q(patient__email__icontains=search_query) |
                    Q(appointment__therapist__full_name__icontains=search_query)
                )

            # Pagination
            total_count = feedbacks.count()
            start = (page - 1) * page_size
            end = start + page_size
            paginated_feedbacks = feedbacks[start:end]

            # Serialize data
            feedback_data = []
            for feedback in paginated_feedbacks:
                feedback_data.append({
                    'id': feedback.id,
                    'rating': feedback.rating,
                    'feedback_text': feedback.feedback_text,
                    'created_at': feedback.created_at.isoformat(),
                    'patient': {
                        'id': feedback.patient.id,
                        'name': feedback.patient.full_name or feedback.patient.email,
                        'email': feedback.patient.email,
                    },
                    'therapist': {
                        'id': feedback.appointment.therapist.id,
                        'name': feedback.appointment.therapist.full_name or feedback.appointment.therapist.email,
                        'email': feedback.appointment.therapist.email,
                    },
                    'appointment': {
                        'id': feedback.appointment.id,
                        'scheduled_time': feedback.appointment.scheduled_time.isoformat(),
                        'status': feedback.appointment.status,
                    }
                })

            return Response({
                'feedbacks': feedback_data,
                'total': total_count,
                'page': page,
                'page_size': page_size,
                'has_next': end < total_count,
                'has_previous': page > 1
            })

        except Exception as e:
            return Response({
                'error': 'Failed to load feedback data',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminFeedbackStatsView(APIView):
    """Admin view to get feedback statistics and analytics"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Check if user is admin/staff
        if not (request.user.is_staff or request.user.is_superuser or getattr(request.user, 'role', None) == 'admin'):
            return Response(
                {"error": "Admin access required"},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            # Basic statistics
            total_feedback = AppointmentFeedback.objects.count()
            
            # Rating distribution
            rating_distribution = {}
            for i in range(1, 6):
                count = AppointmentFeedback.objects.filter(rating=i).count()
                rating_distribution[str(i)] = count

            # Average rating
            avg_rating = AppointmentFeedback.objects.aggregate(
                avg_rating=Avg('rating')
            )['avg_rating'] or 0

            # Recent feedback (last 30 days)
            thirty_days_ago = timezone.now() - timedelta(days=30)
            recent_feedback = AppointmentFeedback.objects.filter(
                created_at__gte=thirty_days_ago
            ).count()

            # Low rating feedback (1-2 stars)
            low_rating_feedback = AppointmentFeedback.objects.filter(
                rating__lte=2
            ).count()

            # High rating feedback (4-5 stars)
            high_rating_feedback = AppointmentFeedback.objects.filter(
                rating__gte=4
            ).count()

            # Therapist performance (top 5 by average rating)
            therapist_stats = AppointmentFeedback.objects.values(
                'appointment__therapist__id',
                'appointment__therapist__full_name',
                'appointment__therapist__email'
            ).annotate(
                avg_rating=Avg('rating'),
                feedback_count=Count('id')
            ).filter(
                feedback_count__gte=3  # At least 3 feedbacks
            ).order_by('-avg_rating')[:5]

            # Recent low ratings (for immediate attention)
            recent_low_ratings = AppointmentFeedback.objects.filter(
                rating__lte=2,
                created_at__gte=thirty_days_ago
            ).select_related('patient', 'appointment__therapist').order_by('-created_at')[:5]

            recent_low_ratings_data = []
            for feedback in recent_low_ratings:
                recent_low_ratings_data.append({
                    'id': feedback.id,
                    'rating': feedback.rating,
                    'feedback_text': feedback.feedback_text[:100] + '...' if len(feedback.feedback_text) > 100 else feedback.feedback_text,
                    'created_at': feedback.created_at.isoformat(),
                    'patient_name': feedback.patient.full_name or feedback.patient.email,
                    'therapist_name': feedback.appointment.therapist.full_name or feedback.appointment.therapist.email,
                })

            return Response({
                'total_feedback': total_feedback,
                'average_rating': round(float(avg_rating), 2),
                'rating_distribution': rating_distribution,
                'recent_feedback_count': recent_feedback,
                'low_rating_count': low_rating_feedback,
                'high_rating_count': high_rating_feedback,
                'satisfaction_rate': round((high_rating_feedback / total_feedback * 100) if total_feedback > 0 else 0, 2),
                'therapist_performance': list(therapist_stats),
                'recent_low_ratings': recent_low_ratings_data
            })

        except Exception as e:
            return Response({
                'error': 'Failed to load feedback statistics',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminFeedbackDetailView(APIView):
    """Admin view to get detailed feedback information"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, feedback_id):
        # Check if user is admin/staff
        if not (request.user.is_staff or request.user.is_superuser or getattr(request.user, 'role', None) == 'admin'):
            return Response(
                {"error": "Admin access required"},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            feedback = AppointmentFeedback.objects.select_related(
                'patient', 'appointment__therapist'
            ).get(id=feedback_id)

            # Get other feedback from the same patient
            patient_feedback_history = AppointmentFeedback.objects.filter(
                patient=feedback.patient
            ).exclude(id=feedback_id).order_by('-created_at')[:5]

            # Get other feedback for the same therapist
            therapist_feedback_history = AppointmentFeedback.objects.filter(
                appointment__therapist=feedback.appointment.therapist
            ).exclude(id=feedback_id).order_by('-created_at')[:5]

            return Response({
                'feedback': {
                    'id': feedback.id,
                    'rating': feedback.rating,
                    'feedback_text': feedback.feedback_text,
                    'created_at': feedback.created_at.isoformat(),
                    'patient': {
                        'id': feedback.patient.id,
                        'name': feedback.patient.full_name or feedback.patient.email,
                        'email': feedback.patient.email,
                        'total_appointments': Appointment.objects.filter(patient=feedback.patient).count(),
                        'total_feedback': AppointmentFeedback.objects.filter(patient=feedback.patient).count(),
                    },
                    'therapist': {
                        'id': feedback.appointment.therapist.id,
                        'name': feedback.appointment.therapist.full_name or feedback.appointment.therapist.email,
                        'email': feedback.appointment.therapist.email,
                        'avg_rating': AppointmentFeedback.objects.filter(
                            appointment__therapist=feedback.appointment.therapist
                        ).aggregate(avg=Avg('rating'))['avg'] or 0,
                        'total_feedback': AppointmentFeedback.objects.filter(
                            appointment__therapist=feedback.appointment.therapist
                        ).count(),
                    },
                    'appointment': {
                        'id': feedback.appointment.id,
                        'scheduled_time': feedback.appointment.scheduled_time.isoformat(),
                        'status': feedback.appointment.status,
                        'session_notes': feedback.appointment.session_notes,
                    }
                },
                'patient_feedback_history': [
                    {
                        'id': f.id,
                        'rating': f.rating,
                        'feedback_text': f.feedback_text[:100] + '...' if len(f.feedback_text) > 100 else f.feedback_text,
                        'created_at': f.created_at.isoformat(),
                        'therapist_name': f.appointment.therapist.full_name or f.appointment.therapist.email,
                    } for f in patient_feedback_history
                ],
                'therapist_feedback_history': [
                    {
                        'id': f.id,
                        'rating': f.rating,
                        'feedback_text': f.feedback_text[:100] + '...' if len(f.feedback_text) > 100 else f.feedback_text,
                        'created_at': f.created_at.isoformat(),
                        'patient_name': f.patient.full_name or f.patient.email,
                    } for f in therapist_feedback_history
                ]
            })

        except AppointmentFeedback.DoesNotExist:
            return Response(
                {"error": "Feedback not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response({
                'error': 'Failed to load feedback details',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminFeedbackDeleteView(APIView):
    """Admin view to delete inappropriate feedback"""
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, feedback_id):
        # Check if user is admin/staff
        if not (request.user.is_staff or request.user.is_superuser or getattr(request.user, 'role', None) == 'admin'):
            return Response(
                {"error": "Admin access required"},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            feedback = AppointmentFeedback.objects.get(id=feedback_id)
            
            # Log the deletion for audit purposes
            deletion_reason = request.data.get('reason', 'No reason provided')
            
            # Store feedback info before deletion
            feedback_info = {
                'id': feedback.id,
                'patient_email': feedback.patient.email,
                'therapist_email': feedback.appointment.therapist.email,
                'rating': feedback.rating,
                'feedback_text': feedback.feedback_text,
                'deleted_by': request.user.email,
                'deletion_reason': deletion_reason,
                'deleted_at': timezone.now().isoformat()
            }
            
            # Delete the feedback
            feedback.delete()
            
            # TODO: Log this deletion in an audit log table
            # AuditLog.objects.create(
            #     action='feedback_deleted',
            #     admin_user=request.user,
            #     details=feedback_info
            # )
            
            return Response({
                'message': 'Feedback deleted successfully',
                'deleted_feedback': feedback_info
            })

        except AppointmentFeedback.DoesNotExist:
            return Response(
                {"error": "Feedback not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response({
                'error': 'Failed to delete feedback',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)