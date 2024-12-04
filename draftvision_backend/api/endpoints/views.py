from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Team, Player, PassingStats, RushingStats, ReceivingStats
from .serializers import (
    TeamSerializer,
    PlayerSerializer,
    PassingStatsSerializer,
    RushingStatsSerializer,
    ReceivingStatsSerializer,
)

class TeamListView(APIView):
    def get(self, request):
        teams = Team.objects.all()
        serializer = TeamSerializer(teams, many=True)
        return Response(serializer.data)

class PlayerListView(APIView):
    def get(self, request):
        players = Player.objects.all()
        serializer = PlayerSerializer(players, many=True)
        return Response(serializer.data)

class PassingStatsListView(APIView):
    def get(self, request):
        passing_stats = PassingStats.objects.all()
        serializer = PassingStatsSerializer(passing_stats, many=True)
        return Response(serializer.data)

class RushingStatsListView(APIView):
    def get(self, request):
        rushing_stats = RushingStats.objects.all()
        serializer = RushingStatsSerializer(rushing_stats, many=True)
        return Response(serializer.data)

class ReceivingStatsListView(APIView):
    def get(self, request):
        receiving_stats = ReceivingStats.objects.all()
        serializer = ReceivingStatsSerializer(receiving_stats, many=True)
        return Response(serializer.data)

        