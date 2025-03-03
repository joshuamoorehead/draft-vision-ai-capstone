import requests
from django.http import JsonResponse
from rest_framework.views import APIView
from django.conf import settings

SUPABASE_AUTH_URL = f"{settings.SUPABASE_URL}/auth/v1"

class SignupAPIView(APIView):
    """
    Handles user signup using Supabase authentication.
    """
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return JsonResponse({"error": "Email and password are required"}, status=400)

        headers = {
            "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
            "Content-Type": "application/json"
        }

        data = {
            "email": email,
            "password": password,
            "data": {"email_confirmed": True}  # Forces email confirmation
        }

        response = requests.post(f"{SUPABASE_AUTH_URL}/signup", json=data, headers=headers)

        if response.status_code == 200:
            return JsonResponse({"message": "Signup successful! You can now log in."})
        else:
            return JsonResponse(response.json(), status=response.status_code)

class LoginAPIView(APIView):
    """
    Handles user login using Supabase authentication.
    """
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return JsonResponse({"error": "Email and password are required"}, status=400)

        headers = {
            "apikey": settings.SUPABASE_KEY,  # Use anon key, not service role
            "Content-Type": "application/json"
        }

        data = {
            "email": email,
            "password": password
        }

        response = requests.post(f"{SUPABASE_AUTH_URL}/token?grant_type=password", json=data, headers=headers)

        if response.status_code == 200:
            return JsonResponse(response.json())  # Returns JWT token
        else:
            return JsonResponse(response.json(), status=response.status_code)


class VerifyEmailAPIView(APIView):
    """
    Verifies a user's email after Supabase sends them a verification link.
    """
    def post(self, request):
        access_token = request.data.get("access_token")

        if not access_token:
            return JsonResponse({"error": "Access token is required"}, status=400)

        headers = {
            "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }

        response = requests.get(f"{SUPABASE_AUTH_URL}/user", headers=headers)

        if response.status_code == 200:
            return JsonResponse({"message": "Email successfully verified!"})
        else:
            return JsonResponse(response.json(), status=response.status_code)
