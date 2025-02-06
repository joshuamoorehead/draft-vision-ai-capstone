from cfbd.rest import ApiException
from cfbd import ApiClient, Configuration
import os 
import json

config = Configuration()
config.api_key['Authorization'] = 'gyuLKGW/GyBdkLjfeSwnup5REEbpYnaI6eoye35IrsdwCtKED63JC0lFGuMyWVAD'
config.api_key_prefix['Authorization'] = 'Bearer'

api_client = ApiClient(config)

from cfbd.api.players_api import PlayersApi

players_api = PlayersApi(api_client)

def test():
    # categories = ['defensive', 'interceptions', 'fumbles'] 
    categories = [] 
    stat_types = [] 
    dict = {} 
    try:
        players = players_api.get_player_season_stats(year=2015, conference='SEC', team='Alabama')
        for p in players:
            player = p.__dict__
            # print(f'{player['_category']}\t{player['_stat_type']}')
            if player['_category'] not in categories:
                categories.append(player['_category'])
            # print(player.keys())
            # if player['_category'] in categories and player['_stat_type'] not in stat_types:
            #     stat_types.append(player['_stat_type'])
            # if player['_category']
    except ApiException as e:
        print(f'exception')

    print(categories)
    print(stat_types)

# as of rn: prints data as we need it. will take awhile to load. 
# for tomorrow: get it so that it uploads everything to a json. would be easier to rearrange from there so that we can upload to DB. 
def acquire_by_year():
    filepath = './data/newdefensivestats/'
    year = 2024  
    categories = ['defensive', 'interceptions', 'fumbles'] 
    while year < 2025:
        extension = str(year) + '.json'
        filename = os.path.join(filepath, extension)
        data = []
        for category in categories:
            try:
                players = players_api.get_player_season_stats(year=year, category=category)
                # print(len(players))
                print(players[0])
        #         for p in players:
        #             player = p.__dict__
        #             name = player['_player']
        #             team = player['_team']
        #             position = player['_position']
        #             conference = player['_conference']
        #             stat_type = player['_stat_type']
        #             stat = player['_stat']
        #             # print(f'name: {name}, team: {team}, conference: {conference}\tstat type {stat_type}: {stat}')
        #             playercard = {
        #                 'name': name, 'position': position, 'team': team, 'conference': conference, 'category': category, 'stat_type': stat_type, 'stat': stat
        #             }
        #             data.append(playercard)
            except ApiException as e:
                print(f'exception')
        #     print(f'{category} in {year} loaded')
        # with open(filename, 'w') as file: 
        #     json.dump(data, file, indent=4)
        year += 1

acquire_by_year()
# test()
