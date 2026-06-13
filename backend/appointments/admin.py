from django.contrib import admin
from . import models


@admin.register(models.Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ['patient', 'therapist', 'scheduled_time', 'paid', 'status']


@admin.register(models.TherapySession)
class TherapySessionAdmin(admin.ModelAdmin):
    list_display = ['patient', 'doctor', 'appointment', 'room_id', 'started', 'ended', 'start_time', 'end_time']
