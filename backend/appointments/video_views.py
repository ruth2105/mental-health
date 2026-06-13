from django.conf import settings
from rest_framework import views, permissions, status
from rest_framework.response import Response
from twilio.jwt.access_token import AccessToken
from twilio.jwt.access_token.grants import VideoGrant
from .models import Appointment, TherapySession # Import TherapySession

class VideoTokenView(views.APIView):
    """
    Generate a Twilio Access Token for a user to join a video room.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, appointment_id):
        try:
            # Ensure the user is either the patient or the doctor for this appointment
            appointment = Appointment.objects.get(id=appointment_id)
            if request.user != appointment.patient and request.user != appointment.doctor: # Changed 'therapist' to 'doctor'
                return Response({"error": "You are not authorized to join this session."}, status=status.HTTP_403_FORBIDDEN)

            # Get the room_id from the TherapySession associated with this appointment
            therapy_session = TherapySession.objects.get(appointment=appointment)
            room_id = therapy_session.room_id

        except (Appointment.DoesNotExist, TherapySession.DoesNotExist):
            return Response({"error": "Appointment or Therapy Session not found."}, status=status.HTTP_404_NOT_FOUND)

        # Get Twilio credentials from settings
        twilio_account_sid = settings.TWILIO_ACCOUNT_SID
        twilio_api_key = settings.TWILIO_API_KEY_SID
        twilio_api_secret = settings.TWILIO_API_KEY_SECRET

        # Create an access token
        token = AccessToken(twilio_account_sid, twilio_api_key, twilio_api_secret, identity=request.user.email)

        # Create a Video grant for the specific room
        video_grant = VideoGrant(room=room_id) # Use the room_id from TherapySession
        token.add_grant(video_grant)

        return Response({
            'token': token.to_jwt(),
            'room_name': room_id
        })