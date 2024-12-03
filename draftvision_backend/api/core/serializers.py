from rest_framework import serializers
from .models import Team, Player, PassingStats, RushingStats, ReceivingStats

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = '__all__'

class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = '__all__'

class PassingStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PassingStats
        fields = '__all__'

class RushingStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = RushingStats
        fields = '__all__'

class ReceivingStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReceivingStats
        fields = '__all__'