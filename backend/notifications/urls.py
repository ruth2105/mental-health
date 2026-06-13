from django.urls import path
from .views import (
    NotifyTest,
    NotificationListView,
    NotificationUnreadCountView,
    NotificationMarkReadView,
    NotificationMarkAllReadView,
    NotificationPreferencesView
)

urlpatterns = [
    path('test/', NotifyTest.as_view(), name='notify-test'),
    path('', NotificationListView.as_view(), name='notification-list'),
    path('unread-count/', NotificationUnreadCountView.as_view(), name='notification-unread-count'),
    path('<int:notification_id>/read/', NotificationMarkReadView.as_view(), name='notification-mark-read'),
    path('mark-all-read/', NotificationMarkAllReadView.as_view(), name='notification-mark-all-read'),
    path('preferences/', NotificationPreferencesView.as_view(), name='notification-preferences'),
]
