from rest_framework import serializers
from .models import Team,TeamYear,DraftInfo, Player, PassingStats, RushingStats, ReceivingStats

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = '__all__'

class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = '__all__'

class PassingStatsSerializer(serializers.ModelSerializer):
    player_name = serializers.CharField(source='player.name', read_only=True)
    team_name = serializers.CharField(source='team_year.team.name', read_only=True)

    class Meta:
        model = PassingStats
        fields = '__all__'

class RushingStatsSerializer(serializers.ModelSerializer):
    player_name = serializers.CharField(source='player.name', read_only=True)
    team_name = serializers.CharField(source='team_year.team.name', read_only=True)

    class Meta:
        model = RushingStats
        fields = '__all__'

class ReceivingStatsSerializer(serializers.ModelSerializer):
    player_name = serializers.CharField(source='player.name', read_only=True)
    team_name = serializers.CharField(source='team_year.team.name', read_only=True)

    class Meta:
        model = ReceivingStats
        fields = '__all__'

class TeamYearSerializer(serializers.ModelSerializer):
    team_name = serializers.CharField(source='team.name', read_only=True)

    class Meta:
        model = TeamYear
        fields = '__all__'
class DraftInfoSerializer(serializers.ModelSerializer):
    player_name = serializers.CharField(source='player.name', read_only=True)

    class Meta:
        model = DraftInfo
        fields = '__all__'