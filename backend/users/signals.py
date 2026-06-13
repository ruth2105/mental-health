"""
Signal handlers for automatic profile creation
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, DoctorProfile, PatientProfile


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Automatically create profile when user is created
    """
    if created:
        if instance.role == 'therapist':
            DoctorProfile.objects.get_or_create(user=instance)
            print(f"✅ DoctorProfile created for {instance.email}")
        elif instance.role == 'patient':
            PatientProfile.objects.get_or_create(user=instance)
            print(f"✅ PatientProfile created for {instance.email}")
