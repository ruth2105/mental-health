from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, Count
from django.contrib.auth import get_user_model
from .models import Appointment, AppointmentFeedback
from .serializers import AppointmentSerializer, AppointmentFeedbackSerializer
from notifications.email_service import EmailService

User = get_user_model()


class AppointmentListCreateView(generics.ListCreateAPIView):
    """
    GET: List all appointments for the authenticated user (as patient or therapist)
    POST: Create a new appointment (patient books with therapist)
    """
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Admin users can see all appointments
        if user.role == 'admin':
            return Appointment.objects.all().order_by('-scheduled_time')
        # Regular users can only see their own appointments
        return Appointment.objects.filter(
            Q(patient=user) | Q(therapist=user)
        ).order_by('-scheduled_time')

    def perform_create(self, serializer):
        appointment = serializer.save(patient=self.request.user)
        
        # Send email notifications
        try:
            EmailService.send_appointment_confirmation(appointment)
            EmailService.send_therapist_notification(appointment)
        except Exception as e:
            # Log error but don't fail the request
            print(f"Failed to send email notifications: {e}")


class AppointmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Retrieve a specific appointment
    PATCH/PUT: Update appointment (therapist can update status)
    DELETE: Cancel/delete appointment
    """
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Admin users can access all appointments
        if user.role == 'admin':
            return Appointment.objects.all()
        # Regular users can only access their own appointments
        return Appointment.objects.filter(
            Q(patient=user) | Q(therapist=user)
        )

    def destroy(self, request, *args, **kwargs):
        """
        Delete appointment for admins, cancel for regular users
        """
        instance = self.get_object()
        user = request.user
        
        # Admins can permanently delete appointments
        if user.role == 'admin':
            instance.delete()
            return Response(
                {'message': 'Appointment deleted successfully'},
                status=status.HTTP_204_NO_CONTENT
            )
        
        # Regular users can only cancel appointments
        instance.status = 'Cancelled'
        instance.save()
        return Response(
            {'message': 'Appointment cancelled successfully'},
            status=status.HTTP_200_OK
        )


class AppointmentFeedbackCreateView(generics.CreateAPIView):
    """POST: Create feedback for an appointment"""
    serializer_class = AppointmentFeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        feedback = serializer.save(patient=self.request.user)
        
        # Send email notification to therapist
        try:
            EmailService.send_feedback_notification(feedback)
        except Exception as e:
            print(f"Failed to send feedback notification: {e}")


class AppointmentFeedbackListView(APIView):
    """GET: List feedback for therapist or appointment"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        therapist_id = request.query_params.get('therapist_id')
        appointment_id = request.query_params.get('appointment_id')

        if appointment_id:
            # Get feedback for specific appointment
            feedback = AppointmentFeedback.objects.filter(
                appointment_id=appointment_id
            ).select_related('patient', 'appointment').first()
            
            if feedback:
                return Response({
                    'id': feedback.id,
                    'rating': feedback.rating,
                    'feedback_text': feedback.feedback_text,
                    'created_at': feedback.created_at,
                    'patient': {
                        'id': feedback.patient.id,
                        'full_name': feedback.patient.full_name,
                        'email': feedback.patient.email
                    }
                })
            return Response(None)

        elif therapist_id:
            # Get all feedback for a therapist
            appointments = Appointment.objects.filter(therapist_id=therapist_id)
            feedbacks = AppointmentFeedback.objects.filter(
                appointment__in=appointments
            ).select_related('patient', 'appointment')

            data = [{
                'id': f.id,
                'rating': f.rating,
                'feedback_text': f.feedback_text,
                'created_at': f.created_at,
                'patient_name': f.patient.full_name or f.patient.email,
                'appointment_date': f.appointment.scheduled_time
            } for f in feedbacks]

            # Calculate average rating
            avg_rating = sum(f['rating'] for f in data) / len(data) if data else 0

            return Response({
                'feedbacks': data,
                'average_rating': round(avg_rating, 2),
                'total_reviews': len(data)
            })

        return Response(
            {'error': 'therapist_id or appointment_id required'},
            status=status.HTTP_400_BAD_REQUEST
        )


class TherapistPatientsView(APIView):
    """
    GET: List all patients who have appointments with this therapist
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        print(f"\n{'='*60}")
        print(f"THERAPIST PATIENTS API CALLED")
        print(f"User: {request.user.email}")
        print(f"User ID: {request.user.id}")
        print(f"User Role: {request.user.role}")
        print(f"{'='*60}\n")
        
        if request.user.role != 'therapist':
            return Response(
                {'error': 'Only therapists can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get all appointments for this therapist
        all_appointments = Appointment.objects.filter(therapist=request.user)
        print(f"Total appointments found: {all_appointments.count()}")
        
        for apt in all_appointments:
            print(f"  - Appointment #{apt.id}: Patient {apt.patient.email} ({apt.patient.id}), Status: {apt.status}")

        # Get unique patient IDs
        patient_ids = all_appointments.values_list('patient', flat=True).distinct()
        print(f"\nUnique patient IDs: {list(patient_ids)}")
        
        patients_data = []
        for patient_id in patient_ids:
            try:
                patient = User.objects.get(id=patient_id)
                
                # Count total sessions with this patient (all statuses)
                total_sessions = Appointment.objects.filter(
                    therapist=request.user,
                    patient=patient
                ).count()
                
                # Count completed sessions
                completed_sessions = Appointment.objects.filter(
                    therapist=request.user,
                    patient=patient,
                    status='Completed'
                ).count()
                
                # Get last/next appointment
                last_appointment = Appointment.objects.filter(
                    therapist=request.user,
                    patient=patient
                ).order_by('-scheduled_time').first()
                
                patient_data = {
                    'id': patient.id,
                    'name': patient.full_name or patient.email.split('@')[0],
                    'email': patient.email,
                    'total_sessions': total_sessions,
                    'completed_sessions': completed_sessions,
                    'last_session': last_appointment.scheduled_time if last_appointment else None,
                    'status': 'Active'
                }
                
                print(f"\nAdding patient: {patient_data}")
                patients_data.append(patient_data)
                
            except User.DoesNotExist:
                print(f"WARNING: Patient with ID {patient_id} not found!")
                continue

        print(f"\nReturning {len(patients_data)} patients")
        print(f"{'='*60}\n")
        return Response(patients_data, status=status.HTTP_200_OK)
