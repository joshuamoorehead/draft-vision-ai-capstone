import os 
import django 
import json 
import pandas as pd 
import sys
import csv
from django.db.models import Q

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))) #resolved module not found error 


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "dv.settings")
django.setup()

from db.models import PlayerProfile, NCAATeams, YearlyNCAATeamData, PassingLeaders

def populate_db():
    with open('./data/fullplayerlist.json', 'r') as file:
        data = json.load(file)
        for row in data:
            player = {
                'name': row.get('name', None), 
                'position': row.get('position', None),
                'school': row.get('school', None), 
                'years_ncaa': row.get('years_ncaa', None), 
            }
            player, created = PlayerProfile.objects.get_or_create(
                name = player['name'],
                school = player['school'],
                defaults={
                    'position': player['position'],
                    'years_ncaa': player['years_ncaa'],
                },
            )
            if created:
                print(f'{player.name} created!')
            else:
                print(f'{player.name} already exists')

def is_valid_num(value):
    try:
        num = float(value)
        if num.is_integer():
            return int(num)
        else:
            print('failed integer')
    except (ValueError, TypeError):
        print(f'invalid input')
        return None

def fix_av():
    directory = './data/av/'
    year = 2016
    for filename in os.listdir(directory):
        if filename != 'cantuse':
            path = os.path.join(directory, filename)
            print(path)
            with open(path, 'r') as file:
                players = json.load(file)
                # link player in json to player in DB. 
                for player in players:
                    try: 
                        playername = player['name']
                        db_player = PlayerProfile.objects.get(name=playername)
                        draft_round = player.get('draft_round', 0)
                        if draft_round == 'N/A':
                            draft_round = None
                        draft_pick = player.get('draft_pick', 0)

                        career_av = player['career_av']
                        if player['career_av'] == '':
                            career_av = 0
                        
                        try:
                            db_player.career_av = career_av
                        except:
                            db_player.career_av = 0
                        
                        db_player.year_drafted = year
                        db_player.draft_round = draft_round
                        db_player.draft_pick = draft_pick
                        db_player.save()
                    except (PlayerProfile.DoesNotExist, PlayerProfile.MultipleObjectsReturned):
                        continue
            year += 1

def populate_av():
    directory = './data/av/'
    year = 2016
    id = 2
    while year < 2025:
        path = os.path.join(directory, f'{year}.json')
        with open(path, 'r') as file:
            players = json.load(file)
            for player in players:
                db_player = PlayerProfile.objects.get(id=id)
                # draft_round = is_valid_num(player.get('draft_round', None))
                # draft_pick = is_valid_num(player.get('draft_pick', None))
                draft_round = player.get('draft_round', 0)
                if draft_round == 'N/A':
                    draft_round = None
                draft_pick = player.get('draft_pick', 0)

                career_av = player['career_av']
                if player['career_av'] == '':
                    career_av = 0
                
                try:
                    db_player.career_av = career_av
                except:
                    db_player.career_av = 0
                
                db_player.year_drafted = year
                db_player.draft_round = draft_round
                db_player.draft_pick = draft_pick
                db_player.save()
                id += 1
        year += 1

def populate_ncaa_teams():
    directory = './data/conferences'
    conferences = ['acc', 'big10', 'big12', 'pac', 'sec']
    i = 0
    for filename in os.listdir(directory):
        filepath = os.path.join(directory, filename)
        print(filepath)
        with open(filepath, 'r', encoding='utf-8') as file:
            # conference = pd.read_csv(filepath)
            conference = csv.DictReader(file)
            print(conferences[i])
            for row in conference:
                # print(row)
                team = {
                    'team_name': row['School'], 
                    'conference': conferences[i]
                }
                team, created = NCAATeams.objects.get_or_create(
                    team_name = team['team_name'], 
                    conference = team['conference']
                )
                if created:
                    print(f'team created!')
                else:
                    print('failure uploading team')
        i += 1
            

def populate_yearly_team_data():
    directory = './data/yearlyteamdata/'
    year_ = 2015
    for filename in os.listdir(directory):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r') as file:
            year = csv.DictReader(file)
            for row in year:
                print(row.items())
                team, created = YearlyNCAATeamData.objects.get_or_create(
                    teamid = row.get('School', None) if row.get('School') else None,
                    year = year_ if year_ else None,
                    AP_Finish = row.get('ï»¿Rk', None) if row.get('ï»¿Rk') else None,
                    wins = row.get('W', None) if row.get('W') else None,
                    losses = row.get('L', None) if row.get('L') else None,
                    SRS = row.get('SRS', None) if row.get('SRS') else None,
                    SOS = row.get('SOS', None) if row.get('SOS') else None,
                    PPG = row.get('Off', None) if row.get('Off') else None,
                    Opp_PPG = row.get('Def', None) if row.get('Def') else None,

                )
                if created:
                    print(f'{team.teamid} in {team.year} created successfully')
                else:
                    print('error created row')
        year_ += 1 


def populate_passing_stats():
    directory = './data/passingstats/'
    year_ = 2015
    for filename in os.listdir(directory):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as file: 
            year = csv.DictReader(file)
            for row in year: 
                found_player = False 
                try:
                    p_name = row.get("Player").replace('*', '')
                    player_profile = PlayerProfile.objects.get(
                        Q(name=p_name) & Q(position='QB')
                    )
                    found_player = True 
                except PlayerProfile.DoesNotExist:
                    continue
                
                if found_player:
                    player, created = PassingLeaders.objects.get_or_create(
                        playerid = player_profile, 
                        year = year_, 
                        team = row.get('Team', None) if row.get('Team') else None, 
                        conference = row.get("Conf", None) if row.get("Conf") else None, 
                        games = row.get("G", None) if row.get("G") else None, 
                        cmp = row.get("Cmp", None) if row.get("Cmp") else None, 
                        att = row.get("Att", None) if row.get("Att") else None, 
                        comp_pct = row.get("Cmp%", None) if row.get("Cmp%") else None, 
                        yds = row.get("Yds", None) if row.get("Yds") else None, 
                        td = row.get("TD", None) if row.get("TD") else None, 
                        td_pct = row.get("TD%", None) if row.get("TD%") else None, 
                        int = row.get("Int", None) if row.get("Int") else None, 
                        int_pct = row.get("Int%", None) if row.get("Int%") else None, 
                        adj_yds = row.get("Y/A", None) if row.get("Y/A") else None, 
                        adj_yds_att = row.get("AY/A", None) if row.get("AY/A") else None, 
                        yds_carr = row.get("Y/C", None) if row.get("Y/C") else None, 
                        yds_g = row.get("Y/G", None) if row.get("Y/G") else None, 
                        ratings = row.get("Rate", None) if row.get("Rate") else None, 
                        awards = row.get("Awards", None) if row.get("Awards") else None
                    )
                    if created:
                        print(f'{player.playerid} in year {player.year} created')
                    else:
                        print('error making player')
            year_ += 1



# populate_db()
# populate_av()
# populate_ncaa_teams()
# populate_yearly_team_data()
# populate_passing_stats()
fix_av()