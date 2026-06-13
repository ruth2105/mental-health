from django.urls import path
from .views import CommunityHealth

urlpatterns = [path('health/', CommunityHealth.as_view(), name='community-health')]