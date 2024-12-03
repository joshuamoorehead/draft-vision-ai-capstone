from rest_framework.routers import DefaultRouter
from .views import TeamViewSet, PlayerViewSet, PassingStatsViewSet, RushingStatsViewSet, ReceivingStatsViewSet
from .views import (
    TeamViewSet,
    PlayerViewSet,
    PassingStatsViewSet,
    RushingStatsViewSet,
    ReceivingStatsViewSet
)
router = DefaultRouter()
router.register(r'teams', TeamViewSet)
router.register(r'players', PlayerViewSet)
router.register(r'passing-stats', PassingStatsViewSet)
router.register(r'rushing-stats', RushingStatsViewSet)
router.register(r'receiving-stats', ReceivingStatsViewSet)

urlpatterns = router.urls