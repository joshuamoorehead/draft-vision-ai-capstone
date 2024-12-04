from django.urls import path, include

from rest_framework.routers import DefaultRouter
from .views import (
    TeamViewSet,
    PlayerViewSet,
    PassingStatsViewSet,
    RushingStatsViewSet,
    ReceivingStatsViewSet,
    TeamYearViewSet,
    DraftInfoViewSet,
    ApiRootView,
    

)
router = DefaultRouter()
router.register(r'teams', TeamViewSet)
router.register(r'draft-info', DraftInfoViewSet, basename='draftinfo')
router.register(r'team-years', TeamYearViewSet, basename='teamyear')
router.register(r'players', PlayerViewSet)
router.register(r'passing-stats', PassingStatsViewSet)
router.register(r'rushing-stats', RushingStatsViewSet)
router.register(r'receiving-stats', ReceivingStatsViewSet)

urlpatterns = [ 
      path('', include(router.urls)),  # Include all router-generated URLs
]