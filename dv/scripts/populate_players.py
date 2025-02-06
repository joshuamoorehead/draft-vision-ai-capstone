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

from db.models import PlayerProfile, NCAATeams, TeamSuccess, PassingLeaders, Conferences, Combine, Coaches, DefensivePositionalStats, RBStats, RECStats, TeamOffense, TeamDefense, TeamRatings, HistoricalTeamSuccess 

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

def fix_ncaa():
    directory = './data/conferences/'
    i = 1 
    for filename in os.listdir(directory):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as file:
            teams = csv.DictReader(file)
            conference = Conferences.objects.get(id=i)
            for team in teams:
                db_team, created = NCAATeams.objects.get_or_create(
                    team_name = team['School'], 
                    conference_id = conference
                )
                if(created):
                    print(f'{db_team.team_name} created successfully')
            i += 1

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
                team, created = TeamSuccess.objects.get_or_create(
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

def populate_defenders():
    directory = './data/defensivestats/'
    outputdir = './data/defensiveplayers/'
    year = 2015
    for filename in os.listdir(directory):
        path = os.path.join(directory, filename)
        players = {} 
        with open(path, 'r') as file:
            current_file = json.load(file)
            for player in current_file: 
                if player['name'] not in players:
                    players[player['name']] = []
                    players[player['name']].append(player)
                    # for key, val in player.items():
                    #     players[player['name']].append({key: val})
                else:
                    # for key, val in player.items():
                    #     players[player['name']].append({key: val}) 
                    data = {'stat_type': player['stat_type'], 'stat': player['stat']}
                    players[player['name']].append(data)
 
        extension = str(year) + '.json'
        path = os.path.join(outputdir, extension)
        with open(path, 'w') as file:
            json.dump(players, file, indent=4)
        year += 1 



def populate_conferences():
    csvfile = './data/conferences.csv'
    with open(csvfile, 'r', encoding='utf-8') as file:
        conferences = csv.DictReader(file)
        for c in conferences:
            # print(c)
            conference_name = c.get('Conference')
            founded = c.get('From')
            to = c.get('To')
            wins = c.get('W')
            losses = c.get('L')
            pct = c.get('Pct')
            bowl_wins = c.get('BW')
            bowl_losses = c.get('BL')
            bowl_pct = c.get('BPct')
            srs = c.get('SRS')
            sos = c.get('SOS')
            ap = c.get('AP')
            conference_, created = Conferences.objects.get_or_create(
                conference = conference_name, 
                founded = founded, 
                to = to, 
                wins = wins, 
                losses = losses, 
                winpct = pct, 
                bowl_wins = bowl_wins, 
                bowl_losses = bowl_losses, 
                bowl_winpct = bowl_pct, 
                SRS = srs, 
                SOS = sos, 
                AP_finishes = ap
            )
            if(created):
                print(f'{conference_.conference} added!')
            else:
                print('error adding conference')
    
def fill_conference_abbv():
    abbreviations = ['ACC', 'American', 'Big 12', 'Big Ten', 'CUSA', 'Ind', 'MAC', 'MWC', 'SEC', "Sun Belt", 'Pac-12']
    i = 1
    while i < 12:
        conference = Conferences.objects.get(id=i)
        conference.abbreviation = abbreviations[i-1]
        i += 1 
        conference.save()
    

def populate_rb():
    directory = './data/rb_leaders/'
    for filename in os.listdir(directory):
        filepath = os.path.join(directory, filename)
        # print(filename[:4])
        with open(filepath, 'r', encoding='utf-8') as file:
            yearlydata = pd.read_csv(file)
            # print(yearlydata.columns)
            for index, player in yearlydata.iterrows():
                # # if the guy wasn't drafted we don't need him in the DB 
                try:
                    print(f'processing {player['Player']}')
                    db_player = PlayerProfile.objects.get(name=player['Player'], position='RB')
                    conference = Conferences.objects.get(abbreviation=player['Conf'])

                    if(NCAATeams.objects.get(team_name = player['Team'])):
                        team = NCAATeams.objects.get(team_name = player['Team'])
                    else:
                        print(f'mismatch: {player['Team']}')   


                except:
                    # print(f'Player {player['Player']} not found')
                    print('did not add to DB')
                    continue 
                
                awards = player.get('Awards', None)
                if pd.isna(awards):
                    awards = None
                rb, created = RBStats.objects.get_or_create(
                    games = player.get('G', None),
                    att = player.get('Att', None), 
                    yds = player.get('Yds', None), 
                    yds_att = player.get('Y/A', None), 
                    rush_td = player.get('TD', None), 
                    rush_ypg = player.get('Y/G', None), 
                    rec = player.get('Rec', None), 
                    rec_yds = player.get('Yds.1', None),
                    ypc = player.get('Y/R', None), 
                    rec_td = player.get('TD.1', None), 
                    rec_ypg = player.get('Y/G.1', None), 
                    snaps = player.get('Plays', None), 
                    tot_yds = player.get('Yds.2', None), 
                    tot_avg = player.get('Avg', None), 
                    tot_td = player.get('TD.2', None), 
                    awards = awards,
                    conference = conference, 
                    playerid = db_player, 
                    team = team, 
                    year = filename[:4]
                )               
                if(created):
                    print(f'{db_player.name} created successfully')
                else:
                    print(f'ERROR creating {player['Player']}')

def populate_rec():
    directory = './data/rec_leaders/'
    for filename in os.listdir(directory):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as file:
            yearlydata = pd.read_csv(file)
            for index, player in yearlydata.iterrows():
                # # if the guy wasn't drafted we don't need him in the DB 
                try:
                    print(f'processing {player['Player']}')
                    db_player = PlayerProfile.objects.get(name=player['Player'], position='WR')
                    conference = Conferences.objects.get(abbreviation=player['Conf'])

                    if(NCAATeams.objects.get(team_name = player['Team'])):
                        team = NCAATeams.objects.get(team_name = player['Team'])
                    else:
                        print(f'mismatch: {player['Team']}')   


                except:
                    # print(f'Player {player['Player']} not found')
                    print('did not add to DB')
                    continue 
                
                awards = player.get('Awards', None)
                if pd.isna(awards):
                    awards = None
                rb, created = RECStats.objects.get_or_create(
                    games = player.get('G', None),
                    att = player.get('Att', None), 
                    yds = player.get('Yds', None), 
                    yds_att = player.get('Y/A', None), 
                    rush_td = player.get('TD', None), 
                    rush_ypg = player.get('Y/G', None), 
                    rec = player.get('Rec', None), 
                    rec_yds = player.get('Yds.1', None),
                    ypc = player.get('Y/R', None), 
                    rec_td = player.get('TD.1', None), 
                    rec_ypg = player.get('Y/G.1', None), 
                    snaps = player.get('Plays', None), 
                    tot_yds = player.get('Yds.2', None), 
                    tot_avg = player.get('Avg', None), 
                    tot_td = player.get('TD.2', None), 
                    awards = awards,
                    conference = conference, 
                    playerid = db_player, 
                    team = team, 
                    year = filename[:4]
                )               
                if(created):
                    print(f'{db_player.name} created successfully')
                else:
                    print(f'ERROR creating {player['Player']}')

# to change: bowling green and TCU
def upload_defensive():
    directory = './data/defensiveplayers/'
    for filename in os.listdir(directory):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as file:
            data = json.load(file)
            for player, stats in data.items():
                name = player 
                print(f'processing {name}')
                team = stats[0]['team']
                categories = {'TFL': 0, 'SACKS': 0, 'QB HUR': 0, 'PD': 0, 'SOLO': 0, 'TD': 0, 'TOT': 0}
                for stat in stats:
                    if stat['stat_type'] in categories.keys(): 
                        categories[stat['stat_type']] += stat['stat']
                try:
                    playerid = PlayerProfile.objects.get(name=name)
                    try:
                        team_ = NCAATeams.objects.get(team_name = team)
                    except:
                        print(f"couldn't find {team}")
                        continue 
                except:
                    print(f'was not able to fetch {name}')
                    continue 
                guy, created = DefensivePositionalStats.objects.get_or_create(
                    year = filename[:4],
                    playerid = playerid, 
                    team = team_,
                    conference = team_.conference_id, 
                    TFL = categories['TFL'], 
                    sacks = categories['SACKS'], 
                    hur = categories['QB HUR'], 
                    pd = categories['PD'], 
                    solo = categories['SOLO'], 
                    td = categories['TD'], 
                    tot = categories['TOT'] 
                )
                if(created):
                    print(f'created {guy.playerid.name} successfully')
                else:
                    print(f'failed to create {name}')

def upload_team_offense():
    directory = './data/teamoffense/'
    for filename in os.listdir(directory):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as file:
            yearlydata = pd.read_csv(file)
            for index, row in yearlydata.iterrows():
                teamid = NCAATeams.objects.get(team_name = row.get('School'))
                team, created = TeamOffense.objects.get_or_create(
                    year = filename[:4], 
                    games = row.get('G', None), 
                    pts = row.get('Pts', None),
                    cmp = row.get('Cmp', None), 
                    pass_att = row.get('Att', None), 
                    comp_pct = row.get('Pct', None), 
                    pass_yds = row.get('Yds', None), 
                    pass_td = row.get('TD', None), 
                    rush_att = row.get('Att.1', None), 
                    rush_yds = row.get('Yds.1', None), 
                    rush_avg = row.get("Avg", None), 
                    rush_td = row.get("TD.1", None), 
                    snaps = row.get("Plays", None), 
                    tot_yds = row.get("Yds.2", None), 
                    avg_yds = row.get("Avg.1", None), 
                    pass_first_downs = row.get("Pass", None),
                    rush_first_downs = row.get("Rush", None), 
                    penalty_first_downs = row.get("Pen", None), 
                    tot_first_downs = row.get("Tot", None), 
                    penalty_count = row.get("No.", None), 
                    penalty_yds = row.get("Yds.3", None), 
                    fumbles_lost = row.get("Fum", None), 
                    interceptions = row.get("Int", None), 
                    total_turnovers = row.get("Tot.1", None), 
                    teamid = teamid 
                )
                if(created):
                    print(f'{teamid.team_name} created successfully!')
                else:
                    print(f'{row.get('School', None)} not added to DB')

def upload_team_defense():
    directory = './data/teamdefense/'
    for filename in os.listdir(directory):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as file:
            yearlydata = pd.read_csv(file)
            for index, row in yearlydata.iterrows():
                teamid = NCAATeams.objects.get(team_name = row.get('School'))
                team, created = TeamDefense.objects.get_or_create(
                    year = filename[:4], 
                    games = row.get('G', None), 
                    pts = row.get('Pts', None),
                    cmp = row.get('Cmp', None), 
                    pass_att = row.get('Att', None), 
                    comp_pct = row.get('Pct', None), 
                    pass_yds = row.get('Yds', None), 
                    pass_td = row.get('TD', None), 
                    rush_att = row.get('Att.1', None), 
                    rush_yds = row.get('Yds.1', None), 
                    rush_avg = row.get("Avg", None), 
                    rush_td = row.get("TD.1", None), 
                    snaps = row.get("Plays", None), 
                    tot_yds = row.get("Yds.2", None), 
                    avg_yds = row.get("Avg.1", None), 
                    pass_first_downs = row.get("Pass", None),
                    rush_first_downs = row.get("Rush", None), 
                    penalty_first_downs = row.get("Pen", None), 
                    tot_first_downs = row.get("Tot", None), 
                    penalty_count = row.get("No.", None), 
                    penalty_yds = row.get("Yds.3", None), 
                    fumbles_rec = row.get("Fum", None), 
                    interceptions = row.get("Int", None), 
                    total_turnovers = row.get("Tot.1", None), 
                    teamid = teamid 
                )
                if(created):
                    print(f'{teamid.team_name} created successfully!')
                else:
                    print(f'{row.get('School', None)} not added to DB')

def upload_ratings():
    directory = './data/ratings/'
    for filename in os.listdir(directory): 
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as file:
            yearlydata = pd.read_csv(file)
            for index, row in yearlydata.iterrows():
                try: 
                    teamid = NCAATeams.objects.get(team_name = row.get("School"))
                    conference = Conferences.objects.get(abbreviation = row.get('Conf'))
                except:
                    print('error in team or conference')
                    continue 
                AP_rank = row.get("AP Rank", None) 
                if pd.isna(AP_rank):
                    AP_rank = None
                team, created = TeamRatings.objects.get_or_create(
                    AP_Rank = AP_rank, 
                    wins = row.get("W", None), 
                    losses = row.get("L", None), 
                    osrs = row.get("OSRS", None), 
                    dsrs = row.get("DSRS", None), 
                    ppg = row.get("Off", None), 
                    opp_ppg = row.get("Def", None), 
                    pass_ypa = row.get("Off.1", None), 
                    opp_pass_ypa = row.get("Def.1", None), 
                    rush_ypa = row.get("Off.2", None), 
                    opp_rush_ypa = row.get("Def.2", None), 
                    tot_ypa = row.get("Off.3", None), 
                    opp_tot_ypa = row.get("Def.3", None), 
                    conference = conference, 
                    team = teamid, 
                    year = filename[:4]
                )
                if(created):
                    print(f'{teamid.team_name} created successfully!')
                else:
                    print(f'error adding {row.get("School")}')

def upload_historical():
    directory = './data/conferences/'
    for filename in os.listdir(directory):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as file:
            conferencedata = pd.read_csv(file)
            for index, row in conferencedata.iterrows():
                name = row.get("School")
                try:
                    teamid = NCAATeams.objects.get(team_name = name)
                except:
                    print(f'unable to find {name}')
                
                bowl_wins = row.get("W.2", None)
                if pd.isna(bowl_wins):
                    bowl_wins = None
                bowl_losses = row.get("L.2")
                if pd.isna(bowl_losses):
                    bowl_losses = None
                AP = row.get("AP", None)
                if pd.isna(AP):
                    AP = None
                CC = row.get("CC", None)
                if pd.isna(CC):
                    CC = None

                team, created = HistoricalTeamSuccess.objects.get_or_create(
                    startyear = row.get('From'),
                    years = int(row.get("To")) - int(row.get("From")),
                    games = row.get("G"), 
                    wins = row.get("W"),
                    losses = row.get("L"),
                    pct = row.get("Pct"),
                    conference_wins = row.get("W.1", None), 
                    conference_losses = row.get("L.1", None),
                    bowl_wins = bowl_wins, 
                    bowl_losses = bowl_losses, 
                    SRS = row.get("SRS", None), 
                    SOS = row.get("SOS", None), 
                    years_in_final_AP = AP, 
                    conference_championships = CC, 
                    team = teamid
                )
                if(created):
                    print(f'{teamid.team_name} created successfully!')
                else:
                    print("Failure uploading" + str(name))

def fix_ratings():
    directory = './data/ratings/'  
    for filename in os.listdir(directory):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as file:
            yearlydata = pd.read_csv(file)
            for index, row in yearlydata.iterrows():
                id = NCAATeams.objects.get(team_name = row.get("School"))
                instance = TeamRatings.objects.get(team=id, year=filename[:4])
                instance.losses = row.get("L")
                instance.save()

# to fix- RB, WR, Defense from select schools, TE
# to fix- update "team" in "passing leaders"
# to fix- update "team" in "teamsuccess"

def fix_RBStats(): 
    # iterate each file again, if a player isn't in the DB, but is in playerprofile, add him to the DB. 
    directory = './data/rb_leaders'
    for filename in os.listdir(directory):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as file: 
            yearlydata = pd.read_csv(file)
            for index, player in yearlydata.iterrows():
                try:
                    print(f'processing {player['Player']}')
                    db_player = PlayerProfile.objects.get(name=player['Player'], position='RB')
                    conference = Conferences.objects.get(abbreviation=player['Conf'])

                    if(NCAATeams.objects.get(team_name = player['Team'])):
                        team = NCAATeams.objects.get(team_name = player['Team'])
                    else:
                        print(f'mismatch: {player['Team']}')   


                except:
                    # print(f'Player {player['Player']} not found')
                    print('did not add to DB')
                    continue 

                try:
                    exists = RBStats.objects.get(year=filename[:4], playerid = db_player)
                except:
                    awards = player.get('Awards', None)
                    if pd.isna(awards):
                        awards = None
                    rb, created = RBStats.objects.get_or_create(
                        games = player.get('G', None),
                        att = player.get('Att', None), 
                        yds = player.get('Yds', None), 
                        yds_att = player.get('Y/A', None), 
                        rush_td = player.get('TD', None), 
                        rush_ypg = player.get('Y/G', None), 
                        rec = player.get('Rec', None), 
                        rec_yds = player.get('Yds.1', None),
                        ypc = player.get('Y/R', None), 
                        rec_td = player.get('TD.1', None), 
                        rec_ypg = player.get('Y/G.1', None), 
                        snaps = player.get('Plays', None), 
                        tot_yds = player.get('Yds.2', None), 
                        tot_avg = player.get('Avg', None), 
                        tot_td = player.get('TD.2', None), 
                        awards = awards,
                        conference = conference, 
                        playerid = db_player, 
                        team = team, 
                        year = filename[:4]
                    )               
                    if(created):
                        print(f'{db_player.name} created successfully')
                    else:
                        print(f'ERROR creating {player['Player']}')

def fix_wr():
    directory = './data/rec_leaders/'
    for filename in os.listdir(directory):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as file:
            yearlydata = pd.read_csv(file)
            for index, player in yearlydata.iterrows():
                # # if the guy wasn't drafted we don't need him in the DB 
                try:
                    print(f'processing {player['Player']}')
                    db_player = PlayerProfile.objects.get(name=player['Player'], position='WR')
                    conference = Conferences.objects.get(abbreviation=player['Conf'])

                    if(NCAATeams.objects.get(team_name = player['Team'])):
                        team = NCAATeams.objects.get(team_name = player['Team'])
                    else:
                        print(f'mismatch: {player['Team']}')   


                except:
                    # print(f'Player {player['Player']} not found')
                    print('did not add to DB')
                    continue 
                
                try:
                    exists = RECStats.objects.get(playerid = db_player, year=filename[:4])
                except:
                    awards = player.get('Awards', None)
                    if pd.isna(awards):
                        awards = None
                    rb, created = RECStats.objects.get_or_create(
                        games = player.get('G', None),
                        rec = player.get('Rec', None),
                        rush_yds = player.get("Yds.1", None),
                        ypc = player.get("Y/R", None), 
                        rush_td = player.get("TD.1", None),
                        rush_ypg = player.get("Y/G.1", None), 
                        att = player.get("Att", None), 
                        yds = player.get("Yds", None), 
                        yds_att = player.get("Y/A", None), 
                        td = player.get("TD", None), 
                        tot_yds = player.get("Yds.2", None),
                        tot_avg = player.get("Avg", None), 
                        tot_td = player.get("TD.2", None),
                        snaps = player.get("Plays", None), 
                        awards = awards,
                        conference = conference, 
                        playerid = db_player, 
                        team = team, 
                        year = filename[:4]   
                    )    
                    if(created):
                        print(f'{db_player.name} created successfully')
                    else:
                        print(f'ERROR creating {player['Player']}')

def add_te():
    directory = './data/rec_leaders/'
    for filename in os.listdir(directory):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as file:
            yearlydata = pd.read_csv(file)
            print(f'processing {filename}')
            for index, player in yearlydata.iterrows():
                # # if the guy wasn't drafted we don't need him in the DB 
                try:
                    # print(f'processing {player['Player']}')
                    db_player = PlayerProfile.objects.get(name=player['Player'], position='TE')
                    conference = Conferences.objects.get(abbreviation=player['Conf'])

                    if(NCAATeams.objects.get(team_name = player['Team'])):
                        team = NCAATeams.objects.get(team_name = player['Team'])
                    # else:
                    #     print(f'mismatch: {player['Team']}')   


                except:
                    # print(f'Player {player['Player']} not found')
                    # print('did not add to DB')
                    continue 
                
                awards = player.get('Awards', None)
                if pd.isna(awards):
                    awards = None
                rb, created = RECStats.objects.get_or_create(
                        games = player.get('G', None),
                        rec = player.get('Rec', None),
                        rush_yds = player.get("Yds.1", None),
                        ypc = player.get("Y/R", None), 
                        rush_td = player.get("TD.1", None),
                        rush_ypg = player.get("Y/G.1", None), 
                        att = player.get("Att", None), 
                        yds = player.get("Yds", None), 
                        yds_att = player.get("Y/A", None), 
                        td = player.get("TD", None), 
                        tot_yds = player.get("Yds.2", None),
                        tot_avg = player.get("Avg", None), 
                        tot_td = player.get("TD.2", None),
                        snaps = player.get("Plays", None), 
                        awards = awards,
                        conference = conference, 
                        playerid = db_player, 
                        team = team, 
                        year = filename[:4]  
                )               
                if(created):
                    print(f'{db_player.name} created successfully')
                else:
                    print(f'ERROR creating {player['Player']}')

def fix_defensive():
    directory = './data/defensiveplayers/'
    for filename in os.listdir(directory):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as file:
            data = json.load(file)
            print(f'processing {filename}')
            for player, stats in data.items():
                name = player 
                team = stats[0]['team']
                categories = {'TFL': 0, 'SACKS': 0, 'QB HUR': 0, 'PD': 0, 'SOLO': 0, 'TD': 0, 'TOT': 0}
                for stat in stats:
                    if stat['stat_type'] in categories.keys(): 
                        categories[stat['stat_type']] += stat['stat']
                try:
                    playerid = PlayerProfile.objects.get(name=name)
                    try:
                        team_ = NCAATeams.objects.get(team_name = team)
                    except:
                        # print(f"couldn't find {team}")
                        continue 
                except:
                    # print(f'was not able to fetch {name}')
                    continue 

                try:
                    exists = DefensivePositionalStats.get(playerid = playerid, year = filename[:4])
                except:
                    guy, created = DefensivePositionalStats.objects.get_or_create(
                        year = filename[:4],
                        playerid = playerid, 
                        team = team_,
                        conference = team_.conference_id, 
                        TFL = categories['TFL'], 
                        sacks = categories['SACKS'], 
                        hur = categories['QB HUR'], 
                        pd = categories['PD'], 
                        solo = categories['SOLO'], 
                        td = categories['TD'], 
                        tot = categories['TOT'] 
                    )
                    if(created):
                        print(f'created {guy.playerid.name} successfully')
                    # else:
                        # print(f'failed to create {name}')

def upload_combine():
    directory = './data/combine/'
    for filename in os.listdir(directory):
        filepath = os.path.join(directory, filename)
        missing_teams = [] 
        with open(filepath, 'r', encoding='utf-8') as file:
            yearlydata = pd.read_csv(file)
            print(f'processing {filepath}')
            for index, row in yearlydata.iterrows():
                if row.get("Drafted (tm/rnd/yr)"):
                    try:
                        playerid = PlayerProfile.objects.get(name=row.get("Player"), year_drafted=filename[:4])
                        school = NCAATeams.objects.get(team_name=row.get("School"))
                        height = row.get("Ht", None)
                        weight = row.get("Wt", None)
                        forty = row.get("40yd", None)
                        vertical = row.get("Vertical", None)
                        bench = row.get("Bench", None)
                        broadjump = row.get("Broad Jump", None)
                        threecone = row.get("3Cone", None)
                        shuttle = row.get("Shuttle")

                        if pd.isna(height):
                            height = None
                        if pd.isna(weight):
                            weight = None 
                        if pd.isna(forty):
                            forty = None
                        if pd.isna(vertical):
                            vertical = None
                        if pd.isna(bench):
                            bench = None
                        if pd.isna(broadjump):
                            broadjump = None
                        if pd.isna(threecone):
                            threecone = None
                        if pd.isna(shuttle):
                            shuttle = None
                        

                        player, created = Combine.objects.get_or_create(
                            playerid = playerid, 
                            school = school, 
                            height = height, 
                            weight = weight, 
                            forty = forty, 
                            vertical = vertical, 
                            bench = bench, 
                            broadjump = broadjump, 
                            threecone = threecone, 
                            shuttle = shuttle
                        )
                        if(created):
                            print(f'added {playerid.name} successfully')
                        else:
                            print(f'error creating {playerid.name}')

                    except:
                        print(f"{row.get("Player")} or {row.get("School")} not found in database")


def fix_profile():
    directory = './data/av/'
    for filename in os.listdir(directory):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as file:
            yearlydata = json.load(file)
            for player in yearlydata:
                playername = player['name']
                dr = (int(player['draft_pick']) // 32) + 1
                if player['draft_av'] == '':
                    player['draft_av'] = 0
                if player['career_av'] == '':
                    player['career_av'] = 0
                if player['age'] == '':
                    player['age'] = 0 
                try:
                    # what I have: name, position, school, years_ncaa, year_drafted, 
                    # need: draft_round, age_drafted, draft_av, nfl_team 
                    playerinstance = PlayerProfile.objects.get(name=playername, year_drafted = filename[:4])
                    
                except:
                    # what I have: name, round, pick, age, team, career av, draft_av, college 
                    # what I need: years_ncaa, position
                    year = filename[:4]
                    p, created = PlayerProfile.objects.get_or_create(
                        name=player['name'], 
                        position = 'TBD', 
                        school = player['college'], 
                        years_ncaa = [year], 
                        year_drafted = year, 
                        draft_round = dr,
                        draft_pick = int(player['draft_pick']), 
                        age_drafted = int(player['age']), 
                        career_av = float(player['career_av']), 
                        draft_av = float(player['draft_av']), 
                        nfl_team = player['team']
                    )
                    if(created):
                        print(f'{p.name} created successfully!')
                        continue
                    else:
                        print(f'failed to create {player['name']}')
                        continue
                
                playerinstance.draft_round = dr
                playerinstance.age_drafted = int(player['age'])
                playerinstance.draft_av = float(player['draft_av'])
                playerinstance.nfl_team = player['team']
                playerinstance.save()

# populate_db()
# populate_av()
# populate_ncaa_teams()
# populate_yearly_team_data()
# populate_passing_stats()
# fix_av()
# populate_defenders()
# populate_conferences()
# update_conferenes()
# fix_ncaa()
# fill_conference_abbv()
# populate_rb()
# populate_rec()
# upload_defensive()
# upload_team_defense()
# upload_ratings()
# upload_historical()
# fix_ratings()
# fix_RBStats()
# fix_wr()
# add_te()
# fix_defensive()
# upload_combine()
fix_profile()