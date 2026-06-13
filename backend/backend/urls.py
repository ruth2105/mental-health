from django.contrib import admin
from django.urls import path, include, re_path
from django.http import JsonResponse, HttpResponse
from django.views.generic import RedirectView
from django.conf import settings
from django.conf.urls.static import static
import os

TokenObtainPairView = None
TokenRefreshView = None
try:
    from rest_framework_simplejwt.views import (
        TokenObtainPairView,
        TokenRefreshView,
    )
except Exception:
    pass

def api_root(request):
    base = request.build_absolute_uri('/')[:-1]
    return JsonResponse({
        "users": f"{base}/api/users/",
        "appointments": f"{base}/api/appointments/",
        "payments": f"{base}/api/payments/",
        "token": f"{base}/api/auth/token/",
    })

def serve_react(request, path=''):
    index_path = os.path.join(
        settings.BASE_DIR, 'staticfiles', 'frontend', 'index.html'
    )
    if os.path.exists(index_path):
        with open(index_path, 'r', encoding='utf-8') as f:
            return HttpResponse(f.read(), content_type='text/html')
    return HttpResponse(
        '<h1>App starting up...</h1><p>Please refresh in a moment.</p>',
        content_type='text/html',
        status=200
    )

urlpatterns = [
    path('admin/', admin.site.urls),
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
    re_path(r'^(?!api/|admin/|static/|media/).*$', serve_react),
]

if TokenObtainPairView is not None and TokenRefreshView is not None:
    try:
        from users.views import LoginView
        token_obtain_view = LoginView.as_view()
    except Exception:
        token_obtain_view = TokenObtainPairView.as_view()
    urlpatterns.insert(-1, path('api/auth/token/', token_obtain_view, name='token_obtain_pair'))
    urlpatterns.insert(-1, path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'))

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
