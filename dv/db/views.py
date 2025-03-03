import requests
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
from .models import PlayerProfile, NCAATeams, TeamSuccess, PassingLeaders, MockDraft
from .serializers import (
    PlayerProfileSerializer, 
    NCAATeamsSerializer, 
    TeamSuccessSerializer, 
    PassingLeadersSerializer, 
    MockDraftSerializer
)

SUPABASE_AUTH_URL = f"{settings.SUPABASE_URL}/auth/v1"

# ✅ Supabase Signup API
class SignupAPIView(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return JsonResponse({"error": "Email and password are required"}, status=400)

        headers = {
            "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
            "Content-Type": "application/json"
        }

        data = {"email": email, "password": password}

        response = requests.post(f"{SUPABASE_AUTH_URL}/signup", json=data, headers=headers)

        if response.status_code == 200:
            return JsonResponse({"message": "Signup successful! You can now log in."})
        else:
            return JsonResponse(response.json(), status=response.status_code)

# ✅ Supabase Login API
class LoginAPIView(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return JsonResponse({"error": "Email and password are required"}, status=400)

        headers = {
            "apikey": settings.SUPABASE_KEY,  # Using anon key
            "Content-Type": "application/json"
        }

        data = {"email": email, "password": password}

        response = requests.post(f"{SUPABASE_AUTH_URL}/token?grant_type=password", json=data, headers=headers)

        if response.status_code == 200:
            return JsonResponse(response.json())  # Returns JWT token
        else:
            return JsonResponse(response.json(), status=response.status_code)

# ✅ Player List API (Original)
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

# ✅ NCAA Teams API (Original)
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

# ✅ Yearly NCAA Team Data API (Original)
class YearlyNCAATeamDataList(APIView):
    def get(self, request):
        data = TeamSuccess.objects.all()
        serializer = TeamSuccessSerializer(data, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = TeamSuccessSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=200)
        return Response(serializer.errors, status=400)

# ✅ Passing Leaders API (Fixed `req` to `request`)
class PassingLeadersList(APIView):
    def get(self, request):  # Fixed parameter name
        data = PassingLeaders.objects.all()
        serializer = PassingLeadersSerializer(data, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = PassingLeadersSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=200)
        return Response(serializer.errors, status=400)

# ✅ MockDraft API (Restored)
class MockDraftView(APIView):
    """
    Handles MockDraft data
    """
    def get(self, request):
        drafts = MockDraft.objects.all()
        serializer = MockDraftSerializer(drafts, many=True)
        return JsonResponse(serializer.data, safe=False)

    def post(self, request):
        serializer = MockDraftSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=201)
        return JsonResponse(serializer.errors, status=400)
