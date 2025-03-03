from rest_framework import serializers
from .models import (
    PlayerProfile, NCAATeams, TeamSuccess, PassingLeaders, 
    Conferences, Coaches, DefensivePositionalStats, RBStats, 
    RECStats, TeamOffense, TeamDefense, TeamRatings, HistoricalTeamSuccess
)

class PlayerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlayerProfile
        fields = '__all__'

class NCAATeamsSerializer(serializers.ModelSerializer):
    class Meta: 
        model = NCAATeams
        fields = '__all__'

class TeamSuccessSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamSuccess
        fields = '__all__'

class PassingLeadersSerializer(serializers.ModelSerializer):
    class Meta:
        model = PassingLeaders
        fields = '__all__'

class ConferencesSerializer(serializers.ModelSerializer):  # Fixed typo
    class Meta: 
        model = Conferences
        fields = '__all__'

class CoachesSerializer(serializers.ModelSerializer):
    class Meta: 
        model = Coaches
        fields = '__all__'

class DefensivePositionalStatsSerializer(serializers.ModelSerializer):
    class Meta: 
        model = DefensivePositionalStats
        fields = '__all__'

class RBStatsSerializer(serializers.ModelSerializer):
    class Meta: 
        model = RBStats
        fields = '__all__'

class RECStatsSerializer(serializers.ModelSerializer):  # Fixed typo
    class Meta: 
        model = RECStats
        fields = '__all__'

class TeamOffenseSerializer(serializers.ModelSerializer):
    class Meta: 
        model = TeamOffense
        fields = '__all__'

class TeamDefenseSerializer(serializers.ModelSerializer):
    class Meta: 
        model = TeamDefense
        fields = '__all__'

class TeamRatingsSerializer(serializers.ModelSerializer):  # Fixed typo
    class Meta:
        model = TeamRatings
        fields = '__all__'

class HistoricalTeamSuccessSerializer(serializers.ModelSerializer):  # Fixed typo
    class Meta:
        model = HistoricalTeamSuccess
        fields = '__all__'
