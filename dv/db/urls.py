from django.urls import path
from .views import PlayerList, NCAATeamsList, YearlyNCAATeamDataList, PassingLeadersList

urlpatterns = [
    path('players/', PlayerList.as_view(), name='player-list'),
    path('ncaateams/', NCAATeamsList.as_view(), name='ncaateams-list'),
    path('ncaateam_yearly_data/', YearlyNCAATeamDataList.as_view(), name='ncaateams-yearly-data-list'),
    path('passing_leaders/', PassingLeadersList.as_view(), name='passing-leaders-list')
]