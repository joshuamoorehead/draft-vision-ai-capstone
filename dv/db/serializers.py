from rest_framework import serializers 
import pandas as pd 
from .models import PlayerProfile, NCAATeams, TeamSuccess, PassingLeaders, Conferences, Coaches, DefensivePositionalStats, RBStats, RECStats, TeamOffense, TeamDefense, TeamRatings, HistoricalTeamSuccess

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

class ConferencesSerializer(serializers.ModelSerializer):
    class Meta: 
        models = Conferences
        fields = '__all__'

class CoachesSerializer(serializers.ModelSerializer):
    class Meta: 
        models = Coaches
        fields = '__all__'

class DefensivePositionalStatsSerializer(serializers.ModelSerializer):
    class Meta: 
        models = DefensivePositionalStats
        fields = '__all__'

class RBStatsSerializer(serializers.ModelSerializer):
    class Meta: 
        models = RBStats
        fields = '__all__'

class RECStatsSerializers(serializers.ModelSerializer):
    class Meta: 
        models = RECStats
        fields = '__all__'

class TeamOffenseSerializer(serializers.ModelSerializer):
    class Meta: 
        models = TeamOffense
        fields = '__all__'

class TeamDefenseSerializer(serializers.ModelSerializer):
    class Meta: 
        models = TeamDefense
        fields = '__all__'

class TeamRatingsSerializer(serializers.ModelSerializer):
    class Meta:
        models = TeamRatings
        fields = '__all__'

class HistoricalTeamSuccessSerailizer(serializers.ModelSerializer):
    class Meta:
        models = HistoricalTeamSuccess
        fields = '__all__'

