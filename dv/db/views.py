from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import PlayerProfile, NCAATeams, YearlyNCAATeamData, PassingLeaders
from .serializers import PlayerProfileSerializer, NCAATeamsSerializer, YearlyNCAATeamDataSerializer, PassingLeadersSerializer

class PlayerList(APIView):
    def get(self, request):
        players = PlayerProfile.objects.all()
        serializer = PlayerProfileSerializer(players, many=True)
        return Response(serializer.data)
    def post(self, request):
        serializer = PlayerProfileSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=200)
        return Response(serializer.errors, status=400)
    
class NCAATeamsList(APIView):
    def get(self, request):
        teams = NCAATeams.objects.all()
        serializer = NCAATeamsSerializer(teams, many=True)
        return Response(serializer.data)
    def post(self, request):
        serializer = NCAATeamsSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=200)
        return Response(serializer.errors, status=400)

class YearlyNCAATeamDataList(APIView):
    def get(self, request):
        data = YearlyNCAATeamData.objects.all()
        serializer = YearlyNCAATeamDataSerializer(data, many=True)
        return Response(serializer.data)
    def post(self, request):
        serializer = YearlyNCAATeamDataSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=200)
        return Response(serializer.errors, status=400)

class PassingLeadersList(APIView):
    def get(self, req):
        data = PassingLeaders.objects.all()
        serializer = PassingLeadersSerializer(data, many=True)
        return Response(serializer.data)
    def post(self, request):
        serializer = PassingLeadersSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=200)
        return Response(serializer.errors, status=400)


