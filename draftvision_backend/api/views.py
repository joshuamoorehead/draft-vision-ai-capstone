from rest_framework import viewsets, filters
from .models import *
from .serializers import *

class PlayerViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'college', 'position']
    
    def get_queryset(self):
        queryset = Player.objects.all()
        position = self.request.query_params.get('position', None)
        college = self.request.query_params.get('college', None)
        year = self.request.query_params.get('year', None)
        
        if position:
            queryset = queryset.filter(position=position)
        if college:
            queryset = queryset.filter(college=college)
        if year:
            queryset = queryset.filter(college_stats__year=year)
            
        return queryset.distinct()

class MockDraftViewSet(viewsets.ModelViewSet):
    queryset = MockDraft.objects.all()
    serializer_class = MockDraftSerializer

class NFLTeamViewSet(viewsets.ModelViewSet):
    queryset = NFLTeam.objects.all()
    serializer_class = NFLTeamSerializer
