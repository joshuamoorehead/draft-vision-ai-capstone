from rest_framework import serializers
import pandas as pd
from .models import (
    PlayerProfile, NCAATeams, TeamSuccess, PassingLeaders, Conferences, 
    Coaches, DefensivePositionalStats, RBStats, RECStats, TeamOffense, 
    TeamDefense, TeamRatings, HistoricalTeamSuccess, UserProfile
)

# Player Profile Serializer
class PlayerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlayerProfile
        fields = '__all__'

# NCAA Teams Serializer
class NCAATeamsSerializer(serializers.ModelSerializer):
    class Meta: 
        model = NCAATeams
        fields = '__all__'

# Team Success Serializer
class TeamSuccessSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamSuccess
        fields = '__all__'

# Passing Leaders Serializer
class PassingLeadersSerializer(serializers.ModelSerializer):
    class Meta:
        model = PassingLeaders
        fields = '__all__'

# User Profile Serializer
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['user_id', 'email', 'saved_mock_drafts', 'watchlist', 'prediction_history']

# Conferences Serializer
class ConferencesSerializer(serializers.ModelSerializer):
    class Meta: 
        model = Conferences
        fields = '__all__'

# Coaches Serializer
class CoachesSerializer(serializers.ModelSerializer):
    class Meta: 
        model = Coaches
        fields = '__all__'

# Defensive Positional Stats Serializer
class DefensivePositionalStatsSerializer(serializers.ModelSerializer):
    class Meta: 
        model = DefensivePositionalStats
        fields = '__all__'

# Running Back Stats Serializer
class RBStatsSerializer(serializers.ModelSerializer):
    class Meta: 
        model = RBStats
        fields = '__all__'

# Receiving Stats Serializer
class RECStatsSerializer(serializers.ModelSerializer):
    class Meta: 
        model = RECStats
        fields = '__all__'

# Team Offense Serializer
class TeamOffenseSerializer(serializers.ModelSerializer):
    class Meta: 
        model = TeamOffense
        fields = '__all__'

# Team Defense Serializer
class TeamDefenseSerializer(serializers.ModelSerializer):
    class Meta: 
        model = TeamDefense
        fields = '__all__'

# Team Ratings Serializer
class TeamRatingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamRatings
        fields = '__all__'

# Historical Team Success Serializer
class HistoricalTeamSuccessSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistoricalTeamSuccess
        fields = '__all__'
