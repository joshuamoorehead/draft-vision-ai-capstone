from django.urls import path
from .views import home
from rest_framework.routers import DefaultRouter
from .views import TeamViewSet, PlayerViewSet, PassingStatsViewSet, RushingStatsViewSet, ReceivingStatsViewSet
from .views import (
    TeamViewSet,
    PlayerViewSet,
    PassingStatsViewSet,
    RushingStatsViewSet,
    ReceivingStatsViewSet,
    TeamListView,
    PlayerListView,
    PassingStatsListView,
    RushingStatsListView,
    ReceivingStatsListView,
)
router = DefaultRouter()
router.register(r'teams', TeamViewSet)
router.register(r'players', PlayerViewSet)
router.register(r'passing-stats', PassingStatsViewSet)
router.register(r'rushing-stats', RushingStatsViewSet)
router.register(r'receiving-stats', ReceivingStatsViewSet)

urlpatterns = [
    path('', home, name='home'),
     path('teams/', TeamListView.as_view(), name='team-list'),
    path('players/', PlayerListView.as_view(), name='player-list'),
    path('passing-stats/', PassingStatsListView.as_view(), name='passing-stats-list'),
    path('rushing-stats/', RushingStatsListView.as_view(), name='rushing-stats-list'),
    path('receiving-stats/', ReceivingStatsListView.as_view(), name='receiving-stats-list'),
    # Other URL patterns
]