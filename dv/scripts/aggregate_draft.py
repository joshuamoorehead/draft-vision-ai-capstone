import os
import json
import pandas as pd
# from db.models import PlayerProfile

# this will see the player, draft round, and draft pick taken by each 
from supabase import create_client, Client 
def upload_draft():
    # filepath = './data/fullplayerlist.json'
    # with open(filepath, 'r', encoding='utf-8') as file:
    #     data = pd.read_json(file)

    draft_weights = {
        10: 100, 
        32: 92, 
        64: 85, 
        96: 70, 
        128: 30, 
        160: 25, 
        192: 20, 
        300: 15
    }

    SUPABASE_URL = 'https://pvuzvnemuhutrdmpchmi.supabase.co'
    SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2dXp2bmVtdWh1dHJkbXBjaG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0MDcwNzgsImV4cCI6MjA0ODk4MzA3OH0.fB_b1Oe_2ckp9FGh6vmEs2jIRHjdDoaqzHVsM8NRZRY'

    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    years = [2019, 2020, 2021, 2022, 2023, 2024]
    values = {}
    for year in years: 
        response = supabase.table('db_playerprofile').select("position", 'draft_pick', 'nfl_team').eq('year_drafted', year).execute()
        for player in response.data:
            pick = player['draft_pick']
            for key, val in draft_weights.items():
                if pick <= key:
                    value = val
                    break
            # print(f'{pick}: {value}')
            # values[team][year][position] = value
            if player['nfl_team'] not in values: 
                values[player['nfl_team']] = {}
            if str(year) not in values[player['nfl_team']]:
                values[player['nfl_team']][str(year)] = {}
            if player['position'] not in values[player['nfl_team']][str(year)]:
                values[player['nfl_team']][str(year)][player['position']] = value
            else: 
                values[player['nfl_team']][str(year)][player['position']] += value

    # print(values)
    with open('./scripts/test.json', 'w') as file:
        json.dump(values, file, indent=4)


# can't really do this until we can track players- need an NFL Player Profile. 
# for most players we can search and see where they got drafted. from there we can see when they sign their next deal
# if we have contract data from 2015 and player data from 2016, we should be able to cover the 2019-2024 player range we're using. 
# 1. create "test.json" thing. start with the team that drafted them and then see if they show up in the "Contracts" folder after that. 
# if they aren't in db, assume their first team shown is the team they've been with. 
# once this is done, then we focus on the amount the contract was worth. we're only noting it if they change teams. 
# 1. find every instance of player in "contracts" since their rookie contracts will be available. 
# 2. keep track of the team they're with. 
def upload_contracts():
    directory = './NFLData/Contracts/'
    for filename in os.listdir(directory):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as file:
            df = pd.read_csv(file)
            df = df[['Player', 'Team', 'Year', 'APY']]
                
            # Filter the DataFrame based on the given team and year
            filtered_df = df[(df['Team'] == "Eagles") & (df['Year'] == 2024)]
            
            # Select only the Player and APY columns for output
            result = filtered_df[['Player', 'APY']]
            
            print(result)

def playerlist():
    directory = './NFLData/Contracts/'
    data = {}
    for filename in os.listdir(directory):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as file:
            df = pd.read_csv(file)
            df = df[['Player', 'Team', 'Year', 'APY']]
            position = filename[:-4]
            for row in df.iterrows():
                player = row[1][0]
                team = row[1][1]
                year = row[1][2]
                apy = row[1][3]
                if position not in data:
                    data[position] = {} 
                if player not in data[position]:
                    data[position][player] = [[team, year, apy]]
                else:
                    data[position][player].append([team, year, apy])
                # if team not in data[position][player]:
                #     data[position][player][team] = {}
                # if year not in data[position][player][team]:
                #     data[position][player][team][year] = apy
    with open('./scripts/test.json', 'w', encoding='utf-8') as file:
        json.dump(data, file, indent=4)

