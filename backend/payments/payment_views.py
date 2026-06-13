"""
Clean Payment Views
Professional payment handling with proper error management
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from django.conf import settings
from decimal import Decimal
import uuid
import logging

from .models import Payment
from .chapa_service import chapa_service
from users.models import User

logger = logging.getLogger(__name__)

class PaymentInitiateView(APIView):
    """
    Initialize payment with Chapa
    Clean, robust implementation
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            user = request.user
            
            # Extract and validate data
            amount = request.data.get("amount")
            currency = request.data.get("currency", "ETB")
            appointment_id = request.data.get("appointment_id")
            
            # Validation
            if not amount:
                return Response(
                    {"error": "Amount is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                amount = Decimal(str(amount))
                if amount <= 0:
                    raise ValueError("Amount must be positive")
            except (ValueError, TypeError):
                return Response(
                    {"error": "Invalid amount format"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Generate payment reference
            payment_reference = str(uuid.uuid4())
            
            # Create payment record
            payment = Payment.objects.create(
                user=user,
                amount=amount,
                currency=currency,
                reference=payment_reference,
                status="pending",
                payment_method="chapa"
            )
            
            logger.info(f"Created payment record: {payment_reference} for user {user.email}")
            
            # Get user details for Chapa
            first_name = user.full_name.split()[0] if user.full_name else user.email.split('@')[0]
            last_name = user.full_name.split()[-1] if user.full_name and len(user.full_name.split()) > 1 else 'User'
            
            # Initialize payment with Chapa
            chapa_result = chapa_service.initialize_payment(
                amount=amount,
                email=user.email,
                first_name=first_name,
                last_name=last_name,
                description=f"Mental Health Session - {amount} ETB",
                return_url=f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')}/payment/success?ref={payment_reference}"
            )
            
            if chapa_result['success']:
                # Update payment with Chapa details
                payment.chapa_tx_ref = chapa_result['tx_ref']
                payment.checkout_url = chapa_result['checkout_url']
                payment.payment_data = chapa_result['data']
                payment.save()
                
                logger.info(f"Payment initialized with Chapa: {chapa_result['tx_ref']}")
                
                return Response({
                    "success": True,
                    "message": "Payment initialized successfully",
                    "payment_reference": payment_reference,
                    "chapa_tx_ref": chapa_result['tx_ref'],
                    "checkout_url": chapa_result['checkout_url'],
                    "status": "pending",
                    "amount": float(amount),
                    "currency": currency
                }, status=status.HTTP_201_CREATED)
            
            else:
                # Update payment status to failed
                payment.status = "failed"
                payment.payment_data = chapa_result
                payment.save()
                
                logger.error(f"Chapa payment initialization failed: {chapa_result.get('error')}")
                
                return Response({
                    "success": False,
                    "error": "Payment initialization failed",
                    "details": chapa_result.get('error', 'Unknown error'),
                    "payment_reference": payment_reference
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Unexpected error in payment initiation: {str(e)}")
            return Response({
                "success": False,
                "error": "An unexpected error occurred",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PaymentVerifyView(APIView):
    """
    Verify payment status with Chapa
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            tx_ref = request.data.get("tx_ref")
            payment_reference = request.data.get("payment_reference")
            
            if not tx_ref and not payment_reference:
                return Response(
                    {"error": "Transaction reference or payment reference is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Find payment record
            payment = None
            if payment_reference:
                try:
                    payment = Payment.objects.get(reference=payment_reference, user=request.user)
                    tx_ref = payment.chapa_tx_ref
                except Payment.DoesNotExist:
                    return Response(
                        {"error": "Payment not found"},
                        status=status.HTTP_404_NOT_FOUND
                    )
            
            # If we have a payment record but no Chapa tx_ref, return the payment status
            if payment and not tx_ref:
                # If payment is successful, confirm any pending appointment
                if payment.status == 'success':
                    self._confirm_pending_appointment(request.user, payment)
                
                return Response({
                    "success": True,
                    "status": payment.status,
                    "amount": float(payment.amount),
                    "currency": payment.currency,
                    "tx_ref": payment.chapa_tx_ref,
                    "reference": payment.reference,
                    "message": "Payment status from local record"
                })
            
            if not tx_ref:
                return Response(
                    {"error": "No transaction reference available"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Verify with Chapa
            verification_result = chapa_service.verify_payment(tx_ref)
            
            if verification_result['success']:
                # Update payment status if we have a payment record
                if payment:
                    payment.status = verification_result['status']
                    if hasattr(payment, 'payment_data') and payment.payment_data:
                        payment.payment_data.update(verification_result['data'])
                    else:
                        payment.payment_data = verification_result['data']
                    payment.save()
                    
                    # If payment is successful, confirm any pending appointment
                    if verification_result['status'] == 'success':
                        self._confirm_pending_appointment(request.user, payment)
                
                return Response({
                    "success": True,
                    "status": verification_result['status'],
                    "amount": float(verification_result['amount']),
                    "currency": verification_result['currency'],
                    "tx_ref": verification_result['tx_ref'],
                    "reference": verification_result.get('reference')
                })
            
            else:
                # If Chapa verification fails but we have a local payment record, return that
                if payment:
                    return Response({
                        "success": True,
                        "status": payment.status,
                        "amount": float(payment.amount),
                        "currency": payment.currency,
                        "tx_ref": payment.chapa_tx_ref,
                        "reference": payment.reference,
                        "message": "Chapa verification failed, returning local status"
                    })
                
                return Response({
                    "success": False,
                    "error": verification_result.get('error', 'Verification failed')
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Error in payment verification: {str(e)}")
            return Response({
                "success": False,
                "error": "Payment verification failed",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _confirm_pending_appointment(self, user, payment):
        """
        Confirm pending appointment after successful payment
        """
        try:
            from appointments.models import Appointment
            
            # Find unpaid appointments for this user (status='Scheduled' and paid=False)
            unpaid_appointments = Appointment.objects.filter(
                patient=user,
                status='Scheduled',
                paid=False
            ).order_by('-id')  # Get most recent first
            
            if unpaid_appointments.exists():
                appointment = unpaid_appointments.first()
                
                # Mark appointment as paid
                appointment.paid = True
                appointment.save()
                
                logger.info(f"Confirmed appointment {appointment.id} for user {user.email} with payment {payment.reference}")
                
                # Send confirmation notification
                try:
                    from notifications.models import Notification
                    Notification.objects.create(
                        recipient=user,
                        title="Appointment Confirmed",
                        message=f"Your therapy session on {appointment.scheduled_time.strftime('%B %d, %Y at %I:%M %p')} has been confirmed and paid.",
                        notification_type="appointment_confirmed",
                        appointment=appointment
                    )
                    
                    # Also notify the therapist
                    Notification.objects.create(
                        recipient=appointment.therapist,
                        title="New Appointment Confirmed",
                        message=f"You have a new confirmed session with {user.full_name or user.email} on {appointment.scheduled_time.strftime('%B %d, %Y at %I:%M %p')}.",
                        notification_type="appointment_confirmed",
                        appointment=appointment
                    )
                except Exception as e:
                    logger.error(f"Failed to send appointment confirmation notifications: {str(e)}")
                
                return appointment
            else:
                logger.warning(f"No unpaid appointments found for user {user.email} after payment {payment.reference}")
                return None
                
        except Exception as e:
            logger.error(f"Error confirming pending appointment: {str(e)}")
            return None


class PaymentHistoryView(APIView):
    """
    Get user's payment history
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            payments = Payment.objects.filter(user=request.user).order_by('-created_at')
            
            payment_data = []
            for payment in payments:
                payment_data.append({
                    'id': payment.id,
                    'reference': payment.reference,
                    'amount': float(payment.amount),
                    'currency': payment.currency,
                    'status': payment.status,
                    'payment_method': payment.payment_method,
                    'chapa_tx_ref': payment.chapa_tx_ref,
                    'checkout_url': payment.checkout_url,
                    'created_at': payment.created_at.isoformat(),
                    'updated_at': payment.updated_at.isoformat()
                })
            
            return Response({
                "success": True,
                "payments": payment_data,
                "total": len(payment_data)
            })
            
        except Exception as e:
            logger.error(f"Error fetching payment history: {str(e)}")
            return Response({
                "success": False,
                "error": "Failed to fetch payment history"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ChapaWebhookView(APIView):
    """
    Handle Chapa webhook notifications
    """
    permission_classes = []  # No authentication for webhooks

    def post(self, request):
        try:
            webhook_data = request.data
            tx_ref = webhook_data.get('tx_ref')
            
            if not tx_ref:
                logger.warning("Webhook received without tx_ref")
                return Response({"status": "error", "message": "Missing tx_ref"})
            
            # Find payment by tx_ref
            try:
                payment = Payment.objects.get(chapa_tx_ref=tx_ref)
            except Payment.DoesNotExist:
                logger.warning(f"Payment not found for tx_ref: {tx_ref}")
                return Response({"status": "error", "message": "Payment not found"})
            
            # Update payment status based on webhook
            webhook_status = webhook_data.get('status', '').lower()
            
            if webhook_status == 'success':
                payment.status = 'success'
            elif webhook_status in ['failed', 'cancelled']:
                payment.status = 'failed'
            
            # Store webhook data
            payment.payment_data.update({
                'webhook_data': webhook_data,
                'webhook_received_at': timezone.now().isoformat()
            })
            payment.save()
            
            logger.info(f"Webhook processed for payment {payment.reference}: {webhook_status}")
            
            return Response({"status": "success", "message": "Webhook processed"})
            
        except Exception as e:
            logger.error(f"Error processing webhook: {str(e)}")
            return Response({"status": "error", "message": "Webhook processing failed"})