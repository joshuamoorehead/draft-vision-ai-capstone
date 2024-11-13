import cfbd.configuration
from dotenv import load_dotenv
from bs4 import BeautifulSoup as bs
import os 
import cfbd
import json 

load_dotenv()
api_key = os.getenv('API_KEY')

# base_url = f"https://api.collegefootballdata.com/bearer={api_key}records?year=2022&conference=SEC"
config = cfbd.Configuration()
config.api_key['Authorization'] = api_key
config.api_key_prefix['Authorization'] = 'Bearer'

# api_instance = cfbd.GamesApi(cfbd.ApiClient(config))
# games = api_instance.get_games(year=2022)
# print(games)

# api_instance = cfbd.RankingsApi(cfbd.ApiClient(config))
# games = api_instance.get_rankings(year=2022)

# print(type(playerstats))
# categories = {}
# for p in playerstats:
#     temp = p.__dict__
#     if temp['_category'] not in categories:
#         categories[temp['_category']] = temp['_stat_type']
#     if temp['_stat_type'] not in categories[temp['_category']]:
#         categories[temp['_category']] += ', ' + temp['_stat_type']
#     # print(f'{temp['_player']}: {temp['_stat_type']} = {temp['_stat']}. category = {temp['_category']}')

# for key, val in categories.items():
#     print(f"{key}: {val}")
# ELO rankings 
# api_instance = cfbd.RatingsApi(cfbd.ApiClient(config))
# elo = api_instance.get_elo_ratings(year=2022)
# # print(elo[11])


# # getting Stetson Bennett's 2022 Neural Network data. 
# # parameters needed: name, school, year, position, 
# api_instance = cfbd.PlayersApi(cfbd.ApiClient(config))
# playerstats = api_instance.get_player_season_stats(year=2022, conference='SEC', team="Georgia")

# for p in playerstats:
#     player = p.__dict__
#     if player['_player'] == 'Stetson Bennett' and (player['_category'] == 'passing' or player['_category'] == 'rushing' or player['_category'] == 'fumbles'):
#         print(f'{player['_stat_type']}: {player['_stat']} ({player['_category']})')


# api_instance = cfbd.MetricsApi(cfbd.ApiClient(config))
# metrics = api_instance.get_player_season_ppa(year=2022, team='Georgia', position='QB')

# for metric in metrics:
#     m = metric.__dict__
#     if m['_name'] == 'Stetson Bennett':
#         t = m['_average_ppa'].__dict__
#         lookfor = ['_all', '_PlayerSeasonPPAAveragePPA__pass', '_rush', '_standard_downs', '_passing_downs']
#         for key, val in t.items():
#             if key in lookfor:
#                 print(f'{key}: {val}')

# api_instance = cfbd.RatingsApi(cfbd.ApiClient(config))
# metrics = api_instance.get_elo_ratings(year=2022, team='Georgia')
# print(metrics)

# api_instance = cfbd.PlayersApi(cfbd.ApiClient(config))
# metrics = api_instance.get_player_usage(year=2022, team='Georgia', position='QB')
# for metric in metrics:
#     m = metric.__dict__
#     if m['_name'] == 'Stetson Bennett':
#         usage = m['_usage'].__dict__
#         for key, val in usage.items():
#             print(f'{key}: {val}')

# api_instance = cfbd.TeamsApi(cfbd.ApiClient(config))
# metrics = api_instance.get_talent(year=2022)
# for m in metrics:
#     m = m.__dict__
#     if m['_school'] == 'Georgia':
#         print(m['_talent'])

