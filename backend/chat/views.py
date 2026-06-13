from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import ChatRoom, Message
from .serializers import ChatRoomSerializer, MessageSerializer

class ChatRoomViewSet(viewsets.ModelViewSet):
    """ViewSet for chat rooms"""
    serializer_class = ChatRoomSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'patient':
            return ChatRoom.objects.filter(patient=user)
        elif user.role == 'therapist':
            return ChatRoom.objects.filter(therapist=user)
        return ChatRoom.objects.none()
    
    def create(self, request):
        """Create or get existing chat room"""
        user = request.user
        other_user_id = request.data.get('other_user_id')
        
        if not other_user_id:
            return Response({'error': 'other_user_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Determine patient and therapist
        if user.role == 'patient':
            patient_id = user.id
            therapist_id = other_user_id
        else:
            patient_id = other_user_id
            therapist_id = user.id
        
        # Get or create chat room
        room, created = ChatRoom.objects.get_or_create(
            patient_id=patient_id,
            therapist_id=therapist_id
        )
        
        serializer = self.get_serializer(room)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """Get all messages in a chat room"""
        room = self.get_object()
        messages = room.messages.all()
        
        # Mark messages as read
        messages.filter(is_read=False).exclude(sender=request.user).update(is_read=True)
        
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        """Send a message in a chat room"""
        room = self.get_object()
        
        # Verify user is part of this room
        if request.user not in [room.patient, room.therapist]:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        message = Message.objects.create(
            room=room,
            sender=request.user,
            content=request.data.get('content', '')
        )
        
        # Update room's updated_at
        room.save()
        
        serializer = MessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MessageViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for messages (read-only)"""
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Message.objects.filter(
            Q(room__patient=user) | Q(room__therapist=user)
        )
