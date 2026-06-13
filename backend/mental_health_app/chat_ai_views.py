"""
Conversational AI Views for Mental Health Chat Assessment
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .ai import predict_disorder
from .models import Prediction, ChatSession, ChatMessage
from django.utils import timezone
import logging
import re
import random

logger = logging.getLogger(__name__)

class ChatAIView(APIView):
    """
    Conversational AI endpoint for friendly mental health chat
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            data = request.data
            message = data.get('message', '').strip()
            session_id = data.get('session_id')
            conversation_state = data.get('conversation_state', {})
            user_language = data.get('language', 'en')
            
            # Get or create chat session
            if session_id:
                try:
                    chat_session = ChatSession.objects.get(id=session_id, user=request.user)
                except ChatSession.DoesNotExist:
                    chat_session = ChatSession.objects.create(user=request.user)
            else:
                chat_session = ChatSession.objects.create(user=request.user)
            
            # Save user message
            user_message = ChatMessage.objects.create(
                session=chat_session,
                sender='user',
                content=message,
                metadata=conversation_state
            )
            
            # Generate AI response based on conversation context
            ai_response = self.generate_ai_response(
                message, 
                conversation_state, 
                user_language,
                request.user
            )
            
            # Save AI response
            ai_message = ChatMessage.objects.create(
                session=chat_session,
                sender='ai',
                content=ai_response['content'],
                metadata=ai_response.get('metadata', {})
            )
            
            return Response({
                'session_id': chat_session.id,
                'ai_response': ai_response,
                'message_id': ai_message.id
            })
            
        except Exception as e:
            logger.exception(f"Chat AI error: {e}")
            return Response({
                'error': 'Failed to process chat message',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def generate_ai_response(self, user_message, conversation_state, language, user):
        """
        Generate contextual AI responses based on conversation state
        """
        current_topic = conversation_state.get('currentTopic', 'greeting')
        topic_index = conversation_state.get('topicIndex', 0)
        responses = conversation_state.get('responses', [0] * 19)
        
        # Friendly response templates
        encouraging_phrases = [
            "I really appreciate you sharing that with me.",
            "Thank you for being so open and honest.",
            "It takes courage to talk about these things.",
            "I'm here to listen and support you.",
            "You're doing great by taking this step."
        ]
        
        transition_phrases = [
            "Let's explore this a bit more.",
            "I'd like to understand better.",
            "Can you tell me more about",
            "How would you describe",
            "I'm curious about"
        ]
        
        # Analyze user response for sentiment and extract assessment value
        assessment_value = self.extract_assessment_value(user_message)
        sentiment = self.analyze_sentiment(user_message)
        
        # Generate empathetic response based on sentiment
        if sentiment == 'negative':
            empathy_response = random.choice([
                "I can hear that this has been really difficult for you. ",
                "That sounds really challenging to deal with. ",
                "I'm sorry you've been going through this. ",
                "It sounds like you've been having a tough time. "
            ])
        elif sentiment == 'positive':
            empathy_response = random.choice([
                "I'm glad to hear that! ",
                "That's wonderful to know. ",
                "It's great that you're managing well with this. ",
                "That sounds really positive. "
            ])
        else:
            empathy_response = random.choice([
                "I understand. ",
                "Thank you for sharing that. ",
                "I hear you. ",
                "That makes sense. "
            ])
        
        # Provide intermediate predictions for encouragement
        prediction_insight = ""
        if topic_index > 5 and topic_index % 4 == 0:  # Every 4 questions after the 5th
            try:
                # Create partial assessment
                partial_responses = responses[:topic_index-2] + [0] * (19 - (topic_index-2))
                result = predict_disorder(partial_responses, language, age=conversation_state.get('userAge', 25))
                
                if 'prediction' in result:
                    confidence_msg = ""
                    if result['confidence'] >= 0.7:
                        confidence_msg = "I'm getting a clearer picture of how you've been feeling. "
                    elif result['confidence'] >= 0.5:
                        confidence_msg = "I'm starting to see some patterns in what you're sharing. "
                    else:
                        confidence_msg = "I'm learning more about your experiences. "
                    
                    prediction_insight = f"\n\n💙 {confidence_msg}Based on our conversation so far, I'm seeing some indicators that might suggest {result['prediction'].lower()}. My confidence is around {int(result['confidence'] * 100)}%. Let's continue so I can give you more accurate insights!"
            except Exception as e:
                logger.warning(f"Intermediate prediction failed: {e}")
        
        # Generate next question or response
        if current_topic == 'greeting':
            next_response = "Nice to meet you! I'm your friendly mental health companion. Before we start our conversation, could you tell me your age? This helps me provide more personalized insights. 😊"
        elif current_topic == 'age':
            age = self.extract_age(user_message)
            next_response = f"Perfect! Now, let's start with something simple. Over the past couple of weeks, how has your interest been in doing things you usually enjoy? Like hobbies, spending time with friends, or activities you normally love? {prediction_insight}"
        else:
            # Generate contextual follow-up questions
            next_response = self.get_next_question(topic_index, empathy_response, prediction_insight)
        
        return {
            'content': next_response,
            'assessment_value': assessment_value,
            'sentiment': sentiment,
            'metadata': {
                'topic_index': topic_index + 1,
                'empathy_level': sentiment,
                'has_prediction': bool(prediction_insight)
            }
        }

    def extract_assessment_value(self, message):
        """
        Extract assessment value (0-3) from natural language response
        """
        message_lower = message.lower()
        
        # Strong negative indicators (0)
        negative_patterns = [
            r'\b(never|not at all|no|none|zero)\b',
            r'\b(fine|good|great|excellent|perfect)\b',
            r'\b(no problem|no issue|not really)\b'
        ]
        
        # Severe positive indicators (3)
        severe_patterns = [
            r'\b(always|constantly|every day|all the time)\b',
            r'\b(terrible|awful|horrible|extremely|very much)\b',
            r'\b(can\'t stop|unable to|impossible)\b'
        ]
        
        # Moderate indicators (2)
        moderate_patterns = [
            r'\b(often|frequently|most days|usually)\b',
            r'\b(quite a bit|a lot|pretty much|mostly)\b'
        ]
        
        # Mild indicators (1)
        mild_patterns = [
            r'\b(sometimes|occasionally|once in a while|few times)\b',
            r'\b(a little|slightly|somewhat|kind of)\b'
        ]
        
        # Check patterns in order of severity
        for pattern in severe_patterns:
            if re.search(pattern, message_lower):
                return 3
                
        for pattern in moderate_patterns:
            if re.search(pattern, message_lower):
                return 2
                
        for pattern in mild_patterns:
            if re.search(pattern, message_lower):
                return 1
                
        for pattern in negative_patterns:
            if re.search(pattern, message_lower):
                return 0
        
        # Default to mild if unclear
        return 1

    def analyze_sentiment(self, message):
        """
        Simple sentiment analysis for empathetic responses
        """
        message_lower = message.lower()
        
        negative_words = [
            'sad', 'depressed', 'anxious', 'worried', 'scared', 'afraid', 'angry',
            'frustrated', 'overwhelmed', 'tired', 'exhausted', 'hopeless', 'lonely',
            'stressed', 'difficult', 'hard', 'terrible', 'awful', 'bad', 'worse'
        ]
        
        positive_words = [
            'good', 'great', 'fine', 'okay', 'better', 'happy', 'glad', 'pleased',
            'comfortable', 'relaxed', 'calm', 'peaceful', 'confident', 'strong'
        ]
        
        negative_count = sum(1 for word in negative_words if word in message_lower)
        positive_count = sum(1 for word in positive_words if word in message_lower)
        
        if negative_count > positive_count:
            return 'negative'
        elif positive_count > negative_count:
            return 'positive'
        else:
            return 'neutral'

    def extract_age(self, message):
        """
        Extract age from user message
        """
        age_match = re.search(r'\b(\d{1,2})\b', message)
        if age_match:
            age = int(age_match.group(1))
            if 4 <= age <= 100:
                return age
        return 25  # Default age

    def get_next_question(self, topic_index, empathy_response, prediction_insight):
        """
        Get the next question in the conversation flow
        """
        questions = [
            "Now, during these past two weeks, have you been feeling down, sad, or hopeless? It's completely normal to have these feelings sometimes.",
            "How has your sleep been lately? Are you having trouble falling asleep, staying asleep, or maybe sleeping too much?",
            "Speaking of energy, have you been feeling more tired than usual or having less energy to do things?",
            "How about your appetite? Have you noticed any changes in how much you want to eat or your relationship with food?",
            "Have you been having negative thoughts about yourself lately? Feeling like you've let yourself or others down?",
            "Have you noticed any trouble concentrating on things like work, reading, or watching TV?",
            "Let's talk about anxiety - have you been feeling nervous, anxious, or on edge recently?",
            "When you do start worrying about things, do you find it hard to stop or control those worried thoughts?",
            "Do you find yourself worrying too much about different things in your life?",
            "Have you been having trouble relaxing or finding it hard to sit still?",
            "Have you been feeling more irritable than usual, or getting annoyed or angry more easily?",
            "Have you been feeling afraid that something awful might happen?",
            "This next question is important - have you had any thoughts about death or hurting yourself? Please know that if you're having these thoughts, you're not alone and help is available.",
            "Have you been feeling overwhelmed by your daily responsibilities or life in general?",
            "Have you been feeling jumpy or easily startled by sounds or movements?",
            "Have you lost interest in activities or things that used to bring you joy?",
            "Have you been experiencing mood swings or feeling like your emotions change quickly?",
            "Last question - how difficult has it been for you to handle daily responsibilities and stress lately?"
        ]
        
        if topic_index - 2 < len(questions):
            return f"{empathy_response}{questions[topic_index - 2]}{prediction_insight}"
        else:
            return f"{empathy_response}Thank you so much for sharing all of that with me. You've been really brave and open. Let me analyze everything you've told me and provide you with some insights and recommendations. 🌟"


class ChatHistoryView(APIView):
    """
    Get chat session history
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, session_id=None):
        try:
            if session_id:
                # Get specific session
                try:
                    session = ChatSession.objects.get(id=session_id, user=request.user)
                    messages = ChatMessage.objects.filter(session=session).order_by('created_at')
                    
                    return Response({
                        'session': {
                            'id': session.id,
                            'created_at': session.created_at,
                            'updated_at': session.updated_at
                        },
                        'messages': [
                            {
                                'id': msg.id,
                                'sender': msg.sender,
                                'content': msg.content,
                                'created_at': msg.created_at,
                                'metadata': msg.metadata
                            } for msg in messages
                        ]
                    })
                except ChatSession.DoesNotExist:
                    return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)
            else:
                # Get all sessions for user
                sessions = ChatSession.objects.filter(user=request.user).order_by('-updated_at')
                
                return Response({
                    'sessions': [
                        {
                            'id': session.id,
                            'created_at': session.created_at,
                            'updated_at': session.updated_at,
                            'message_count': session.messages.count()
                        } for session in sessions
                    ]
                })
                
        except Exception as e:
            logger.exception(f"Chat history error: {e}")
            return Response({
                'error': 'Failed to load chat history',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)