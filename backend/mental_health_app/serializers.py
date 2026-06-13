from rest_framework import serializers
from .models import Prediction

class PredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prediction
        fields = ('id','user','predicted_disorder','raw_input','created_at')
        read_only_fields = ('user','created_at')