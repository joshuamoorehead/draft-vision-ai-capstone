from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from .models import PlayerProfile, NCAATeams
from .serializers import PlayerProfileSerializer, NCAATeamsSerializer


# Create your tests here.

class PlayerAPITest(APITestCase):
    def setUp(self):
        #Create test player with name position and college filled out, all other parameters default
        self.player = PlayerProfile.objects.create(
            name="Joe Football", 
            school="LSU", 
            position="QB",)

    def test_player_creation(self):
        player = PlayerProfile.objects.get(name="Joe Football")
        self.assertEqual(player.school, "LSU")
        self.assertEqual(player.position, "QB")

    def test_filter_position(self):
        quarterbacks = PlayerProfile.objects.filter(position="QB")
        self.assertEqual(quarterbacks.count(),1)
        self.assertEqual(quarterbacks.first().name, "Joe Football")

    def test_filter_team(self):
        LSU_team = PlayerProfile.objects.filter(team="LSU")
        self.assertEqual(LSU_team.count(), 1)
        self.assertEqual(LSU_team.first().name, "Joe Football")