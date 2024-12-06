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
from ..core.serializers import TeamSerializer, TeamYearSerializer, DraftInfoSerializer, PlayerSerializer, PassingStatsSerializer, RushingStatsSerializer, ReceivingStatsSerializer
from ..services.ml_model.prospect_analyzer import analyze_current_prospects
     
class TeamViewSet(ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
class TeamYearViewSet(viewsets.ModelViewSet):
    queryset = TeamYear.objects.all()
    serializer_class = TeamYearSerializer
class DraftInfoViewSet(viewsets.ModelViewSet):
    queryset = DraftInfo.objects.all()
    serializer_class = DraftInfoSerializer
class TeamYearViewSet(viewsets.ModelViewSet):
    queryset = TeamYear.objects.all()
    serializer_class = TeamYearSerializer
class PlayerViewSet(ModelViewSet):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
class DraftInfoViewSet(viewsets.ModelViewSet):
    queryset = DraftInfo.objects.all()
    serializer_class = DraftInfoSerializer
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
class DraftInfoListView(APIView):
    def get(self, request):
        draft_info = DraftInfo.objects.all()
        serializer = DraftInfoSerializer(draft_info, many=True)
        return Response(serializer.data)
class TeamYearListView(APIView):
    def get(self, request):
        team_year = TeamYear.objects.all()
        serializer = TeamYearSerializer(team_year, many=True)
        return Response(serializer.data)
class ReceivingStatsListView(APIView):
    def get(self, request):
        receiving_stats = ReceivingStats.objects.all()
        serializer = ReceivingStatsSerializer(receiving_stats, many=True)
        return Response(serializer.data)
class ApiRootView(APIView):
    def get(self, request, *args, **kwargs):
        return Response({
            "teams": "/api/teams/",
            "players": "/api/players/",
            "team_years": "/api/team-years/",  # Add TeamYear endpoint
            "draft_info": "/api/draft-info/",  # Add DraftInfo endpoint
            "passing_stats": "/api/passing-stats/",
            "rushing_stats": "/api/rushing-stats/",
            "receiving_stats": "/api/receiving-stats/",
        })
    

@api_view(['GET'])
def prospect_rankings(request):
    """
    Get analyzed prospect rankings with optional position filtering
    """
    try:
        position = request.query_params.get('position', None)
        rankings = analyze_current_prospects()
        
        # Apply position filter if specified
        if position and position.upper() in ['QB', 'WR', 'RB']:
            rankings = [r for r in rankings if r['position'] == position.upper()]
            
        return Response({
            'success': True,
            'count': len(rankings),
            'rankings': rankings
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)