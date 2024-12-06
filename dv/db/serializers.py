from rest_framework import serializers 
import pandas as pd 
from .models import PlayerProfile, NCAATeams, YearlyNCAATeamData, PassingLeaders

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