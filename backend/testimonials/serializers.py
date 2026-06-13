from rest_framework import serializers
from .models import Testimonial
from django.conf import settings

class TestimonialSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()
    star_display = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()
    
    class Meta:
        model = Testimonial
        fields = [
            'id', 'title', 'content', 'rating', 'display_name', 
            'location', 'status', 'is_featured', 'created_at',
            'star_display', 'user_email'
        ]
        read_only_fields = ['id', 'status', 'is_featured', 'created_at']
    
    def get_display_name(self, obj):
        return obj.get_display_name()
    
    def get_star_display(self, obj):
        return obj.get_star_display()
    
    def get_user_email(self, obj):
        # Only show email to admin users
        request = self.context.get('request')
        if request and request.user.is_staff:
            return obj.user.email
        return None

class TestimonialCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = [
            'title', 'content', 'rating', 'display_name', 'location'
        ]
    
    def create(self, validated_data):
        # Set the user from the request
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class AdminTestimonialSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()
    display_name = serializers.SerializerMethodField()
    star_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Testimonial
        fields = [
            'id', 'title', 'content', 'rating', 'display_name', 
            'location', 'status', 'admin_notes', 'is_featured',
            'display_order', 'created_at', 'updated_at', 'reviewed_at',
            'user_name', 'user_email', 'star_display'
        ]
    
    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.username
    
    def get_user_email(self, obj):
        return obj.user.email
    
    def get_display_name(self, obj):
        return obj.get_display_name()
    
    def get_star_display(self, obj):
        return obj.get_star_display()

class TestimonialStatsSerializer(serializers.Serializer):
    total_testimonials = serializers.IntegerField()
    pending_count = serializers.IntegerField()
    approved_count = serializers.IntegerField()
    rejected_count = serializers.IntegerField()
    average_rating = serializers.FloatField()
    featured_count = serializers.IntegerField()
    rating_breakdown = serializers.DictField()