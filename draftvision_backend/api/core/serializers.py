from rest_framework import serializers
from .models import Team, TeamYear, DraftInfo, Player, PassingStats, RushingStats, ReceivingStats

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = '__all__'
# Serializer for TeamYear
class TeamYearSerializer(serializers.ModelSerializer):
    team_name = serializers.CharField(source='team.name', read_only=True)  # Include team name

    class Meta:
        model = TeamYear
        fields = '__all__'
class PlayerSerializer(serializers.ModelSerializer):
    draft_info = serializers.SerializerMethodField()
    passing_stats = serializers.SerializerMethodField()
    rushing_stats = serializers.SerializerMethodField()
    receiving_stats = serializers.SerializerMethodField()

    class Meta:
        model = Player
        fields = '__all__'

    def get_draft_info(self, obj):
        draft_info = obj.draft_info.first()
        return DraftInfoSerializer(draft_info).data if draft_info else None

    def get_passing_stats(self, obj):
        stats = obj.passing_stats.all()
        return PassingStatsSerializer(stats, many=True).data

    def get_rushing_stats(self, obj):
        stats = obj.rushing_stats.all()
        return RushingStatsSerializer(stats, many=True).data

    def get_receiving_stats(self, obj):
        stats = obj.receiving_stats.all()
        return ReceivingStatsSerializer(stats, many=True).data
# Serializer for DraftInfo
class DraftInfoSerializer(serializers.ModelSerializer):
    player_name = serializers.CharField(source='player.name', read_only=True)

    class Meta:
        model = DraftInfo
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