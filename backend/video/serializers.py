from rest_framework import serializers

from .models import VideoSession


class VideoSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoSession
        fields = [
            'id', 'appointment', 'patient', 'doctor', 'provider', 'room_id',
            'started_at', 'ended_at', 'duration_seconds', 'metadata', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
