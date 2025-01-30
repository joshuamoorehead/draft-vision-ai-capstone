from rest_framework import serializers 
import pandas as pd 
from .models import PlayerProfile, NCAATeams, YearlyNCAATeamData, PassingLeaders, UserProfile

class PlayerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlayerProfile
        fields = '__all__'

class NCAATeamsSerializer(serializers.ModelSerializer):
    class Meta: 
        model = NCAATeams
        fields = '__all__'

class YearlyNCAATeamDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = YearlyNCAATeamData
        fields = '__all__'

class PassingLeadersSerializer(serializers.ModelSerializer):
    class Meta:
        model = PassingLeaders
        fields = '__all__'

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['user_id', 'email', 'saved_mock_drafts', 'watchlist', 'prediction_history']