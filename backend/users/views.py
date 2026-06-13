from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, PatientProfile, DoctorProfile
from .serializers import UserSerializer, CustomTokenObtainPairSerializer, DoctorProfileSerializer
from rest_framework.views import APIView
from django.db import IntegrityError
from rest_framework import filters
from security.permissions import IsAdmin, IsApprovedTherapist, SecureModelPermissions
from security.validators import SecurityValidator, RateLimitValidator
from security.encryption import field_encryption, token_generator, data_masking
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)

# Try to import EmailService, but don't fail if it's not available
try:
    from notifications.email_service import EmailService
    EMAIL_SERVICE_AVAILABLE = True
except ImportError:
    EMAIL_SERVICE_AVAILABLE = False
    EmailService = None


class RegisterView(generics.CreateAPIView):
    """
    Secure user registration with enhanced validation and security checks.
    Returns user info + tokens on success.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        # Get client IP for security checks
        client_ip = getattr(request, 'client_ip', request.META.get('REMOTE_ADDR'))
        
        # Enhanced security validation
        try:
            # Validate email format and security
            email = request.data.get('email', '')
            email = SecurityValidator.validate_email(email)
            
            # Validate password strength
            password = request.data.get('password', '')
            SecurityValidator.validate_password(password)
            
            # Validate name
            full_name = request.data.get('full_name', '')
            if full_name:
                full_name = SecurityValidator.validate_name(full_name)
            
            # Rate limiting check
            email_domain = email.split('@')[1] if '@' in email else ''
            if not RateLimitValidator.check_registration_rate(client_ip, email_domain):
                logger.warning(f"Registration rate limit exceeded for IP: {client_ip}")
                return Response(
                    {"error": "Registration temporarily unavailable. Please try again later."},
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )
            
            # Check for existing user
            if User.objects.filter(email=email).exists():
                logger.warning(f"Registration attempt with existing email: {data_masking.mask_email(email)}")
                return Response(
                    {"error": "A user with this email already exists."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
        except Exception as e:
            logger.warning(f"Registration validation failed: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Sanitize input data
        sanitized_data = request.data.copy()
        sanitized_data['email'] = email
        sanitized_data['full_name'] = SecurityValidator.sanitize_input(full_name) if full_name else ''
        
        serializer = self.get_serializer(data=sanitized_data)
        
        # Check if serializer is valid and return detailed errors if not
        if not serializer.is_valid():
            logger.warning(f"Registration serializer validation failed: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = serializer.save()
            logger.info(f"User registered successfully: {data_masking.mask_email(user.email)}")
        except IntegrityError as e:
            logger.error(f"IntegrityError during user creation: {e}")
            return Response({"error": "A user with that email already exists."},
                            status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Unexpected error during user creation: {e}")
            return Response({"error": f"Registration failed: {str(e)}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Create profile based on role
        role = request.data.get('role', '').lower()
        try:
            if role == 'therapist':
                specialization = request.data.get('specialization', '')
                bio = request.data.get('bio', '')
                license_number = request.data.get('license_number', '')
                years_of_experience = request.data.get('years_of_experience', None)
                education = request.data.get('education', '')
                
                # Create therapist profile with pending status
                DoctorProfile.objects.get_or_create(user=user, defaults={
                    'specialization': specialization,
                    'bio': bio,
                    'license_number': license_number,
                    'years_of_experience': years_of_experience,
                    'education': education,
                    'approval_status': 'pending',  # Requires admin approval
                    'is_verified': False
                })
                print(f"Therapist application created for {user.email} - Status: PENDING")
            else:
                PatientProfile.objects.get_or_create(user=user)
                print(f"Patient profile created for {user.email}")
        except Exception as e:
            print(f"Error creating profile: {e}")
            # Continue anyway - profile can be created later

        # Generate tokens
        refresh = RefreshToken.for_user(user)
        data = {
            "user": {
                "id": user.id,
                "email": user.email,
                "role": user.role,
                "full_name": getattr(user, 'full_name', None)
            },
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            },
        }
        
        # Send welcome email (non-blocking)
        if EMAIL_SERVICE_AVAILABLE and EmailService:
            try:
                EmailService.send_welcome_email(user)
                print(f"Welcome email sent to {user.email}")
            except Exception as e:
                print(f"Failed to send welcome email: {e}")
                # Don't fail registration if email fails
        else:
            print("Email service not available, skipping welcome email")
        
        return Response(data, status=status.HTTP_201_CREATED)


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        data = {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "full_name": user.full_name,
            "language": user.language,
            "avatar": request.build_absolute_uri(user.avatar.url) if user.avatar else None,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
            "profile": {}
        }

        if user.role == 'patient' and hasattr(user, 'patient_profile'):
            p = user.patient_profile
            data['profile'] = {
                "id": p.id, "age": p.age, "gender": p.gender, "condition": p.condition
            }
        elif user.role == 'therapist' and hasattr(user, 'doctor_profile'):
            d = user.doctor_profile
            data['profile'] = {
                "id": d.id, "specialization": d.specialization, "bio": d.bio,
                "rating": d.rating, "price": d.price, "languages": d.languages
            }

        return Response(data)
    
    def patch(self, request):
        """Update user profile"""
        user = request.user
        
        # Update user fields
        if 'full_name' in request.data:
            user.full_name = request.data['full_name']
        if 'language' in request.data:
            user.language = request.data['language']
        user.save()
        
        # Update profile-specific fields
        if user.role == 'patient' and hasattr(user, 'patient_profile'):
            profile = user.patient_profile
            if 'age' in request.data:
                profile.age = request.data['age']
            if 'gender' in request.data:
                profile.gender = request.data['gender']
            if 'condition' in request.data:
                profile.condition = request.data['condition']
            profile.save()
        
        elif user.role == 'therapist' and hasattr(user, 'doctor_profile'):
            profile = user.doctor_profile
            if 'specialization' in request.data:
                profile.specialization = request.data['specialization']
            if 'bio' in request.data:
                profile.bio = request.data['bio']
            if 'price' in request.data:
                # Handle empty string for price
                price_value = request.data['price']
                if price_value == '' or price_value is None:
                    profile.price = None
                else:
                    profile.price = price_value
            if 'languages' in request.data:
                profile.languages = request.data['languages']
            profile.save()
        
        # Return updated profile
        return self.get(request)


class AvatarUploadView(APIView):
    """Upload user avatar/profile photo"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        if 'avatar' not in request.FILES:
            return Response(
                {"error": "No avatar file provided"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = request.user
        avatar_file = request.FILES['avatar']
        
        # Validate file size (max 5MB)
        if avatar_file.size > 5 * 1024 * 1024:
            return Response(
                {"error": "File size must be less than 5MB"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate file type
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
        if avatar_file.content_type not in allowed_types:
            return Response(
                {"error": "Only JPEG, PNG, and GIF images are allowed"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Delete old avatar if exists
        if user.avatar:
            user.avatar.delete(save=False)
        
        # Save new avatar
        user.avatar = avatar_file
        user.save()
        
        return Response({
            "message": "Avatar uploaded successfully",
            "avatar_url": request.build_absolute_uri(user.avatar.url)
        })
    
    def delete(self, request):
        """Delete user avatar"""
        user = request.user
        if user.avatar:
            user.avatar.delete()
            user.save()
            return Response({"message": "Avatar deleted successfully"})
        return Response(
            {"error": "No avatar to delete"},
            status=status.HTTP_404_NOT_FOUND
        )


class TherapistsListView(generics.ListAPIView):
    """
    Public list of therapists with advanced filtering.
    Supports:
    - ?search= - Search by name, specialization, bio
    - ?specialization= - Filter by specialization
    - ?language= - Filter by language
    - ?min_price= - Minimum price
    - ?max_price= - Maximum price
    - ?min_rating= - Minimum rating
    - ?ordering= - Sort by price, rating, etc.
    """
    serializer_class = DoctorProfileSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['specialization', 'bio', 'languages', 'user__full_name', 'user__email']
    ordering_fields = ['price', 'rating', 'user__full_name']
    ordering = ['-rating']  # Default ordering by rating descending

    def get_queryset(self):
        queryset = DoctorProfile.objects.select_related('user').filter(
            user__is_active=True,
            approval_status='approved'  # Only show approved therapists
        )
        
        # Filter by specialization
        specialization = self.request.query_params.get('specialization')
        if specialization:
            queryset = queryset.filter(specialization__icontains=specialization)
        
        # Filter by language
        language = self.request.query_params.get('language')
        if language:
            queryset = queryset.filter(languages__icontains=language)
        
        # Filter by price range
        min_price = self.request.query_params.get('min_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        
        max_price = self.request.query_params.get('max_price')
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        
        # Filter by minimum rating
        min_rating = self.request.query_params.get('min_rating')
        if min_rating:
            queryset = queryset.filter(rating__gte=min_rating)
        
        return queryset


class TherapistDetailView(generics.RetrieveAPIView):
    """
    Get details of a specific therapist by ID.
    Public endpoint - no authentication required.
    Includes feedback and ratings.
    """
    serializer_class = DoctorProfileSerializer
    permission_classes = [AllowAny]
    lookup_field = 'id'

    def get_queryset(self):
        return DoctorProfile.objects.select_related('user').filter(
            user__is_active=True,
            approval_status='approved'  # Only show approved therapists
        )
    
    def retrieve(self, request, *args, **kwargs):
        """Override to include feedback data"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        
        # Add feedback data
        from appointments.models import Appointment, AppointmentFeedback
        
        # Get all appointments for this therapist
        appointments = Appointment.objects.filter(therapist=instance.user)
        feedbacks = AppointmentFeedback.objects.filter(
            appointment__in=appointments
        ).select_related('patient', 'appointment').order_by('-created_at')
        
        # Format feedback data
        feedback_data = []
        for feedback in feedbacks:
            feedback_data.append({
                'id': feedback.id,
                'rating': feedback.rating,
                'feedback_text': feedback.feedback_text,
                'created_at': feedback.created_at,
                'patient_name': feedback.patient.full_name or 'Anonymous',
                'appointment_date': feedback.appointment.scheduled_time
            })
        
        # Calculate average rating and update therapist profile
        if feedbacks:
            avg_rating = sum(f.rating for f in feedbacks) / len(feedbacks)
            # Update the therapist's rating in the database
            instance.rating = round(avg_rating, 2)
            instance.save()
            data['rating'] = instance.rating
        
        # Add feedback to response
        data['feedbacks'] = feedback_data
        data['total_reviews'] = len(feedback_data)
        
        return Response(data)
