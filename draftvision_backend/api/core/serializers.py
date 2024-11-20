from rest_framework import serializers
from .models import Player, PlayerDetail

class PlayerDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlayerDetail
        fields = ['biography', 'stats_json', 'rankings_json', 'scheme_fit', 'best_performance']

class PlayerSerializer(serializers.ModelSerializer):
    details = PlayerDetailSerializer(read_only=True)
    
    class Meta:
        model = Player
        fields = ['id', 'name', 'college', 'position', 'player_rating', 'image_url', 'year', 'details']
