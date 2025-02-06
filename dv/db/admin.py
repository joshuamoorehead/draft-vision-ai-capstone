from django.contrib import admin
from .models import PlayerProfile, Conferences, NCAATeams, TeamSuccess, PassingLeaders, Coaches, DefensivePositionalStats, RBStats, RECStats, TeamOffense, TeamDefense, TeamRatings, HistoricalTeamSuccess

# Register your models here.
admin.site.register(PlayerProfile)
admin.site.register(Conferences)
admin.site.register(NCAATeams)
admin.site.register(TeamSuccess)
admin.site.register(PassingLeaders)
admin.site.register(Coaches)
admin.site.register(DefensivePositionalStats)
admin.site.register(RBStats)
admin.site.register(RECStats)
admin.site.register(TeamOffense)
admin.site.register(TeamDefense)
admin.site.register(TeamRatings)
admin.site.register(HistoricalTeamSuccess)