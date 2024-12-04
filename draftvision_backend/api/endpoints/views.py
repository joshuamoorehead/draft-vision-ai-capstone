from rest_framework import viewsets, filters
from rest_framework import status
from rest_framework.viewsets import ModelViewSet
#TODO says .models and .serializers cant be found, something to do with folder structure?
from rest_framework.decorators import action
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import render
from ..core.models import Team, Player, PassingStats, RushingStats, ReceivingStats
from ..core.serializers import TeamSerializer, PlayerSerializer, PassingStatsSerializer, RushingStatsSerializer, ReceivingStatsSerializer
     
class TeamViewSet(ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer

class PlayerViewSet(ModelViewSet):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer

class PassingStatsViewSet(ModelViewSet):
    queryset = PassingStats.objects.all()
    serializer_class = PassingStatsSerializer

class RushingStatsViewSet(ModelViewSet):
    queryset = RushingStats.objects.all()
    serializer_class = RushingStatsSerializer

class ReceivingStatsViewSet(ModelViewSet):
    queryset = ReceivingStats.objects.all()
    serializer_class = ReceivingStatsSerializer

def home(request):
    teams = Team.objects.all()
    players = Player.objects.all()
    passing_stats = PassingStats.objects.all()
    rushing_stats = RushingStats.objects.all()
    receiving_stats = ReceivingStats.objects.all()
    context = {
        'teams': teams,
        'players': players,
        'passing_stats': passing_stats,
        'rushing_stats': rushing_stats,
        'receiving_stats': receiving_stats,
    }
    return render(request, 'home.html', context)
            
        