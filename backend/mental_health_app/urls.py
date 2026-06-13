from django.urls import path
from .views import PredictView, RecommendView, QuestionnaireView
from .chat_ai_views import ChatAIView, ChatHistoryView

urlpatterns = [
    path('questionnaire/', QuestionnaireView.as_view(), name='get-questionnaire'),
    path('predict/', PredictView.as_view(), name='ai-predict'),
    path('recommend/', RecommendView.as_view(), name='therapist-recommend'),
    
    # Chat AI endpoints
    path('chat/', ChatAIView.as_view(), name='chat-ai'),
    path('chat/history/', ChatHistoryView.as_view(), name='chat-history'),
    path('chat/history/<int:session_id>/', ChatHistoryView.as_view(), name='chat-history-detail'),
]