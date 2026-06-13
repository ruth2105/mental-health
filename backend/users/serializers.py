from rest_framework import serializers
from .models import User, DoctorProfile
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from security.validators import SecurityValidator
from django.contrib.auth.password_validation import validate_password
import logging

logger = logging.getLogger(__name__)

# -------------------------------
# Register Serializer
# -------------------------------
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['email', 'full_name', 'password', 'role', 'language']

    def create(self, validated_data):
        # Pop password from validated_data
        password = validated_data.pop('password')
        # Create user via manager to handle hashing
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


# -------------------------------
# User Serializer
# -------------------------------
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    full_name = serializers.SerializerMethodField()
    first_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    last_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    avatar = serializers.ImageField(required=False, allow_null=True)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'first_name', 'last_name', 'role', 'language', 'password', 'avatar']
        extra_kwargs = {
            'password': {'write_only': True},
            'full_name': {'read_only': True}
        }
    
    def get_full_name(self, obj):
        """Get full name with multiple fallbacks"""
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
        # Fallback to email username
        return obj.email.split('@')[0] if obj.email else 'User'
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        # Set default full_name if not provided
        if not validated_data.get('full_name'):
            validated_data['full_name'] = validated_data.get('email', '').split('@')[0]
        user = User.objects.create_user(
            email=validated_data['email'],
            password=password,
            full_name=validated_data.get('full_name', ''),
            role=validated_data.get('role', 'patient'),
            language=validated_data.get('language', 'amharic')
        )
        return user


# -------------------------------
# Custom TokenObtainPairSerializer
# -------------------------------
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'  # Accept email as the username field
    
    def validate(self, attrs):
        # Allow both 'email' and 'username' keys to work
        if 'email' in attrs and 'username' not in attrs:
            attrs['username'] = attrs['email']
        return super().validate(attrs)
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['role'] = user.role
        token['email'] = user.email
        return token


# -------------------------------
# Doctor Profile Serializer
# -------------------------------
class DoctorProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    avatar = serializers.SerializerMethodField()
    
    class Meta:
        model = DoctorProfile
        fields = ['id', 'user', 'specialization', 'bio', 'rating', 'price', 'languages', 'avatar']
    
    def get_avatar(self, obj):
        if obj.user.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.user.avatar.url)
        return None
