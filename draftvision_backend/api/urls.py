from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'players', PlayerViewSet)
router.register(r'mock-drafts', MockDraftViewSet)
router.register(r'teams', NFLTeamViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
