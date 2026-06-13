from django.contrib import admin
from .models import User, PatientProfile, DoctorProfile

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'role', 'is_staff', 'is_active')
    search_fields = ('email',)
    list_filter = ('role', 'is_staff', 'is_active')

@admin.register(PatientProfile)
class PatientProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'age', 'gender', 'condition')
    search_fields = ('user__email',)
    list_filter = ('gender',)

@admin.register(DoctorProfile)
class DoctorProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'specialization', 'rating', 'price')
    search_fields = ('user__email', 'specialization')
    list_filter = ('specialization',)
