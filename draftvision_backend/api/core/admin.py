from django.contrib import admin
from .models import Player, PlayerDetail

@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = ('name', 'position', 'college', 'player_rating')
    list_filter = ('position', 'year')
    search_fields = ('name', 'college')

@admin.register(PlayerDetail)
class PlayerDetailAdmin(admin.ModelAdmin):
    list_display = ('player', 'scheme_fit')
    search_fields = ('player__name',)
