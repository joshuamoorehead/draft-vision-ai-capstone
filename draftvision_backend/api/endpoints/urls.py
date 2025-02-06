from django.urls import path, include
from .views import home, prospect_rankings
from rest_framework.routers import DefaultRouter
from .views import TeamViewSet,TeamYearViewSet,DraftInfoViewSet, PlayerViewSet, PassingStatsViewSet, RushingStatsViewSet, ReceivingStatsViewSet, ApiRootView
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
    TeamYearListView,
    DraftInfoListView,
)
router = DefaultRouter()
router.register(r'teams', TeamViewSet)
router.register(r'players', PlayerViewSet)
#router.register(r'team-year', TeamYearViewSet, basename='teamyear') #Double team year view set?
#router.register(r'draft-info', DraftInfoViewSet, basename='draftinfo') #Double draft info view set?
router.register(r'passing-stats', PassingStatsViewSet)
router.register(r'rushing-stats', RushingStatsViewSet)
router.register(r'receiving-stats', ReceivingStatsViewSet)

urlpatterns = [
    path('', ApiRootView.as_view(), name='api-root'),
    path('teams/', TeamListView.as_view(), name='team-list'),
    path('players/', PlayerListView.as_view(), name='player-list'),
    path('passing-stats/', PassingStatsListView.as_view(), name='passing-stats-list'),
    path('rushing-stats/', RushingStatsListView.as_view(), name='rushing-stats-list'),
    path('receiving-stats/', ReceivingStatsListView.as_view(), name='receiving-stats-list'),
    path('draft-info/',DraftInfoListView.as_view(),name="draft-info-list"),
    path('team-year/',TeamYearListView.as_view(),name="team-year-list"),
    path('prospect-rankings/', prospect_rankings, name='prospect-rankings'),
]