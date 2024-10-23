from django.shortcuts import render
from .forms import PlayerStatsForm
from .models import NFLPlayer
from math import sqrt

def compare_players(request):
    if request.method == 'POST':
        form = PlayerStatsForm(request.POST)
        if form.is_valid():
            input_stats = form.cleaned_data
            closest_player = None
            min_distance = float('inf')

            for player in NFLPlayer.objects.all():
                # Calculate Euclidean distance between user input and player stats
                distance = sqrt(
                    (input_stats['forty_yard_dash'] - player.forty_yard_dash) ** 2 +
                    (input_stats['vertical_jump'] - player.vertical_jump) ** 2 +
                    (input_stats['broad_jump'] - player.broad_jump) ** 2 +
                    (input_stats['bench'] - player.bench) ** 2 +
                    (input_stats['weight'] - player.weight) ** 2
                )

                if distance < min_distance:
                    min_distance = distance
                    closest_player = player

            return render(request, 'players/result.html', {'closest_player': closest_player})
    else:
        form = PlayerStatsForm()

    return render(request, 'players/comparator.html', {'form': form})
