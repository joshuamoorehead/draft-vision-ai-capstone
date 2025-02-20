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
    pass
    players = PlayerProfile.objects.all()
    for p in players:
        print(p.school)
    # for school in schools:
    #     id = school.id
    #     instances = PlayerProfile.objects.filter(school=school.team_name)
    #     if instances.exists():
    #         instances.update(schoolid_id=school.id)
        
    

if __name__ == '__main__': 
    clean_player_profile()