def clean_playerlist():
    data = {}
    with open('./NFLData/playerlist.json', 'r', encoding='utf-8') as file:
        playerlist = json.load(file)
        for position, val in playerlist.items():
            for name, row in val.items():
                # row contains each players contracts
                playerscontracts = []
                contractsdict = {} 
                # 0 = team, 1 = year, 2 = APY
                for contract in reversed(row):
                    # print(f'{k}: {contract}')
                    if playerscontracts and playerscontracts[-1] != contract[0]:
                        if contract[0] not in contractsdict:
                            # contractsdict[contract[0]] = [contract[1], contract[2]]
                            contractsdict[contract[0]] = {}
                            # if contract[1] not in contractsdict[contract[0]]:
                            contractsdict[contract[0]][contract[1]] = contract[2]
                        else:
                            if contract[1] not in contractsdict[contract[0]]:
                                contractsdict[contract[0]][contract[1]] = contract[2]
                            # contractsdict[contract[0]].append([contract[1], contract[2]])
                        playerscontracts.append(contract[0])
                    if not playerscontracts:
                        playerscontracts.append(contract[0])
                        contractsdict[contract[0]] = {}
                        contractsdict[contract[0]][contract[1]] = contract[2]

                # print(f'{k}: {contractsdict}')
                # team: contractsdict[0], year: contractsdict[team][]
                for team, yearObj in contractsdict.items():
                    if '/' in team:
                        team = team.split('/')[0]
                    for year, avy in yearObj.items():
                        # print(f'{position}, {name}, {team}, {year}, {avy}')
                        # now we have all the raw data here. 
                        if team not in data:
                            data[team] = {} 
                        if year not in data[team]:
                            data[team][year] = {}
                        if position not in data[team][year]:
                            data[team][year][position] = [[name, avy]]
                        else:
                            data[team][year][position].append([name, avy])
    # print(data)
    with open('./scripts/test.json', 'w', encoding='utf-8') as file:
        json.dump(data, file, indent=4)

def rank_FA():
    data = {} 
    with open('./NFLData/FAList.json', 'r', encoding='utf-8') as file:
        fas = json.load(file)
        for team, d1 in fas.items():
            for year, d2 in d1.items():
                for pos, d3 in d2.items():
                    for entry in d3:
                        name = entry[0]
                        avy = entry[1]
                        # print(f'{team}, {year}, {pos}, {name}, {avy}')
                        avy = int(avy.replace(",","").strip())
                        if year not in data:
                            data[year] = {}
                        if pos not in data[year]:
                            data[year][pos] = {}
                        if name not in data[year][pos]:
                            data[year][pos][name] = [avy, team]
    for year in data:
        for pos in data[year]:
            data[year][pos] = dict(sorted(data[year][pos].items(), key=lambda item: item[1][0], reverse=True))

def clean_FA():
    data = {}
    splits = {
        5: 100, 
        10: 90, 
        20: 60, 
        40: 30, 
        60: 10, 
        90: 5,
        100: 0
    }
    with open('./NFLData/rankedfa.json', 'r', encoding='utf-8') as file:
        players = json.load(file)        


        for year, d1 in players.items():
            for pos, d2 in d1.items():
                total = len(d2)
                i = 1 
                for player, d3 in d2.items():
                    avy = d3[0]
                    team = d3[1]
                    rank = int(i / total * 100.0)
                    
                    for key, val in splits.items():
                        if rank <= key:
                            value = val
                            break
                    
                    if avy < 1000000:
                        value = 0

                    if team not in data:
                        data[team] = {}
                    if year not in data[team]:
                        data[team][year] = {}
                    if pos not in data[team][year]:
                        data[team][year][pos] = value
                    else:
                        data[team][year][pos] += value

                    i += 1

    # print(data)
    with open('./NFLData/2teamfainvestment.json', 'w', encoding='utf-8') as file:
        json.dump(data, file, indent=4)


def reformat_draft():
    draftfile = './NFLData/teamdraftinvestment.json'
    # positions = [] 
    data = {} 
    positions_map =  {
        'C': 'OL', 
        'LS': 'OL', 
        'ILB': "LB", 
        "OT": "OL", 
        "OG": "OL", 
        "G": "OL", 
        "OLB": "LB", 
        "NT": "DT"
    }
    with open(draftfile, 'r', encoding='utf-8') as file:
        rookies = json.load(file)
        for team, d1 in rookies.items():
            for year, d2 in d1.items():
                for pos, rating in d2.items():
                    if pos in positions_map: 
                        position = positions_map[pos]
                    else:
                        position = pos   
                    if team not in data:
                        data[team] = {}
                    if year not in data[team]:
                        data[team][year] = {}
                    if position not in data[team][year]:
                        data[team][year][position] = rating 
                    else:
                        data[team][year][position] += rating

    with open('./scripts/test.json', 'w', encoding='utf-8') as file:
        json.dump(data, file, indent=4)            


