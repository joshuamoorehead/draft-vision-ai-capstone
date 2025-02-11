from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import (
    PlayerProfile, NCAATeams, TeamSuccess, PassingLeaders, UserProfile
)
from .serializers import (
    PlayerProfileSerializer, NCAATeamsSerializer, TeamSuccessSerializer, 
    PassingLeadersSerializer, UserProfileSerializer
)

# Player List API
class PlayerList(APIView):
    def get(self, request):
        players = PlayerProfile.objects.all()
        serializer = PlayerProfileSerializer(players, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = PlayerProfileSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

# NCAA Teams API
class NCAATeamsList(APIView):
    def get(self, request):
        teams = NCAATeams.objects.all()
        serializer = NCAATeamsSerializer(teams, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = NCAATeamsSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

# Team Success API (previously YearlyNCAATeamDataList)
class TeamSuccessList(APIView):
    def get(self, request):
        data = TeamSuccess.objects.all()
        serializer = TeamSuccessSerializer(data, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = TeamSuccessSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

# Passing Leaders API
class PassingLeadersList(APIView):
    def get(self, request):
        data = PassingLeaders.objects.all()
        serializer = PassingLeadersSerializer(data, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = PassingLeadersSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

# User Profile API
class UserProfileList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        user_profile, created = UserProfile.objects.get_or_create(user_id=user.id, email=user.email)
        serializer = UserProfileSerializer(user_profile)
        return Response(serializer.data)

    def post(self, request):
        serializer = UserProfileSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
