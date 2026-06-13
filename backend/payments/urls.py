from django.urls import path

# Import clean payment views
from .payment_views import (
    PaymentInitiateView,
    PaymentVerifyView,
    PaymentHistoryView,
    ChapaWebhookView
)

# Import admin views from original views
from .views import (
    AdminPaymentListView,
    AdminPaymentStatsView
)

urlpatterns = [
    # Clean payment endpoints
    path('initiate/', PaymentInitiateView.as_view(), name='payment-initiate'),
    path('verify/', PaymentVerifyView.as_view(), name='payment-verify'),
    path('history/', PaymentHistoryView.as_view(), name='payment-history'),
    path('webhook/', ChapaWebhookView.as_view(), name='chapa-webhook'),
    
    # Admin endpoints
    path('admin/list/', AdminPaymentListView.as_view(), name='admin-payment-list'),
    path('admin/stats/', AdminPaymentStatsView.as_view(), name='admin-payment-stats'),
]