def QB_getNN(name, school, year, position='QB'):
    res = {}
    api_instance = cfbd.PlayersApi(cfbd.ApiClient(config))
    playerstats = api_instance.get_player_season_stats(year=year, team=school)
    for p in playerstats:
        player = p.__dict__
        if player['_player'] == name and (player['_category'] == 'passing' or player['_category'] == 'rushing' or player['_category'] == 'fumbles'):
            print(f'{player['_stat_type']}: {player['_stat']} ({player['_category']})')
            res[player['_stat_type']] = player['_stat']

    api_instance = cfbd.MetricsApi(cfbd.ApiClient(config))
    metrics = api_instance.get_player_season_ppa(year=year, team=school, position=position)

    for metric in metrics:
        m = metric.__dict__
        if m['_name'] == name:
            t = m['_average_ppa'].__dict__
            lookfor = ['_all', '_PlayerSeasonPPAAveragePPA__pass', '_rush', '_standard_downs', '_passing_downs']
            for key, val in t.items():
                if key in lookfor:
                    print(f'{key}: {val}')
                    res[key] = val 

    api_instance = cfbd.RatingsApi(cfbd.ApiClient(config))
    metrics = api_instance.get_elo_ratings(year=year, team=school)
    metrics = metrics[0].__dict__
    res['elo'] = metrics['_elo']

    api_instance = cfbd.PlayersApi(cfbd.ApiClient(config))
    metrics = api_instance.get_player_usage(year=year, team=school, position=position)
    for metric in metrics:
        m = metric.__dict__
        if m['_name'] == name:
            usage = m['_usage'].__dict__
            lookfor = ['_overall', '_PlayerUsageUsage__pass', '_rush', '_first_down', '_second_down', '_third_down', '_standard_downs', '_passing_downs']
            for key, val in usage.items():
                if key in lookfor:
                    print(f'{key}: {val}')
                    res[key[1:]] = val 
                

    api_instance = cfbd.TeamsApi(cfbd.ApiClient(config))
    metrics = api_instance.get_talent(year=year)
    for m in metrics:
        m = m.__dict__
        if m['_school'] == school:
            print(m['_talent'])
            res['talent'] = m['_talent']
    with open(f'./data/{name}.json', 'w') as file:
        json.dump(res, file, indent=4)
    return res  

def findYearsNCAA(name, position, year, school, id):
    years = [] 
    AtFreshmenYear = False
    api_instance = cfbd.PlayersApi(cfbd.ApiClient(config))
    metrics = api_instance.player_search(search_term=name, year=year, position=position, team=school)
    while not AtFreshmenYear or len(years) < 4:
        years.append(year)
        year -= 1
        metrics = api_instance.player_search(search_term=name, year=year, position=position, team=school)
        if not metrics:
            # seeing if he transferred 
            metrics = api_instance.player_search(search_term=name, year=year, position=position)
        
        if not metrics:
            # player isn't found. not in school yet 
            AtFreshmenYear = True 
        else:
            Found = False 
            for m in metrics:
                t = m.__dict__
                if t['_id'] == id:
                    Found = True 
            if not Found: 
                AtFreshmenYear = True 
    return years
        



# 1. get list of all players you want to collect. We can use AV from 2016-2024. 
def findPlayers(name, year, school):
    print(f'Searching {name} from {school} in year {year}')
    api_instance = cfbd.PlayersApi(cfbd.ApiClient(config))
    res = {} 
    metrics = api_instance.player_search(search_term=name, year=year, team=school)
    if not metrics:
        metrics = api_instance.player_search(search_term=name, year=year)
    if len(metrics) == 1: 
        t = metrics[0].__dict__
        res['name'] = t['_name']
        res['position'] = t['_position']
        res['school'] = t['_team']
        res['PlayerID'] = t['_id']
        res['years_ncaa'] = findYearsNCAA(t['_name'], t['_position'], year, t['_team'], t['_id'])
        res['height'] = t['_height']
        res['weight'] = t['_weight']
    if res:
        print('Found Player!')
        with open('./data/fullplayerlist.json', 'a') as file:
            json.dump(res, file, indent=4)
    else:
        print('Player not found')


def operateSearch():
    folderpath = './data/av/'
    year = 2015
    with open('./data/fullplayerlist.json', 'r', encoding='utf-8') as file:
        data = json.load(file)
    i = 0
    for filename in os.listdir(folderpath):
        filepath = os.path.join(folderpath, filename)
        if os.path.isfile(filepath):
            with open(filepath, 'r') as file:
                current_year = json.load(file)
            for player in current_year:
                # print(player['name'])
                if i >= len(data):
                    findPlayers(name=player['name'], year=year, school=player['college'])
                i += 1
        year += 1

operateSearch()
# findPlayers("Caleb Williams", 2023, 'USC')

# one = QB_getNN(name='Caleb Williams', school='USC', year=2023)