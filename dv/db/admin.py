from django.contrib import admin
from .models import PlayerProfile, NCAATeams, YearlyNCAATeamData, PassingLeaders

# Register your models here.
admin.site.register(PlayerProfile)
admin.site.register(NCAATeams)
admin.site.register(YearlyNCAATeamData)
admin.site.register(PassingLeaders)