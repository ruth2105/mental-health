"""
Therapist Earnings Management
Handles earnings tracking and payout requests
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Count, Avg
from django.utils import timezone
from datetime import datetime, timedelta
from decimal import Decimal


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def therapist_earnings_stats(request):
    """Get therapist earnings statistics"""
    user = request.user
    
    if user.role != 'therapist':
        return Response({"detail": "Therapist access required"}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        from appointments.models import Appointment
        from payments.models import Payment
        
        # Get all completed appointments for this therapist
        completed_appointments = Appointment.objects.filter(
            therapist=user,
            status='Completed',
            paid=True
        )
        
        # Calculate total earnings (80% of payment goes to therapist)
        total_payments = Payment.objects.filter(
            appointment__therapist=user,
            status='completed'
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        total_earnings = float(total_payments) * 0.8  # 80% to therapist
        
        # This month earnings
        first_day_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        this_month_payments = Payment.objects.filter(
            appointment__therapist=user,
            status='completed',
            created_at__gte=first_day_month
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        this_month_earnings = float(this_month_payments) * 0.8
        
        # Pending payout (earnings not yet requested)
        from .models import PayoutRequest
        paid_out = PayoutRequest.objects.filter(
            therapist=user,
            status__in=['approved', 'completed']
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        pending_payout = total_earnings - float(paid_out)
        
        # Session stats
        completed_sessions = completed_appointments.count()
        average_per_session = total_earnings / completed_sessions if completed_sessions > 0 else 0
        
        return Response({
            "total_earnings": total_earnings,
            "this_month": this_month_earnings,
            "pending_payout": max(0, pending_payout),
            "completed_sessions": completed_sessions,
            "average_per_session": average_per_session
        })
        
    except Exception as e:
        return Response({
            "total_earnings": 0,
            "this_month": 0,
            "pending_payout": 0,
            "completed_sessions": 0,
            "average_per_session": 0
        })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def therapist_transactions(request):
    """Get therapist transaction history"""
    user = request.user
    
    if user.role != 'therapist':
        return Response({"detail": "Therapist access required"}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        from payments.models import Payment
        
        payments = Payment.objects.filter(
            appointment__therapist=user
        ).select_related('appointment__patient').order_by('-created_at')
        
        transactions = []
        for payment in payments:
            therapist_amount = float(payment.amount) * 0.8  # 80% to therapist
            transactions.append({
                "id": payment.id,
                "appointment_id": payment.appointment.id,
                "patient_name": payment.appointment.patient.full_name or payment.appointment.patient.email,
                "amount": therapist_amount,
                "date": payment.created_at,
                "status": payment.status
            })
        
        return Response(transactions)
        
    except Exception as e:
        return Response([])


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def therapist_payout_requests(request):
    """Get therapist payout requests"""
    user = request.user
    
    if user.role != 'therapist':
        return Response({"detail": "Therapist access required"}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        from .models import PayoutRequest
        
        payouts = PayoutRequest.objects.filter(
            therapist=user
        ).order_by('-requested_at')
        
        payout_data = []
        for payout in payouts:
            payout_data.append({
                "id": payout.id,
                "amount": float(payout.amount),
                "status": payout.status,
                "requested_at": payout.requested_at,
                "processed_at": payout.processed_at
            })
        
        return Response(payout_data)
        
    except Exception as e:
        return Response([])


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_payout(request):
    """Request a payout"""
    user = request.user
    
    if user.role != 'therapist':
        return Response({"detail": "Therapist access required"}, status=status.HTTP_403_FORBIDDEN)
    
    amount = request.data.get('amount')
    bank_details = request.data.get('bank_details')
    
    if not amount or float(amount) <= 0:
        return Response({"detail": "Invalid amount"}, status=status.HTTP_400_BAD_REQUEST)
    
    if not bank_details:
        return Response({"detail": "Bank details required"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        from .models import PayoutRequest
        
        # Create payout request
        payout = PayoutRequest.objects.create(
            therapist=user,
            amount=Decimal(str(amount)),
            bank_details=bank_details,
            status='pending'
        )
        
        # Send notification to admin
        try:
            from notifications.services import NotificationService
            NotificationService.create_notification(
                user=user,  # Will be sent to admins
                notification_type='payout_request',
                title='New Payout Request',
                message=f'Therapist {user.full_name} requested payout of ${amount}',
                related_object_type='payout',
                related_object_id=payout.id
            )
        except:
            pass
        
        return Response({
            "message": "Payout request submitted successfully",
            "payout_id": payout.id,
            "status": payout.status
        })
        
    except Exception as e:
        return Response(
            {"detail": f"Failed to create payout request: {str(e)}"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
