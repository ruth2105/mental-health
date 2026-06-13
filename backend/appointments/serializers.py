from rest_framework import serializers
from .models import Appointment, AppointmentFeedback

class AppointmentFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppointmentFeedback
        fields = ['id', 'appointment', 'rating', 'feedback_text', 'created_at']
        read_only_fields = ['id', 'created_at', 'patient']

    def create(self, validated_data):
        """
        Override create to automatically set the patient to the authenticated user.
        """
        # The patient is automatically set to the authenticated user from the view context
        validated_data['patient'] = self.context['request'].user
        return super().create(validated_data)


class UserMinimalSerializer(serializers.Serializer):
    """Minimal user info for appointments"""
    id = serializers.IntegerField()
    email = serializers.EmailField()
    full_name = serializers.SerializerMethodField()
    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)
    role = serializers.CharField()
    avatar = serializers.SerializerMethodField()
    
    # Include doctor profile for therapists
    doctor_profile = serializers.SerializerMethodField()
    
    def get_full_name(self, obj):
        """Get full name from first_name + last_name or full_name field"""
        # Try full_name field first
        if hasattr(obj, 'full_name') and obj.full_name:
            return obj.full_name
        # Try first_name + last_name
        if hasattr(obj, 'first_name') and hasattr(obj, 'last_name'):
            if obj.first_name and obj.last_name:
                return f"{obj.first_name} {obj.last_name}"
            elif obj.first_name:
                return obj.first_name
            elif obj.last_name:
                return obj.last_name
        # Fallback to email
        return obj.email
    
    def get_avatar(self, obj):
        """Get avatar URL if available"""
        if hasattr(obj, 'avatar') and obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None
    
    def get_doctor_profile(self, obj):
        if hasattr(obj, 'doctor_profile'):
            return {
                'id': obj.doctor_profile.id,
                'specialization': obj.doctor_profile.specialization,
                'bio': obj.doctor_profile.bio,
                'rating': obj.doctor_profile.rating,
                'price': obj.doctor_profile.price,
            }
        return None


class AppointmentSerializer(serializers.ModelSerializer):
    patient = UserMinimalSerializer(read_only=True)
    therapist = UserMinimalSerializer(read_only=True)
    therapist_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'therapist', 'therapist_id',
            'scheduled_time', 'paid', 'status', 'session', 'session_notes'
        ]
        read_only_fields = ['id', 'patient', 'therapist', 'session']
    
    def validate(self, data):
        """
        Validate that the therapist doesn't have a conflicting appointment
        """
        therapist_id = data.get('therapist_id')
        scheduled_time = data.get('scheduled_time')
        
        if therapist_id and scheduled_time:
            from users.models import User
            from datetime import timedelta
            
            try:
                therapist = User.objects.get(id=therapist_id, role='therapist')
                
                # Check for conflicting appointments (within 1 hour window)
                # Assuming each session is 1 hour
                time_start = scheduled_time - timedelta(minutes=59)
                time_end = scheduled_time + timedelta(minutes=59)
                
                conflicting_appointments = Appointment.objects.filter(
                    therapist=therapist,
                    scheduled_time__range=(time_start, time_end),
                    status__in=['Scheduled', 'confirmed']  # Only check active appointments
                ).exclude(status='Cancelled')
                
                if conflicting_appointments.exists():
                    conflict = conflicting_appointments.first()
                    raise serializers.ValidationError({
                        'scheduled_time': f'This time slot is not available. The therapist has another appointment at {conflict.scheduled_time.strftime("%I:%M %p")}. Please choose a different time.'
                    })
                    
            except User.DoesNotExist:
                raise serializers.ValidationError({
                    'therapist_id': f'Therapist with ID {therapist_id} does not exist or is not available.'
                })
        
        return data
    
    def create(self, validated_data):
        therapist_id = validated_data.pop('therapist_id', None)
        if therapist_id:
            from users.models import User
            try:
                therapist = User.objects.get(id=therapist_id, role='therapist')
                validated_data['therapist'] = therapist
            except User.DoesNotExist:
                raise serializers.ValidationError({
                    'therapist_id': f'Therapist with ID {therapist_id} does not exist or is not available.'
                })
        return super().create(validated_data)