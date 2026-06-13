"""
ASGI config for mental_health_project project.
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
from channels.auth import AuthMiddlewareStack

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

django_asgi_app = get_asgi_application()

from video import routing as video_routing
from notifications import routing as notifications_routing
from chat import routing as chat_routing
from chat.middleware import JWTAuthMiddlewareStack

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AllowedHostsOriginValidator(
        JWTAuthMiddlewareStack(
            URLRouter(
                video_routing.websocket_urlpatterns +
                notifications_routing.websocket_urlpatterns +
                chat_routing.websocket_urlpatterns
            )
        )
    ),
})
