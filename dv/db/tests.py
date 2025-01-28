from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from models import Team,TeamYear,DraftInfo, Player, PassingStats, RushingStats, ReceivingStats
from serializers import TeamSerializer, TeamYearSerializer, DraftInfoSerializer, PlayerSerializer, PassingStatsSerializer, RushingStatsSerializer, ReceivingStatsSerializer


# Create your tests here.

class PlayerAPITest(APITestCase):
    def setUp(self):
        #Create test player with name position and college filled out, all other parameters default
        self.player = Player.objects.create(
            name="Joe Football", 
            college="LSU", 
            position="QB",)

    def test_player_creation(self):
        player = Player.objects.get(name="Joe Football")
        self.assertEqual(player.team, "LSU")
        self.assertEqual(player.position, "QB")

    def test_filter_position(self):
        quarterbacks = Player.objects.filter(position="QB")
        self.assertEqual(quarterbacks.count(),1)
        self.assertEqual(quarterbacks.first().name, "Joe Football")

    def test_filter_team(self):
        LSU_team = Player.objects.filter(team="LSU")
        self.assertEqual(LSU_team.count(), 1)
        self.assertEqual(LSU_team.first().name, "Joe Football")