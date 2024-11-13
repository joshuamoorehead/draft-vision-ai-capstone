from rest_framework import viewsets, filters
from .models import Player
from .serializers import PlayerSerializer
from rest_framework.decorators import action
from rest_framework.response import Response

class PlayerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Player.objects.all().select_related('details')
    serializer_class = PlayerSerializer
    
    def get_queryset(self):
        queryset = Player.objects.all()
        # Filters matching your UI
        year = self.request.query_params.get('year', None)
        position = self.request.query_params.get('position', None)
        conference = self.request.query_params.get('conference', None)
        team = self.request.query_params.get('team', None)
        
        if year:
            queryset = queryset.filter(year=year)
        if position:
            queryset = queryset.filter(position=position)
        if conference:
            queryset = queryset.filter(college__conference=conference)
        if team:
            queryset = queryset.filter(college=team)
            
        return queryset.order_by('-player_rating')
