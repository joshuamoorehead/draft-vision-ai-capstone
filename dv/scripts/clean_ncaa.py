import pandas as pd 
import django
import sys 
import os
import numpy as np 
from django.db.models import Q
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "dv.settings")
django.setup()
from db.models import NCAATeams, PlayerProfile


def clean_player_profile():
    # objective: update all player profiles to have a "school_id" foreign key which is the id of their school in NCAATeams    
    # schools = NCAATeams.objects.all()
    schools = []
    # for school in schools:
    #     instances = PlayerProfile.objects.filter(school=school.team_name)
    #     if instances.exists():
    #         instances.update(schoolid_id=school.id)
    
    links = {
        'Miami': 'Miami (FL)', 'Pittsburgh': 'Pitt', 'App State': 'Appalachian State', 'UL Monroe': 'Louisiana-Monroe',  'Southern Miss': 'Southern Mississippi', 'UConn': 'Connecticut', "Hawai'i": "Hawaii", 'Arizone St.': "Arizona State", 'Mississippi St.': "Mississippi State", 'Ohio St.': "Ohio State", 'Penn St.': "Penn State", 'Boise St.': "Boise State", 'Iowa St.': "Iowa State", 'San Jose St.': "San Jose State", "Kansas St.": "Kansas State", 'Florida St.': "Florida State", "Tennessee St.": "Tennessee State", 'North Carolina St.': "North Carolina State", 'Virginia St.': "Virginia State", 'Washington St.': 'Washington State', 'Mississippi': 'Ole Miss', 'Central Florida': 'UCF'
    }

    players = PlayerProfile.objects.all()
    i = 0 
    for player in players:
        if player.schoolid == None:
            if player.school in links.keys():
                try:
                    team = NCAATeams.objects.get(team_name=links[player.school])
                    player.schoolid = team
                    player.save()
                    print(f'player added successfully from {links[player.school]}')
                except: 
                    print(f'Error adding from {player.school}')

if __name__ == '__main__': 
    clean_player_profile()