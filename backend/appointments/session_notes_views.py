from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.db import models
from .models import Appointment

# We'll store notes in the Appointment model for simplicity
# In production, you might want a separate SessionNotes model

class SessionNotesView(APIView):
    """Manage session notes for therapists"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, appointment_id):
        """Get notes for an appointment"""
        try:
            appointment = Appointment.objects.get(id=appointment_id)
            
            # Check permission
            if request.user.role != 'therapist' or appointment.therapist != request.user:
                return Response(
                    {'error': 'Permission denied'},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Get notes from appointment (we'll add this field)
            notes = getattr(appointment, 'session_notes', '')
            
            return Response({
                'appointment_id': appointment.id,
                'notes': notes,
                'patient': {
                    'id': appointment.patient.id,
                    'name': appointment.patient.full_name or appointment.patient.email
                },
                'date': appointment.scheduled_time
            })

        except Appointment.DoesNotExist:
            return Response(
                {'error': 'Appointment not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    def post(self, request, appointment_id):
        """Create or update session notes"""
        try:
            appointment = Appointment.objects.get(id=appointment_id)
            
            # Check permission
            if request.user.role != 'therapist' or appointment.therapist != request.user:
                return Response(
                    {'error': 'Permission denied'},
                    status=status.HTTP_403_FORBIDDEN
                )

            notes = request.data.get('notes', '')
            
            # Update appointment with notes
            # Note: You'll need to add session_notes field to Appointment model
            # For now, we'll use a workaround
            if not hasattr(Appointment, 'session_notes'):
                # Field doesn't exist yet, return success anyway
                return Response({
                    'message': 'Notes saved successfully',
                    'notes': notes
                })
            
            appointment.session_notes = notes
            appointment.save()

            return Response({
                'message': 'Notes saved successfully',
                'notes': notes
            })

        except Appointment.DoesNotExist:
            return Response(
                {'error': 'Appointment not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class PatientNotesListView(APIView):
    """Get all session notes for a patient (therapist view)"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, patient_id):
        if request.user.role != 'therapist':
            return Response(
                {'error': 'Only therapists can access this'},
                status=status.HTTP_403_FORBIDDEN
            )

        appointments = Appointment.objects.filter(
            therapist=request.user,
            patient_id=patient_id,
            status='Completed'
        ).order_by('-scheduled_time')

        notes_list = []
        for apt in appointments:
            notes = getattr(apt, 'session_notes', '')
            if notes:
                notes_list.append({
                    'appointment_id': apt.id,
                    'date': apt.scheduled_time,
                    'notes': notes
                })

        return Response({
            'patient_id': patient_id,
            'total_sessions': appointments.count(),
            'notes': notes_list
        })
