"""
Payout Request Model
For therapist payout management
"""

from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class PayoutRequest(models.Model):
    """Model for therapist payout requests"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
    ]
    
    therapist = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='payout_requests',
        limit_choices_to={'role': 'therapist'}
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    bank_details = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    requested_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    processed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='processed_payouts',
        limit_choices_to={'role': 'admin'}
    )
    
    admin_notes = models.TextField(blank=True)
    transaction_reference = models.CharField(max_length=255, blank=True)
    
    class Meta:
        ordering = ['-requested_at']
        verbose_name = 'Payout Request'
        verbose_name_plural = 'Payout Requests'
    
    def __str__(self):
        return f"Payout Request #{self.id} - {self.therapist.email} - ${self.amount}"
    
    def approve(self, admin_user, transaction_ref=''):
        """Approve payout request"""
        from django.utils import timezone
        self.status = 'approved'
        self.processed_by = admin_user
        self.processed_at = timezone.now()
        self.transaction_reference = transaction_ref
        self.save()
    
    def reject(self, admin_user, reason=''):
        """Reject payout request"""
        from django.utils import timezone
        self.status = 'rejected'
        self.processed_by = admin_user
        self.processed_at = timezone.now()
        self.admin_notes = reason
        self.save()
    
    def complete(self):
        """Mark payout as completed"""
        self.status = 'completed'
        self.save()
