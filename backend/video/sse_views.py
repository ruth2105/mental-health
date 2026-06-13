"""
Server-Sent Events (SSE) views for real-time video session notifications
"""

import json
import time
from django.http import StreamingHttpResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from appointments.models import Appointment
from .models import VideoSession


class VideoSessionSSEView(View):
    """
    Server-Sent Events stream for real-time video session updates
    """
    
    def get(self, request):
        appointment_id = request.GET.get('appointment_id')
        token = request.GET.get('token')
        
        if not appointment_id:
            return StreamingHttpResponse(
                "data: {\"error\": \"appointment_id required\"}\n\n",
                content_type='text/plain'
            )
        
        # Authenticate user via token (since EventSource doesn't support headers)
        user = None
        if token:
            try:
                from rest_framework_simplejwt.tokens import UntypedToken
                from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
                from django.contrib.auth import get_user_model
                
                User = get_user_model()
                
                # Validate token
                UntypedToken(token)
                
                # Get user from token
                from rest_framework_simplejwt.authentication import JWTAuthentication
                jwt_auth = JWTAuthentication()
                validated_token = jwt_auth.get_validated_token(token)
                user = jwt_auth.get_user(validated_token)
                
            except (InvalidToken, TokenError, Exception) as e:
                return StreamingHttpResponse(
                    f"data: {{\"error\": \"Invalid token: {str(e)}\"}}\n\n",
                    content_type='text/plain'
                )
        
        if not user or not user.is_authenticated:
            return StreamingHttpResponse(
                "data: {\"error\": \"Authentication required\"}\n\n",
                content_type='text/plain'
            )
        
        # Verify user has access to this appointment
        try:
            appointment = Appointment.objects.get(id=appointment_id)
            
            if user != appointment.patient and user != appointment.therapist:
                return StreamingHttpResponse(
                    "data: {\"error\": \"Access denied\"}\n\n",
                    content_type='text/plain'
                )
                
        except Appointment.DoesNotExist:
            return StreamingHttpResponse(
                "data: {\"error\": \"Appointment not found\"}\n\n",
                content_type='text/plain'
            )
        
        def event_stream():
            """Generate SSE events for video session updates"""
            
            # Send initial connection message
            yield f"data: {json.dumps({'type': 'connected', 'message': 'SSE connected'})}\n\n"
            
            last_participant_count = 0
            last_session_state = None
            
            while True:
                try:
                    # Get current session status
                    video_session = VideoSession.objects.filter(appointment=appointment).first()
                    
                    if video_session:
                        metadata = video_session.metadata or {}
                        online_participants = metadata.get('online_participants', [])
                        
                        # Clean up old participants (older than 60 seconds)
                        current_time = time.time()
                        active_participants = [
                            p for p in online_participants 
                            if current_time - p.get('last_seen', 0) < 60
                        ]
                        
                        participant_count = len(active_participants)
                        other_participant_online = any(
                            p.get('user_id') != user.id 
                            for p in active_participants
                        )
                        
                        current_state = {
                            'participants_online': participant_count,
                            'other_participant_online': other_participant_online,
                            'session_started': video_session.started_at is not None,
                            'session_ended': video_session.ended_at is not None,
                            'active_participants': [
                                {
                                    'user_id': p.get('user_id'),
                                    'peer_id': p.get('peer_id', ''),
                                    'user_email': p.get('user_email', '')
                                }
                                for p in active_participants
                            ]
                        }
                        
                        # Send update if state changed
                        if (participant_count != last_participant_count or 
                            current_state != last_session_state):
                            
                            event_data = {
                                'type': 'session_update',
                                'data': current_state,
                                'timestamp': current_time
                            }
                            
                            yield f"data: {json.dumps(event_data)}\n\n"
                            
                            last_participant_count = participant_count
                            last_session_state = current_state
                            
                            # Send special notification when other participant joins
                            if other_participant_online and last_participant_count < participant_count:
                                join_event = {
                                    'type': 'participant_joined',
                                    'message': 'Other participant joined the session!',
                                    'data': current_state,
                                    'timestamp': current_time
                                }
                                yield f"data: {json.dumps(join_event)}\n\n"
                    
                    # Wait before next check
                    time.sleep(1)  # Check every second for real-time updates
                    
                except Exception as e:
                    error_event = {
                        'type': 'error',
                        'message': str(e),
                        'timestamp': time.time()
                    }
                    yield f"data: {json.dumps(error_event)}\n\n"
                    break
        
        response = StreamingHttpResponse(
            event_stream(),
            content_type='text/event-stream'
        )
        response['Cache-Control'] = 'no-cache'
        response['Connection'] = 'keep-alive'
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Headers'] = 'Cache-Control'
        
        return response


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def notify_session_event(request):
    """
    Trigger a session event notification (like participant joined)
    """
    appointment_id = request.data.get('appointment_id')
    event_type = request.data.get('event_type', 'participant_joined')
    
    if not appointment_id:
        return Response({'error': 'appointment_id required'}, status=400)
    
    try:
        appointment = Appointment.objects.get(id=appointment_id)
        
        # Verify user access
        if request.user != appointment.patient and request.user != appointment.therapist:
            return Response({'error': 'Access denied'}, status=403)
        
        # This endpoint can be used to trigger immediate notifications
        # The SSE stream will pick up the changes automatically
        
        return Response({
            'success': True,
            'message': f'Event {event_type} triggered for appointment {appointment_id}'
        })
        
    except Appointment.DoesNotExist:
        return Response({'error': 'Appointment not found'}, status=404)