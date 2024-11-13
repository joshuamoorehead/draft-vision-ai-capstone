from rest_framework import serializers
from .models import *

class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = '__all__'

class CollegeStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CollegeStats
        fields = '__all__'

class NFLTeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = NFLTeam
        fields = '__all__'

class MockDraftPickSerializer(serializers.ModelSerializer):
    player_details = PlayerSerializer(source='player', read_only=True)
    team_details = NFLTeamSerializer(source='team', read_only=True)
    
    class Meta:
        model = MockDraftPick
        fields = ['id', 'pick_number', 'player', 'team', 'ai_analysis', 
                 'player_details', 'team_details']

class MockDraftSerializer(serializers.ModelSerializer):
    picks = MockDraftPickSerializer(many=True, read_only=True)
    
    class Meta:
        model = MockDraft
        fields = ['id', 'user_team', 'created_at', 'completed', 'grade', 'picks']

class DraftPredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DraftPrediction
        fields = '__all__'
