from django.contrib import admin
from .models import Player, Team, TeamYear, DraftInfo, PassingStats, RushingStats, ReceivingStats

@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = ("name", "position", "school", "height", "weight")
    search_fields = ("name", "school", "position")
    list_filter = ("position", "school")

@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)

@admin.register(TeamYear)
class TeamYearAdmin(admin.ModelAdmin):
    list_display = ("team", "year", "sos")
    search_fields = ("team__name", "year")
    list_filter = ("year",)

@admin.register(DraftInfo)
class DraftInfoAdmin(admin.ModelAdmin):
    list_display = ("player", "draft_round", "draft_pick", "draft_av")
    search_fields = ("player__name",)
    list_filter = ("draft_round",)

@admin.register(PassingStats)
class PassingStatsAdmin(admin.ModelAdmin):
    list_display = ("player", "team_year", "year", "completions", "attempts", "yards", "touchdowns", "rating")
    search_fields = ("player__name", "team_year__team__name")
    list_filter = ("year", "team_year__team__name")
    ordering = ("-year", "player__name")

@admin.register(RushingStats)
class RushingStatsAdmin(admin.ModelAdmin):
    list_display = ("player", "team_year", "year", "attempts", "yards", "touchdowns", "yards_per_attempt")
    search_fields = ("player__name", "team_year__team__name")
    list_filter = ("year", "team_year__team__name")
    ordering = ("-year", "player__name")

@admin.register(ReceivingStats)
class ReceivingStatsAdmin(admin.ModelAdmin):
    list_display = ("player", "team_year", "year", "receptions", "yards", "touchdowns", "yards_per_reception")
    search_fields = ("player__name", "team_year__team__name")
    list_filter = ("year", "team_year__team__name")
    ordering = ("-year", "player__name")
