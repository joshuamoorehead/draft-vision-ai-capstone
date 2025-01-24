from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
#TODO same problem with .models, dont need for POC
from ..core.models import Team,TeamYear,DraftInfo, Player, PassingStats, RushingStats, ReceivingStats
from ..core.serializers import TeamSerializer, TeamYearSerializer, DraftInfoSerializer, PlayerSerializer, PassingStatsSerializer, RushingStatsSerializer, ReceivingStatsSerializer
from ..services.ml_model.prospect_analyzer import analyze_current_prospects


# Create your tests here.

class PlayerAPITest(APITestCase):
    def setUp(self):
        #Create test player with name position and college filled out, all other parameters default
        Player.objects.create(name="Joe Football", college="LSU", position="QB")

    #def test_listing(self):

    #def test_search_name(self):

    #def test_filter_position(self):

    #TODO dont think we need testing for initial POC

    
