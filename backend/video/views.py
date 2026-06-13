import uuid
from datetime import datetime

from django.shortcuts import get_object_or_404
from django.conf import settings
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import VideoSession
from .serializers import VideoSessionSerializer

from appointments.models import Appointment
from .session_notifications import notify_session_started


def _generate_dummy_token(user, room_id):
    # Simple placeholder token for development/testing
    return {
        'token': uuid.uuid4().hex,
        'provider': 'dummy',
        'room': room_id,
    }


def _generate_twilio_token(user, room_id):
    # Generate a Twilio access token if twilio is installed and settings provided
    try:
        from twilio.jwt.access_token import AccessToken
        from twilio.jwt.access_token.grants import VideoGrant
    except Exception:
        return None

    account_sid = getattr(settings, 'TWILIO_ACCOUNT_SID', None)
    api_key_sid = getattr(settings, 'TWILIO_API_KEY_SID', None)
    api_key_secret = getattr(settings, 'TWILIO_API_KEY_SECRET', None)

    if not all([account_sid, api_key_sid, api_key_secret]):
        return None

    token = AccessToken(account_sid, api_key_sid, api_key_secret, identity=str(user.id))
    video_grant = VideoGrant(room=room_id)
    token.add_grant(video_grant)
    return {
        'token': token.to_jwt().decode() if hasattr(token, 'to_jwt') else token.to_jwt(),
        'provider': 'twilio',
        'room': room_id,
    }


def _choose_provider_and_generate(user, room_id):
    provider = getattr(settings, 'VIDEO_PROVIDER', 'dummy')
    provider = provider.lower()

    if provider == 'twilio':
        tw = _generate_twilio_token(user, room_id)
        if tw:
            return tw

    # Extend here for agora/vonage when configured
    # fall back to dummy
    return _generate_dummy_token(user, room_id)


