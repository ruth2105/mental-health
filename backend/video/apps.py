from django.apps import AppConfig


class VideoConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'video'
    verbose_name = 'Video / Realtime Sessions'

    def ready(self):
        # Place for app startup hooks if needed
        pass
 