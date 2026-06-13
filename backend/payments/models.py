from django.db import models
from django.conf import settings
import uuid

class Payment(models.Model):
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("success", "Success"),
        ("failed", "Failed"),
        ("cancelled", "Cancelled"),
    )
    
    PAYMENT_METHOD_CHOICES = (
        ("chapa", "Chapa"),
        ("bank_transfer", "Bank Transfer"),
        ("mobile_money", "Mobile Money"),
        ("card", "Credit/Debit Card"),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    # appointment field commented out - add after migration
    # appointment = models.ForeignKey(
    #     'appointments.Appointment',
    #     on_delete=models.CASCADE,
    #     related_name='payments',
    #     null=True,
    #     blank=True
    # )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default="ETB")
    reference = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default="chapa")
    
    # Chapa specific fields
    chapa_tx_ref = models.CharField(max_length=100, null=True, blank=True, unique=True)
    chapa_reference = models.CharField(max_length=100, null=True, blank=True)
    checkout_url = models.URLField(null=True, blank=True)
    
    # Additional payment details
    payment_data = models.JSONField(default=dict, blank=True)  # Store additional payment info
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Payment {self.reference} - {self.status}"
    
    def save(self, *args, **kwargs):
        if not self.reference:
            self.reference = f"PAY-{uuid.uuid4().hex[:12].upper()}"
        super().save(*args, **kwargs)


class ChapaWebhook(models.Model):
    """
    Store Chapa webhook events for debugging and audit trail
    """
    tx_ref = models.CharField(max_length=100)
    event_type = models.CharField(max_length=50)
    status = models.CharField(max_length=20)
    amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=10, null=True, blank=True)
    reference = models.CharField(max_length=100, null=True, blank=True)
    
    # Raw webhook data
    raw_data = models.JSONField()
    
    # Processing status
    processed = models.BooleanField(default=False)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Webhook {self.tx_ref} - {self.event_type}"


class TherapistPayout(models.Model):
    """
    Track therapist payouts from completed sessions
    """
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    )
    
    therapist = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='payouts'
    )
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='payouts')
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    platform_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    net_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    
    # Bank details for payout
    bank_name = models.CharField(max_length=100, null=True, blank=True)
    account_number = models.CharField(max_length=50, null=True, blank=True)
    account_name = models.CharField(max_length=100, null=True, blank=True)
    
    # Chapa subaccount ID if using split payments
    subaccount_id = models.CharField(max_length=100, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Payout {self.therapist.email} - {self.amount} ETB"