class VideoTokenView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        appointment_id = request.query_params.get('appointment_id')
        if not appointment_id:
            return Response({'detail': 'appointment_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate Appointment exists
        try:
            appointment = Appointment.objects.get(pk=appointment_id)
        except Appointment.DoesNotExist:
            return Response({'detail': 'Appointment not found'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        # Ensure the requesting user is a participant (patient or therapist)
        if not (appointment.patient_id == user.id or appointment.therapist_id == user.id):
            return Response({'detail': 'You are not a participant of this appointment'}, status=status.HTTP_403_FORBIDDEN)

        # Use the appointment.session.room_id if available, else create a room id
        room_id = None
        if appointment.session and appointment.session.room_id:
            room_id = str(appointment.session.room_id)
        else:
            room_id = str(uuid.uuid4())

        # Generate provider token
        token_payload = _choose_provider_and_generate(user, room_id)

        # Record session start (create a VideoSession record)
        vs = VideoSession.objects.create(
            appointment=appointment,
            patient=appointment.patient if appointment.patient else None,
            doctor=appointment.therapist if appointment.therapist else None,
            provider=token_payload.get('provider', 'dummy'),
            room_id=token_payload.get('room', room_id),
            token=token_payload.get('token', ''),
            started_at=datetime.utcnow(),
            metadata={'generated_by': request.user.email if hasattr(request.user, 'email') else str(request.user)}
        )

        serializer = VideoSessionSerializer(vs)

        return Response({
            'token': token_payload.get('token'),
            'provider': token_payload.get('provider'),
            'room': token_payload.get('room'),
            'session': serializer.data,
        })


class VideoStartView(APIView):
    """Log video session start"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        session_id = request.data.get('session_id')
        appointment_id = request.data.get('appointment_id')
        
        if not session_id and not appointment_id:
            return Response(
                {'error': 'session_id or appointment_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            if session_id:
                session = VideoSession.objects.get(id=session_id)
            else:
                appointment = Appointment.objects.get(id=appointment_id)
                session = VideoSession.objects.filter(appointment=appointment).first()
                
                if not session:
                    # Create new session
                    room_id = str(uuid.uuid4())
                    session = VideoSession.objects.create(
                        appointment=appointment,
                        patient=appointment.patient,
                        doctor=appointment.therapist,
                        provider='dummy',
                        room_id=room_id,
                        started_at=timezone.now()
                    )
            
            # Update start time
            if not session.started_at:
                session.started_at = timezone.now()
                session.save()
            
            serializer = VideoSessionSerializer(session)
            return Response(serializer.data)
            
        except (VideoSession.DoesNotExist, Appointment.DoesNotExist):
            return Response(
                {'error': 'Session or appointment not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class VideoSessionJoinedView(APIView):
    """Notify other participant when someone joins the video session"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        appointment_id = request.data.get('appointment_id')
        
        if not appointment_id:
            return Response(
                {'error': 'appointment_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Send notification to the other participant
            success = notify_session_started(appointment_id, request.user)
            
            if success:
                return Response({
                    'message': 'Notification sent successfully',
                    'appointment_id': appointment_id
                })
            else:
                return Response(
                    {'error': 'Failed to send notification'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class VideoSessionStatusView(APIView):
    """Check if other participant is online in video session"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        appointment_id = request.query_params.get('appointment_id')
        
        if not appointment_id:
            return Response(
                {'error': 'appointment_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            appointment = Appointment.objects.get(id=appointment_id)
            
            # Check if user is participant
            if request.user != appointment.patient and request.user != appointment.therapist:
                return Response(
                    {'error': 'Not authorized'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get video session
            video_session = VideoSession.objects.filter(appointment=appointment).first()
            
            if not video_session:
                return Response({
                    'session_exists': False,
                    'participants_online': 0,
                    'other_participant_online': False
                })
            
            # Track participants using metadata
            metadata = video_session.metadata or {}
            online_participants = metadata.get('online_participants', [])
            current_user_id = request.user.id
            
            # Clean up old participants (remove entries older than 60 seconds)
            import time
            current_time = time.time()
            online_participants = [
                p for p in online_participants 
                if current_time - p.get('last_seen', 0) < 60
            ]
            
            # Update current user's last_seen timestamp
            user_found = False
            for participant in online_participants:
                if participant.get('user_id') == current_user_id:
                    participant['last_seen'] = current_time
                    user_found = True
                    break
            
            # Save updated metadata
            if user_found:
                metadata['online_participants'] = online_participants
                video_session.metadata = metadata
                video_session.save()
            
            # Count participants
            participants_online = len(online_participants)
            other_participant_online = any(
                p.get('user_id') != current_user_id 
                for p in online_participants
            )
            
            return Response({
                'session_exists': True,
                'session_id': video_session.id,
                'room_id': video_session.room_id,
                'participants_online': participants_online,
                'other_participant_online': other_participant_online,
                'session_started': video_session.started_at is not None,
                'session_ended': video_session.ended_at is not None,
                'current_user_online': any(
                    p.get('user_id') == current_user_id 
                    for p in online_participants
                )
            })
            
        except Appointment.DoesNotExist:
            return Response(
                {'error': 'Appointment not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class VideoSessionHeartbeatView(APIView):
    """Track user presence in video session"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        appointment_id = request.data.get('appointment_id')
        action = request.data.get('action', 'join')  # 'join' or 'leave'
        
        if not appointment_id:
            return Response(
                {'error': 'appointment_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            appointment = Appointment.objects.get(id=appointment_id)
            
            # Check if user is participant
            if request.user != appointment.patient and request.user != appointment.therapist:
                return Response(
                    {'error': 'Not authorized'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get or create video session
            video_session, created = VideoSession.objects.get_or_create(
                appointment=appointment,
                defaults={
                    'patient': appointment.patient,
                    'doctor': appointment.therapist,
                    'provider': 'peerjs',
                    'room_id': str(uuid.uuid4()),
                    'metadata': {}
                }
            )
            
            # Update participant tracking
            metadata = video_session.metadata or {}
            online_participants = metadata.get('online_participants', [])
            current_user_id = request.user.id
            
            import time
            current_time = time.time()
            
            if action == 'join':
                # Remove existing entry for this user (cleanup old sessions)
                online_participants = [
                    p for p in online_participants 
                    if p.get('user_id') != current_user_id
                ]
                
                # Add current user with peer ID
                peer_id = request.data.get('peer_id', '')
                online_participants.append({
                    'user_id': current_user_id,
                    'user_email': request.user.email,
                    'joined_at': current_time,
                    'last_seen': current_time,
                    'peer_id': peer_id
                })
                
                print(f"✅ User {current_user_id} joined with peer ID: {peer_id}")
                print(f"📊 Total participants: {len(online_participants)}")
                
                # Start session if not started
                if not video_session.started_at:
                    video_session.started_at = timezone.now()
                
            elif action == 'leave':
                # Remove user from online participants
                online_participants = [
                    p for p in online_participants 
                    if p.get('user_id') != current_user_id
                ]
            
            # Update metadata
            metadata['online_participants'] = online_participants
            video_session.metadata = metadata
            video_session.save()
            
            return Response({
                'success': True,
                'participants_online': len(online_participants),
                'session_started': video_session.started_at is not None
            })
            
        except Appointment.DoesNotExist:
            return Response(
                {'error': 'Appointment not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class VideoSessionPeersView(APIView):
    """Get list of peer IDs for other participants in the session"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        appointment_id = request.query_params.get('appointment_id')
        
        if not appointment_id:
            return Response(
                {'error': 'appointment_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            appointment = Appointment.objects.get(id=appointment_id)
            
            # Check if user is participant
            if request.user != appointment.patient and request.user != appointment.therapist:
                return Response(
                    {'error': 'Not authorized'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get video session
            video_session = VideoSession.objects.filter(appointment=appointment).first()
            
            if not video_session:
                return Response({'peers': []})
            
            # Get peer IDs from metadata
            metadata = video_session.metadata or {}
            online_participants = metadata.get('online_participants', [])
            current_user_id = request.user.id
            
            # Clean up old participants and get peer IDs
            import time
            current_time = time.time()
            active_peers = []
            
            print(f"🔍 Looking for peers for user {current_user_id}")
            print(f"📋 All participants: {online_participants}")
            
            for participant in online_participants:
                last_seen = participant.get('last_seen', 0)
                user_id = participant.get('user_id')
                peer_id = participant.get('peer_id', '').strip()
                
                is_recent = current_time - last_seen < 60
                is_other_user = user_id != current_user_id
                has_peer_id = bool(peer_id)
                
                print(f"👤 Participant {user_id}: recent={is_recent}, other={is_other_user}, has_peer={has_peer_id}, peer_id='{peer_id}'")
                
                if is_recent and is_other_user and has_peer_id:
                    active_peers.append(peer_id)
                    print(f"✅ Added peer: {peer_id}")
            
            print(f"📤 Returning peers: {active_peers}")
            return Response({'peers': active_peers})
            
        except Appointment.DoesNotExist:
            return Response(
                {'error': 'Appointment not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class VideoEndView(APIView):
    """Log video session end"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        session_id = request.data.get('session_id')
        
        if not session_id:
            return Response(
                {'error': 'session_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            session = VideoSession.objects.get(id=session_id)
            
            # Verify user is participant
            user = request.user
            if session.patient_id != user.id and session.doctor_id != user.id:
                return Response(
                    {'error': 'You are not a participant of this session'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Update end time
            session.ended_at = timezone.now()
            session.save()
            
            # Calculate duration
            if session.started_at and session.ended_at:
                duration = (session.ended_at - session.started_at).total_seconds()
            else:
                duration = 0
            
            return Response({
                'message': 'Session ended successfully',
                'session_id': session.id,
                'duration_seconds': duration
            })
            
        except VideoSession.DoesNotExist:
            return Response(
                {'error': 'Session not found'},
                status=status.HTTP_404_NOT_FOUND
            )
