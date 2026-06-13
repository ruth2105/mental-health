from django.contrib import admin
from django.urls import path, include, re_path
from django.http import JsonResponse, FileResponse
from django.views.generic import RedirectView
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
import os

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

def serve_react(request, path=''):
    """Serve the React app's index.html for all non-API routes (SPA routing)."""
    index_path = os.path.join(settings.STATICFILES_DIRS[0] if hasattr(settings, 'STATICFILES_DIRS') and settings.STATICFILES_DIRS else settings.STATIC_ROOT, 'frontend', 'index.html')
    # Try staticfiles/frontend/index.html
    index_path = os.path.join(settings.BASE_DIR, 'staticfiles', 'frontend', 'index.html')
    if os.path.exists(index_path):
        with open(index_path, 'rb') as f:
            return FileResponse(f, content_type='text/html')
    # Fallback for dev: redirect to Vite dev server
    from django.http import HttpResponseRedirect
    return HttpResponseRedirect('http://localhost:5173/')

urlpatterns = [
    path('admin/', admin.site.urls),

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

    # Serve React frontend for all other routes (must be last)
    re_path(r'^(?!api/|admin/|static/|media/).*$', serve_react),
]

# Add token endpoints only if Simple JWT is available
if TokenObtainPairView is not None and TokenRefreshView is not None:
    try:
        from users.views import LoginView
        token_obtain_view = LoginView.as_view()
    except Exception:
        token_obtain_view = TokenObtainPairView.as_view()

    urlpatterns.insert(-1, path('api/auth/token/', token_obtain_view, name='token_obtain_pair'))
    urlpatterns.insert(-1, path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'))
else:
    urlpatterns.insert(-1, path('api/auth/token/', RedirectView.as_view(url='/api/users/login/', permanent=False)))
    urlpatterns.insert(-1, path('api/auth/token/refresh/', RedirectView.as_view(url='/api/users/login/', permanent=False)))

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
