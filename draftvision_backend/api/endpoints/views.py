from rest_framework import viewsets, filters
from rest_framework import status
#TODO says .models and .serializers cant be found, something to do with folder structure?
from .models import Player
from .serializers import PlayerSerializer
from rest_framework.decorators import action
from rest_framework.decorators import api_view
from rest_framework.response import Response

class PlayerViewSet(viewsets.ReadOnlyModelViewSet):
    #Getting set of all players
    queryset = Player.objects.all().select_related('details')
    serializer_class = PlayerSerializer
    
    def get_queryset(self):
        queryset = Player.objects.all()
        # Filters, need to see with UI how many and what filters we want
        filter_year = self.request.query_params.get('year', None)
        filter_position = self.request.query_params.get('position', None)
        filter_conference = self.request.query_params.get('conference', None)
        filter_team = self.request.query_params.get('team', None)
        
        #Filtering queryset based on what is inputted on site
        if filter_year:
            queryset = queryset.filter(year=filter_year)
        if filter_position:
            queryset = queryset.filter(position=filter_position)
        if filter_conference:
            queryset = queryset.filter(college__conference=filter_conference)
        if filter_team:
            queryset = queryset.filter(college=filter_team)
            
        return queryset.order_by('-player_rating')
    
    #Get player by their id
    def get_player(request, id):
        try:
            #searching the model based on id
            player = Player.objects.get(id=id)
            serializer = PlayerSerializer(player)
            return Response(serializer.data)
        #Exceptions for if id does not exist
        except Player.DoesNotExist:
            return Response({"error": "Player not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    #Search for a player based on name, will be important later for mock draft
    def get_player_named(request):
        try:
            #Trying to get set of players based on if string is contained in the name
            name = request.GET.get('name', '').strip()
            #TODO dont know if this is case insensitive or not
            players = Player.objects.filter(name__icontains=name)
            if players.exists():
                serializer = PlayerSerializer(players, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response({"message": "No players found"}, status=status.HTTP_404_NOT_FOUND)
            #Exceptions
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    #Search for player based on position
    def get_player_position(request):
        try:
            #Current scope for the positions were documenting
            poss_positions = ['QB', 'WR', 'RB']
            position_query = request.GET.get('position', '').strip().upper()

            if position_query not in poss_positions:
                return Response({"error": "Invalid position"}, status=status.HTTP_400_BAD_REQUEST)
            
            players = Player.objects.filter(position=position_query)
            if players.exists():
                serializer = PlayerSerializer(players, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response({"message": "No players found"}, status=status.HTTP_404_NOT_FOUND)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    