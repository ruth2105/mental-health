from django.urls import path
from .views import VideoTokenView, VideoStartView, VideoEndView, VideoSessionJoinedView, VideoSessionStatusView, VideoSessionHeartbeatView, VideoSessionPeersView
from .sse_views import VideoSessionSSEView, notify_session_event

app_name = 'video'

urlpatterns = [
    path('token/', VideoTokenView.as_view(), name='token'),
    path('start/', VideoStartView.as_view(), name='start'),
    path('end/', VideoEndView.as_view(), name='end'),
    path('session-joined/', VideoSessionJoinedView.as_view(), name='session-joined'),
    path('session-status/', VideoSessionStatusView.as_view(), name='session-status'),
    path('session-heartbeat/', VideoSessionHeartbeatView.as_view(), name='session-heartbeat'),
    path('session-peers/', VideoSessionPeersView.as_view(), name='session-peers'),
    path('session-events/', VideoSessionSSEView.as_view(), name='session-events'),
    path('notify-event/', notify_session_event, name='notify-event'),
]