def final_draft():
    filepath = './NFLData/almostdonedraft.json'
    positions = ['OL', 'DB', "TE", "RB", "DL", "S", "WR", "LB", "CB", 'DT', "DE", "QB"]
    data = {} 
    with open(filepath, 'r', encoding='utf-8') as file:
        oldfile = json.load(file)
        for team, d1 in oldfile.items():
            for year, d2 in d1.items():
                teampos = [] 
                for pos, rating in d2.items():
                    teampos.append(pos)
                    if team not in data:
                        data[team] = {} 
                    if year not in data[team]:
                        data[team][year] = {} 
                    if pos not in data[team][year]:
                        data[team][year][pos] = rating
                for p in positions:
                    if p not in teampos:
                        data[team][year][p] = 0 
    with open('./scripts/test.json', 'w', encoding='utf-8') as file:
        json.dump(data, file, indent=4)  
    # print(positions)

def reposition_FA():
    filepath = './NFLData/2teamfainvestment.json'
    data = {}
    positions_map = {
        'RT': "OL", 
        "LT": "OL", 
        "RG": "OL", 
        "LG": "OL", 
        "C": "OL", 
    }
    with open(filepath, 'r', encoding='utf-8') as file:
        oldfile = json.load(file)
        positions = ["QB", "RB", 'WR', "TE", 'OL', "DE", "DT", "LB", 'CB', 'S']
        for team, d1 in oldfile.items():
            for year, d2 in d1.items():
                teampos = [] 
                for pos, rating in d2.items():
                    if pos in positions_map: 
                        position = positions_map[pos]
                    else:
                        position = pos   
                    if team not in data:
                        data[team] = {}
                    if year not in data[team]:
                        data[team][year] = {}
                    if position not in data[team][year]:
                        data[team][year][position] = rating 
                    else:
                        data[team][year][position] += rating
                    teampos.append(position)
                for p in positions:
                    if p not in teampos:
                        data[team][year][p] = 0 
    with open('./scripts/test.json', 'w', encoding='utf-8') as file:
        json.dump(data, file, indent=4)  
    
def combine():
    data = {} 
    directory = './NFLData/finaldraft.json'
    finalpositions = ['QB', 'RB', 'WR', 'TE', 'OL', 'DE', 'DT', 'LB', 'CB', 'S']
    with open(directory, 'r', encoding='utf-8') as file:
        draft = json.load(file)
        for team, d1 in draft.items():
            for year, d2 in d1.items():
                for pos, rating in d2.items():
                    if pos == 'DL': 
                        draft[team][year]['DE'] += rating 
                        draft[team][year]['DT'] += rating 
                    elif pos == 'DB':
                        draft[team][year]['CB'] += rating
                        draft[team][year]['S'] += rating
        for team, d1 in draft.items():
            for year, d2 in d1.items():
                for pos, rating in d2.items():
                    if pos in finalpositions:
                        if team not in data:
                            data[team] = {} 
                        if year not in data[team]:
                            data[team][year] = {} 
                        if pos not in data[team][year]:
                            data[team][year][pos] = rating
    directory = './NFLData/finalFA.json'
    with open(directory, 'r', encoding='utf-8') as file:
        fa = json.load(file)
        for team, d1 in fa.items():
            for year, d2 in d1.items():
                if int(year) <= 2018 or int(year) == 2025:
                    continue
                for pos, rating in d2.items():
                    adjrating = int(rating * 0.7)
                    if team not in data:
                            data[team] = {} 
                    if year not in data[team]:
                        data[team][year] = {} 
                    if pos not in data[team][year]:
                        data[team][year][pos] = adjrating
                    else: 
                        data[team][year][pos] += adjrating
    with open('./NFLData/final_investment.json', 'w', encoding='utf-8') as file:
        json.dump(data, file, indent=4)
# upload_draft()
# upload_contracts()
# playerlist()
# clean_playerlist()
# rank_FA()
# clean_FA()
# reformat_draft()
# final_draft()
# reposition_FA()
combine()