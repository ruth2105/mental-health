from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.views.generic import RedirectView
from django.conf import settings
from django.conf.urls.static import static

# Try to import Simple JWT token views; leave None if not installed
TokenObtainPairView = None
TokenRefreshView = None
try:
    from rest_framework_simplejwt.views import (
        TokenObtainPairView,
        TokenRefreshView,
    )
except Exception:
    TokenObtainPairView = None
    TokenRefreshView = None

def api_root(request):
    base = request.build_absolute_uri('/')[:-1]
    return JsonResponse({
        "users": f"{base}/api/users/",
        "mental_health": f"{base}/api/mental_health/",
        "appointments": f"{base}/api/appointments/",
        "payments": f"{base}/api/payments/",
        "community": f"{base}/api/community/",
        "notifications": f"{base}/api/notifications/",
        "testimonials": f"{base}/api/testimonials/",
        "token_obtain_pair": f"{base}/api/auth/token/",
        "token_refresh": f"{base}/api/auth/token/refresh/",
    })

urlpatterns = [
    path('admin/', admin.site.urls),

    # During local development redirect root to the frontend dev server (adjust port if needed)
    # Default frontend dev server runs on Vite's port 5173 in this project; change if you run on a different port.
    path('', RedirectView.as_view(url='http://localhost:5173/', permanent=False)),

    # API root and app includes
    path('api/', api_root, name='api_root'),
    path('api/users/', include('users.urls')),
    path('api/mental_health/', include('mental_health_app.urls')),
    path('api/appointments/', include('appointments.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/community/', include('community.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/video/', include('video.urls')),
    path('api/chat/', include('chat.urls')),
    path('api/testimonials/', include('testimonials.urls')),
]

# Add token endpoints only if Simple JWT is available
if TokenObtainPairView is not None and TokenRefreshView is not None:
    # Prefer to use the project's users.LoginView (which may wire a custom
    # serializer accepting `email`) if available. Fall back to the default
    # TokenObtainPairView when not.
    try:
        from users.views import LoginView
        token_obtain_view = LoginView.as_view()
    except Exception:
        token_obtain_view = TokenObtainPairView.as_view()

    urlpatterns += [
        path('api/auth/token/', token_obtain_view, name='token_obtain_pair'),
        path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    ]
else:
    # Fallback: point token paths to the users login URL to avoid import errors
    urlpatterns += [
        path('api/auth/token/', RedirectView.as_view(url='/api/users/login/', permanent=False)),
        path('api/auth/token/refresh/', RedirectView.as_view(url='/api/users/login/', permanent=False)),
    ]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
