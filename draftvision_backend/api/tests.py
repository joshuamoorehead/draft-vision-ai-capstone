from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Player


# Create your tests here.

class PlayerAPITest(APITestCase):
    def setUp(self):
        #Create test player with name position and college filled out, all other parameters default
        Player.objects.create(name="Joe Football", college="LSU", position="QB")

    #def test_listing(self):

    #def test_search_name(self):

    #def test_filter_position(self):

    #TODO dont think we need testing for initial POC

    
