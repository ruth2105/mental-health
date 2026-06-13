from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework import status, permissions
from .ai import predict_disorder
from .models import Prediction
from users.models import DoctorProfile
from users.serializers import DoctorProfileSerializer
from .questions_translations import get_questions
from .translations import get_disorder_translation, get_scale_translation
import logging

logger = logging.getLogger(__name__)

class PredictView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        # VERSION MARKER: v2.0 - with model reload logic
        logger.info("PredictView v2.0 - checking model status...")
        
        # Force check if model is loaded
        from . import ai
        logger.info(f"MODEL_DATA status: {ai.MODEL_DATA is not None}")
        
        if ai.MODEL_DATA is None:
            logger.warning("MODEL_DATA is None in view, attempting reload...")
            if not ai.reload_model():
                logger.error("Failed to reload model in view")
                return Response(
                    {'error': 'model_not_loaded', 'message': 'AI model failed to load. Please contact support.'},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            logger.info("Model successfully reloaded in view")
        else:
            logger.info("MODEL_DATA already loaded, proceeding with prediction")
        try:
            print(f"DEBUG: Received request.data: {request.data}")
            print(f"DEBUG: Request data type: {type(request.data)}")
            
            # Handle both direct symptoms array (old format) and object with symptoms key (new format)
            if isinstance(request.data, list):
                # Old format: direct symptoms array
                data = request.data
                user_language = getattr(request.user, 'language', 'en')
                age = None
                print(f"DEBUG: Using old format, language: {user_language}")
            else:
                # New format: {symptoms: [...], language: 'en', age: 25}
                data = request.data.get('symptoms', [])
                user_language = request.data.get('language') or getattr(request.user, 'language', 'en')
                age = request.data.get('age')  # Get age from request
                print(f"DEBUG: Using new format, symptoms length: {len(data)}, language: {user_language}, age: {age}")
            
            if not data:
                print("DEBUG: No symptoms data found")
                return Response({'error':'symptoms required'}, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            print(f"DEBUG: Exception in request parsing: {str(e)}")
            return Response({'error': f'Invalid request format: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        
        # Call predict_disorder with user's language preference and age
        result = predict_disorder(data, user_language, age=age)
        if 'error' in result:
            return Response(result, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        # The prediction is already translated by the AI function
        disorder_translated = result.get('prediction')
        
        # For database storage, we need the English version
        # Try to get English version by reverse translation
        disorder_en = disorder_translated
        if user_language != 'en':
            # Find English equivalent for database storage
            from .translations import DISORDER_TRANSLATIONS
            for eng_key, translated_name in DISORDER_TRANSLATIONS.get(user_language, {}).items():
                if translated_name == disorder_translated:
                    disorder_en = eng_key
                    break

        # Create the prediction record in the database
        Prediction.objects.create(
            user=request.user,
            predicted_disorder=disorder_en,  # Store English version
            raw_input={'symptoms': data}
        )

        # Construct the response payload with translations
        response_data = {
            "prediction": disorder_translated,  # Translated disorder name
            "prediction_en": disorder_en,  # Keep English for internal use
            "confidence": float(result.get('confidence', 0.0)),  # Convert numpy float to Python float
            "confidence_level": result.get('confidence_level', 'low'),
            "confidence_message": result.get('confidence_message', ''),
            "recommendation": result.get('recommendation', "No recommendation available."),
            "language": user_language
        }
        return Response(response_data, status=status.HTTP_200_OK)

class RecommendView(APIView):
    """
    Recommends therapists based on the user's latest AI-predicted disorder.
    """
    permission_classes = [permissions.IsAuthenticated]

    # Use the default pagination class defined in settings
    pagination_class = PageNumberPagination

    def get(self, request, *args, **kwargs):
        latest_prediction = Prediction.objects.filter(user=request.user).order_by('-created_at').first()

        if not latest_prediction:
            return Response({"error": "No prediction found for the user. Please complete the AI assessment first."}, status=status.HTTP_404_NOT_FOUND)

        disorder = latest_prediction.predicted_disorder.strip()
        # Find doctors whose specialization contains the disorder name (case-insensitive)
        recommended_therapists = DoctorProfile.objects.filter(specialization__icontains=disorder)

        # Paginate the queryset
        paginator = self.pagination_class()
        paginated_therapists = paginator.paginate_queryset(recommended_therapists, request, view=self)
        serializer = DoctorProfileSerializer(paginated_therapists, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request, *args, **kwargs):
        """
        Recommends therapists based on a disorder provided in the request body.
        """
        disorder = request.data.get('disorder')
        if not disorder:
            return Response({"error": "A 'disorder' must be provided in the request body."}, status=status.HTTP_400_BAD_REQUEST)

        disorder = disorder.strip()
        # Find doctors whose specialization contains the disorder name (case-insensitive)
        recommended_therapists = DoctorProfile.objects.filter(specialization__icontains=disorder)

        # Paginate the queryset
        paginator = self.pagination_class()
        paginated_therapists = paginator.paginate_queryset(recommended_therapists, request, view=self)
        serializer = DoctorProfileSerializer(paginated_therapists, many=True)
        return paginator.get_paginated_response(serializer.data)

class QuestionnaireView(APIView):
    """
    Provides the list of questions for the AI assessment in user's language.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Get user's language preference
        user_language = request.user.language if hasattr(request.user, 'language') else 'en'
        
        # Get questions in user's language
        questions = get_questions(user_language)
        
        # Get answer scale in user's language
        scale = get_scale_translation(user_language)
        
        # Format questions with IDs
        formatted_questions = [
            {"id": i + 1, "text": question}
            for i, question in enumerate(questions)
        ]
        
        return Response({
            'questions': formatted_questions,
            'scale': scale,
            'language': user_language
        })