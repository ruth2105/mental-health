# payments/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from django.conf import settings
from .models import Payment
from appointments.models import Appointment
from users.models import User
import uuid

# Try to import notification service, but don't fail if not available
try:
    from notifications.services import NotificationService
    NOTIFICATIONS_AVAILABLE = True
except ImportError:
    NOTIFICATIONS_AVAILABLE = False

# -----------------------------
# 🔹 Admin Payment Management
# -----------------------------
class AdminPaymentListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Check if user is admin/staff
        if not (request.user.is_staff or request.user.is_superuser or getattr(request.user, 'role', None) == 'admin'):
            return Response(
                {"error": "Admin access required"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get all payments with user info
        payments = Payment.objects.select_related('user').order_by('-created_at')
        
        # Add pagination
        page_size = int(request.GET.get('page_size', 20))
        page = int(request.GET.get('page', 1))
        start = (page - 1) * page_size
        end = start + page_size
        
        payment_data = []
        for payment in payments[start:end]:
            payment_data.append({
                'id': payment.id,
                'reference': payment.reference,
                'user_email': payment.user.email,
                'user_name': payment.user.full_name or payment.user.email,
                'amount': float(payment.amount),
                'currency': payment.currency,
                'status': payment.status,
                'payment_method': payment.payment_method,
                'chapa_tx_ref': payment.chapa_tx_ref,
                'checkout_url': payment.checkout_url,
                'created_at': payment.created_at.isoformat(),
                'updated_at': payment.updated_at.isoformat(),
            })
        
        return Response({
            'payments': payment_data,
            'total': payments.count(),
            'page': page,
            'page_size': page_size,
            'has_next': end < payments.count()
        })

class AdminPaymentStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Check if user is admin/staff
        if not (request.user.is_staff or request.user.is_superuser or getattr(request.user, 'role', None) == 'admin'):
            return Response(
                {"error": "Admin access required"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        from django.db.models import Sum, Count
        from datetime import datetime, timedelta
        
        try:
            # Get payment statistics
            total_payments = Payment.objects.count()
            successful_payments = Payment.objects.filter(status='success').count()
            pending_payments = Payment.objects.filter(status='pending').count()
            failed_payments = Payment.objects.filter(status='failed').count()
            
            # Revenue statistics
            total_revenue = Payment.objects.filter(status='success').aggregate(
                total=Sum('amount')
            )['total'] or 0
            
            # This month's revenue
            this_month = datetime.now().replace(day=1)
            monthly_revenue = Payment.objects.filter(
                status='success',
                created_at__gte=this_month
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            # Recent payments (last 7 days)
            week_ago = datetime.now() - timedelta(days=7)
            recent_payments = Payment.objects.filter(
                created_at__gte=week_ago
            ).count()
            
            return Response({
                'total_payments': total_payments,
                'successful_payments': successful_payments,
                'pending_payments': pending_payments,
                'failed_payments': failed_payments,
                'total_revenue': float(total_revenue),
                'monthly_revenue': float(monthly_revenue),
                'recent_payments': recent_payments,
                'success_rate': round((successful_payments / total_payments * 100) if total_payments > 0 else 0, 2)
            })
        except Exception as e:
            return Response({
                'error': 'Failed to load payment statistics',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# -----------------------------
# 🔹 Initiate Payment
# -----------------------------
class ChapaInitiatePaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        amount = request.data.get("amount")
        currency = request.data.get("currency", "ETB")
        appointment_id = request.data.get("appointment_id")

        # Validation
        if not amount:
            return Response(
                {"error": "amount field is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get appointment if provided
        appointment = None
        if appointment_id:
            try:
                appointment = Appointment.objects.get(id=appointment_id, patient=user)
            except Appointment.DoesNotExist:
                return Response(
                    {"error": "Appointment not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

        # Generate a unique reference
        reference = str(uuid.uuid4())

        # Create Payment record WITHOUT appointment field (works without migration)
        payment = Payment.objects.create(
            user=user,
            amount=amount,
            currency=currency,
            reference=reference,
            status="pending"
        )

        # Check if we should use demo mode or real Chapa
        use_demo_mode = getattr(settings, 'CHAPA_DEMO_MODE', True)
        has_real_keys = not ('your-test-secret-key-here' in settings.CHAPA_SECRET_KEY)
        
        if use_demo_mode or not has_real_keys:
            # SIMULATE CHAPA REDIRECT: Return our test checkout URL
            test_checkout_url = f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')}/test/chapa-checkout?tx_ref={reference}&amount={amount}&merchant=6469390"
            
            # Update payment with simulated Chapa details
            payment.chapa_tx_ref = reference
            payment.checkout_url = test_checkout_url
            payment.save()
            
            return Response({
                "message": "Payment initialized (Test Mode)",
                "payment_reference": reference,
                "checkout_url": test_checkout_url,
                "status": "pending",
                "appointment_id": appointment.id if appointment else None
            }, status=status.HTTP_201_CREATED)
        
        else:
            # REAL CHAPA INTEGRATION
            from .chapa_client import chapa_client
            
            # Get user details
            first_name = user.full_name.split()[0] if user.full_name else user.email.split('@')[0]
            last_name = user.full_name.split()[-1] if user.full_name and len(user.full_name.split()) > 1 else 'User'
            
            # Initialize Chapa payment
            chapa_response = chapa_client.initialize_payment(
                amount=amount,
                email=user.email,
                first_name=first_name,
                last_name=last_name,
                tx_ref=reference,
                return_url=f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')}/payment/success?ref={reference}",
                callback_url=f"{request.build_absolute_uri('/api/payments/webhook/')}"
            )
            
            if chapa_response['success']:
                # Update payment with Chapa details
                payment.chapa_tx_ref = reference
                payment.checkout_url = chapa_response['checkout_url']
                payment.save()
                
                return Response({
                    "message": "Payment initialized",
                    "payment_reference": reference,
                    "checkout_url": chapa_response['checkout_url'],
                    "status": "pending",
                    "appointment_id": appointment.id if appointment else None
                }, status=status.HTTP_201_CREATED)
            else:
                # Chapa initialization failed
                payment.status = "failed"
                payment.save()
                
                return Response({
                    "error": "Payment initialization failed",
                    "details": chapa_response.get('error', 'Unknown error')
                }, status=status.HTTP_400_BAD_REQUEST)


# -----------------------------
# 🔹 Webhook
# -----------------------------
class ChapaWebhookView(APIView):
    permission_classes = [permissions.AllowAny]  # Chapa server posts without token

    def post(self, request):
        event = request.data.get("event")
        data = request.data.get("data")

        if not event or not data:
            return Response(
                {"error": "Invalid webhook payload"},
                status=status.HTTP_400_BAD_REQUEST
            )

        reference = data.get("reference")
        status_str = data.get("status")

        if not reference:
            return Response({"error": "Missing payment reference"}, status=400)

        # Update payment status
        try:
            payment = Payment.objects.get(reference=reference)
            payment.status = status_str
            payment.save()
            
            # If payment successful, mark appointment as paid (if field exists)
            if status_str == "success" and hasattr(payment, 'appointment') and payment.appointment:
                payment.appointment.paid = True
                payment.appointment.status = "Scheduled"
                payment.appointment.save()
                
                # Send notification if available
                if NOTIFICATIONS_AVAILABLE:
                    try:
                        NotificationService.create_notification(
                            user=payment.user,
                            notification_type='appointment_confirmed',
                            title='Appointment Confirmed',
                            message=f'Your appointment has been confirmed.',
                            related_appointment=payment.appointment
                        )
                    except Exception as e:
                        print(f"Failed to send notification: {e}")
                    
        except Payment.DoesNotExist:
            return Response({"error": "Payment not found"}, status=404)

        return Response({"message": "Webhook received successfully"}, status=200)


class PaymentVerifyView(APIView):
    """Verify payment status"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        reference = request.data.get('reference')
        if not reference:
            return Response(
                {"error": "reference is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            payment = Payment.objects.get(reference=reference, user=request.user)
            # In production, verify with Chapa API here
            return Response({
                "reference": payment.reference,
                "status": payment.status,
                "amount": payment.amount,
                "currency": payment.currency
            })
        except Payment.DoesNotExist:
            return Response(
                {"error": "Payment not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class PaymentHistoryView(APIView):
    """Get user's payment history"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        # Get payments without appointment relationship (works without migration)
        payments = Payment.objects.filter(user=request.user).order_by('-created_at')
        data = [{
            "id": p.id,
            "reference": p.reference,
            "amount": str(p.amount),
            "currency": p.currency,
            "status": p.status,
            "created_at": p.created_at,
            "appointment": None  # Will add this after migration
        } for p in payments]
        
        return Response(data)






