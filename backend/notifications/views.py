from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status, generics
from django.utils import timezone
from .models import Notification, NotificationPreferences
from .serializers import NotificationSerializer, NotificationPreferencesSerializer


class NotifyTest(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        return Response({'notifications': 'ok'})


class NotificationListView(generics.ListAPIView):
    """
    GET: List all notifications for authenticated user
    Supports filtering by read status and notification type
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Notification.objects.filter(recipient=self.request.user)
        
        # Filter by read status
        is_read = self.request.query_params.get('is_read')
        if is_read is not None:
            queryset = queryset.filter(is_read=is_read.lower() == 'true')
        
        # Filter by notification type
        notification_type = self.request.query_params.get('type')
        if notification_type:
            queryset = queryset.filter(notification_type=notification_type)
        
        return queryset.order_by('-created_at')[:50]  # Limit to 50 most recent


class NotificationUnreadCountView(APIView):
    """GET: Get count of unread notifications"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        count = Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).count()
        return Response({'unread_count': count})


class NotificationMarkReadView(APIView):
    """PATCH: Mark a single notification as read"""
    permission_classes = [permissions.IsAuthenticated]
    
    def patch(self, request, notification_id):
        try:
            notification = Notification.objects.get(
                id=notification_id,
                recipient=request.user
            )
            notification.is_read = True
            notification.read_at = timezone.now()
            notification.save()
            
            serializer = NotificationSerializer(notification)
            return Response(serializer.data)
        except Notification.DoesNotExist:
            return Response(
                {'error': 'Notification not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class NotificationMarkAllReadView(APIView):
    """POST: Mark all notifications as read for the user"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        count = Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).update(
            is_read=True,
            read_at=timezone.now()
        )
        return Response({
            'message': f'{count} notifications marked as read',
            'count': count
        })


class NotificationPreferencesView(APIView):
    """
    GET: Retrieve user notification preferences
    PATCH: Update user notification preferences
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        prefs, created = NotificationPreferences.objects.get_or_create(
            user=request.user
        )
        serializer = NotificationPreferencesSerializer(prefs)
        return Response(serializer.data)
    
    def patch(self, request):
        prefs, created = NotificationPreferences.objects.get_or_create(
            user=request.user
        )
        serializer = NotificationPreferencesSerializer(
            prefs,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)