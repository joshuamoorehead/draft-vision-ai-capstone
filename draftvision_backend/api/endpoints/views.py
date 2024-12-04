from rest_framework import viewsets, filters
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
#TODO says .models and .serializers cant be found, something to do with folder structure?
from rest_framework.decorators import action
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import render
from ..core.models import Team,TeamYear,DraftInfo, Player, PassingStats, RushingStats, ReceivingStats
from ..core.serializers import TeamYearSerializer, DraftInfoSerializer, TeamSerializer, PlayerSerializer, PassingStatsSerializer, RushingStatsSerializer, ReceivingStatsSerializer
class ApiRootView(APIView):
    def get(self, request, *args, **kwargs):
        return Response({
            "teams": "/api/teams/",
            "team_years": "/api/team-years/",
            "players": "/api/players/",
            "draft_info": "/api/draft-info/",
            "passing_stats": "/api/passing-stats/",
            "rushing_stats": "/api/rushing-stats/",
            "receiving_stats": "/api/receiving-stats/",
        })
class TeamViewSet(ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
class TeamYearViewSet(viewsets.ModelViewSet):
    queryset = TeamYear.objects.all()
    serializer_class = TeamYearSerializer
class DraftInfoViewSet(viewsets.ModelViewSet):
    queryset = DraftInfo.objects.all()
    serializer_class = DraftInfoSerializer
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

