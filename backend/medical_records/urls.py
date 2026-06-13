from django.urls import path
from django.http import JsonResponse

def health(request):
    return JsonResponse({'medical_records':'ok'})

urlpatterns = [path('', health)]