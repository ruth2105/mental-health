from django.db import models
from django.conf import settings
from django.core.validators import MinLengthValidator, MaxLengthValidator

class Testimonial(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    RATING_CHOICES = [
        (1, '1 Star'),
        (2, '2 Stars'),
        (3, '3 Stars'),
        (4, '4 Stars'),
        (5, '5 Stars'),
    ]
    
    # User who submitted the testimonial
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='testimonials')
    
    # Testimonial content
    title = models.CharField(
        max_length=200,
        validators=[MinLengthValidator(10)],
        help_text="Brief title for your testimonial"
    )
    content = models.TextField(
        validators=[MinLengthValidator(50), MaxLengthValidator(1000)],
        help_text="Share your experience (50-1000 characters)"
    )
    rating = models.IntegerField(
        choices=RATING_CHOICES,
        help_text="Rate your overall experience"
    )
    
    # Optional fields
    display_name = models.CharField(
        max_length=100,
        blank=True,
        help_text="Name to display publicly (leave blank to use 'Anonymous')"
    )
    location = models.CharField(
        max_length=100,
        blank=True,
        help_text="Your city/location (optional)"
    )
    
    # Admin moderation
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    admin_notes = models.TextField(
        blank=True,
        help_text="Internal notes for admin use"
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_testimonials'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Display settings
    is_featured = models.BooleanField(
        default=False,
        help_text="Show this testimonial prominently"
    )
    display_order = models.IntegerField(
        default=0,
        help_text="Order for displaying testimonials (higher numbers first)"
    )
    
    class Meta:
        ordering = ['-is_featured', '-display_order', '-created_at']
        indexes = [
            models.Index(fields=['status', 'is_featured']),
            models.Index(fields=['rating', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.get_display_name()} - {self.title[:50]}"
    
    def get_display_name(self):
        """Get the name to display publicly"""
        if self.display_name.strip():
            return self.display_name
        return "Anonymous"
    
    def get_star_display(self):
        """Get star rating as string"""
        return "★" * self.rating + "☆" * (5 - self.rating)
    
    @property
    def is_approved(self):
        return self.status == 'approved'
    
    @property
    def is_pending(self):
        return self.status == 'pending'
    
    @property
    def is_rejected(self):
        return self.status == 'rejected'