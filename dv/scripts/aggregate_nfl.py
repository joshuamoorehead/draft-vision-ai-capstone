import json
import os 
import pandas as pd
from db.models import NFLQBTeam, NFLRBTeam, NFLWRTeam, NFLTETeam, NFLOLTeam, NFLDETeam, NFLDTTeam, NFLLBTeam, NFLCBTeam, NFLSTeam          
import sys 

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def upload(data, path='./scripts/test.json'):
    with open(path, 'w', encoding='utf-8') as file:
        json.dump(data, file, indent=4)  

def qbsop():
    # advqbdir = './NFLData/PlayerStats/AdvQBLeaders/'
    # qbdir = './NFLData/PlayerStats/QBLeaders/'
    accuracydir = './NFLData/TeamStats/Passing/Accuracy/'
    airdir = './NFLData/TeamStats/Passing/AirYards/'
    pressuredir = './NFLData/TeamStats/Passing/Pressure/'

    # advanced: intended air yards/att, completed air yards/attempt, yac, on target %, bad throw %, success %, drop %, times blitzed, pressure %, pocket time, scrambles, yards/scramble, 

    # Cmp, att, yds, iay/PA, CAY/PA, YAC/cmp
    # drop%, bad%, ontgt%
    # Sk, pkttime, blitz, hurry, hits, prss%, scrm, yds/scr 

    data = {} 
    # for filename in os.listdir(qbdir):
    #     filepath = os.path.join(qbdir, filename)
    #     with open(filepath, 'r', encoding='utf-8') as file:
    #         regstats = pd.read_csv(file)
    #         # stats to get Completion %, pass yards/att, ANY/A, passer rating, QBR, TD%, INT%, sack %, yards lost from sacks, awards 
    #         regstats = regstats[['Player', 'Team', 'Pos', 'Age', 'G', 'GS', 'Cmp%', 'TD%', 'Int%', 'Sk%', 'Yds.1', 'QBR', 'Awards']]
    #         for index, row in regstats.iterrows():
    #             formatted_output = ([f'{col}: {row[col]}' for col in regstats.columns])
    #             # print(formatted_output)
    #             player = row[0]
    #             team = row[1]
    #             pos = row[2]
    #             # print(pos)
    #             playerinfo = formatted_output[3:]
    #             year = filename[:4]
    #             if pos == 'QB': 
    #                 if year not in data:
    #                         data[year] = {} 
    #                 if team not in data[year]:
    #                     data[year][team] = {} 
    #                 if player not in data[year][team]:
    #                     data[year][team][player] = playerinfo
    #                 else:
    #                     data[year][team][player].append(playerinfo)
    # # with open('./scripts/test.json', 'w', encoding='utf-8') as file:
    # #     json.dump(data, file, indent=4)  

        
    # for filename in os.listdir(advqbdir):
    #     filepath = os.path.join(advqbdir, filename)
    #     with open(filepath, 'r', encoding='utf-8') as file:
    #         advstats = pd.read_csv(file)
    #         advstats = advstats[['Player', 'Team', 'Pos', 'IAY/PA', 'CAY/PA', 'YAC/Cmp', 'Drop%', 'Bad%', 'PktTime', 'Prss%', 'Yds/Scr']]
    #         for index, row in advstats.iterrows():
    #             newrow = ([f'{col}: {row[col]}' for col in advstats.columns])
    #             player = row[0]
    #             team = row[1]
    #             year = filename[:4]
    #             pos = row[2]
    #             pdata = newrow[3:]
    #             if pos == 'QB': 
    #                 if year not in data:
    #                         data[year] = {} 
    #                 if team not in data[year]:
    #                     data[year][team] = {} 
    #                 if player not in data[year][team]:
    #                     data[year][team][player] = newrow
    #                 else:
    #                     existingdata = data[year][team][player]
    #                     for item in pdata:
    #                         existingdata.append(item)
    #                     data[year][team][player] = (existingdata)

    
    for filename in os.listdir(accuracydir):
        filepath = os.path.join(accuracydir, filename)
        with open(filepath, 'r', encoding='utf-8') as file:
            accstats = pd.read_csv(file)
            accstats = accstats[['Tm', 'Cmp', 'Att', 'Yds', 'Drop%', 'Bad%', 'OnTgt%']]

            for index, row in accstats.iterrows():
                newrow = ([f'{col}: {row[col]}' for col in accstats.columns])
                team = row[0]
                year = filename[:4]
                tdata = newrow[1:]
                if year not in data:
                    data[year] = {} 
                if team not in data[year]:
                    data[year][team] = {} 
                data[year][team]['Accuracy'] = tdata

    
    for filename in os.listdir(airdir):
        filepath = os.path.join(airdir, filename)
        with open(filepath, 'r', encoding='utf-8') as file:
            airstats = pd.read_csv(file)
            airstats = airstats[['Tm', 'IAY/PA', 'CAY/PA', 'YAC/Cmp']]
            for index, row in airstats.iterrows():
                newrow = ([f'{col}: {row[col]}' for col in airstats.columns])
                team = row[0]
                year = filename[:4]
                tdata = newrow[1:]
                if year not in data:
                    data[year] = {} 
                if team not in data[year]:
                    data[year][team] = {} 
                data[year][team]['Air'] = tdata 

    for filename in os.listdir(pressuredir):
        filepath = os.path.join(pressuredir, filename)
        with open(filepath, 'r', encoding='utf-8') as file:
            pressurestats = pd.read_csv(file)
            pressurestats = pressurestats[['Tm', 'Sk', 'PktTime', 'Hits', 'Prss%']]

            for index, row in pressurestats.iterrows():
                newrow = ([f'{col}: {row[col]}' for col in pressurestats.columns])
                team = row[0]
                year = filename[:4]
                tdata = newrow[1:]
                if year not in data:
                    data[year] = {} 
                if team not in data[year]:
                    data[year][team] = {} 
                data[year][team]['Pressure'] = tdata 

    with open('./scripts/test.json', 'w', encoding='utf-8') as file:
        json.dump(data, file, indent=4)  


def rbsop():
    # regular: player, team, year, pos, age, g, gs, y/a, y/g, succ%, 1D, awards


    rushdir = './NFLData/PlayerStats/RBLeaders/'
    advdir = './NFLData/PlayerStats/AdvRBLeaders/'
    recdir = './NFLData/PlayerStats/RECLeaders/'
    advrecdir = './NFLData/PlayerStats/AdvWRLeaders/'
    teamrushdir = './NFLData/TeamStats/Rushing/'

    data = {} 

    # for filename in os.listdir(rushdir):
    #     filepath = os.path.join(rushdir, filename)
    #     with open(filepath, 'r', encoding='utf-8') as file: 
    #         rushstats = pd.read_csv(file)
    #         filtered = rushstats[(rushstats['Pos'] == 'RB')]
    #         filtered = filtered[['Player', 'Team', 'Pos', 'Age', 'G', 'GS', 'Y/A', 'Y/G', 'Succ%', '1D', 'Awards']]
            
    #         for index, row in filtered.iterrows():
    #             d = ([f'{col}: {row[col]}' for col in filtered.columns])
    #             player = row[0]
    #             team = row[1]
    #             year = filename[:4]
    #             pdata = d[2:]
    #             if year not in data:
    #                 data[year] = {} 
    #             if team not in data[year]:
    #                 data[year][team] = {} 
    #             if player not in data[year][team]:
    #                 data[year][team][player] = pdata 
    
    # # advanced: player, team, year, pos, ybc/att, yac/att, BrkTkl, Att/br
    # for filename in os.listdir(advdir):
    #     filepath = os.path.join(advdir, filename)
    #     with open(filepath, 'r', encoding='utf-8') as file: 
    #         advrushstats = pd.read_csv(file)
    #         filtered = advrushstats[(advrushstats['Pos'] == 'RB')]
    #         filtered = filtered[['Player', 'Team', 'Pos', 'YBC/Att', 'YAC/Att', 'BrkTkl', 'Att/Br']]
    #         for index, row in filtered.iterrows():
    #             d = ([f'{col}: {row[col]}' for col in filtered.columns])
    #             player = row[0] 
    #             team = row[1] 
    #             year = filename[:4] 
    #             pdata = d[2:] 
    #             if year not in data:
    #                 data[year] = {} 
    #             if team not in data[year]: 
    #                 data[year][team] = {} 
    #             if player not in data[year][team]:
    #                 data[year][team][player] = pdata 
    #             else:
    #                 existing = data[year][team][player]
    #                 for item in pdata:
    #                     existing.append(item)
    #                 data[year][team][player] = existing 
    
    # # rec std: player, team, year, pos, tgt, Y/R, succ%, r/g, ctch%, Y/Tgt
    # for filename in os.listdir(recdir):
    #     filepath = os.path.join(recdir, filename)
    #     with open(filepath, 'r', encoding='utf-8') as file:
    #         recs = pd.read_csv(file)
    #         filtered = recs[(recs['Pos'] == 'RB')]
    #         filtered = filtered[['Player', 'Team', 'Pos', 'Tgt', 'Y/R', 'Succ%', 'R/G', 'Ctch%', 'Y/Tgt']]
    #         for index, row in filtered.iterrows():
    #             d = ([f'{col}: {row[col]}' for col in filtered.columns])
    #             player = row[0] 
    #             team = row[1] 
    #             year = filename[:4]
    #             pdata = d[2:] 
    #             if year not in data:
    #                 data[year] = {} 
    #             if team not in data[year]: 
    #                 data[year][team] = {} 
    #             if player not in data[year][team]:
    #                 data[year][team][player] = pdata 
    #             else:
    #                 existing = data[year][team][player]
    #                 for item in pdata:
    #                     existing.append(item)
    #                 data[year][team][player] = existing


    # # adv rec: player, team, year, pos, ybc/r, yac/r, drop%
    # for filename in os.listdir(advrecdir):
    #     filepath = os.path.join(advrecdir, filename)
    #     with open(filepath, 'r', encoding='utf-8') as file:
    #         advstats = pd.read_csv(file)
    #         filtered = advstats[(advstats['Pos'] == 'RB')]
    #         filtered = filtered[['Player', 'Team', 'YBC/R', 'YAC/R', 'Drop%']]
    #         for index, row in filtered.iterrows():
    #             d = ([f'{col}: {row[col]}' for col in filtered.columns])
    #             player = row[0] 
    #             team = row[1] 
    #             year = filename[:4]
    #             pdata = d[2:]
    #             if year not in data:
    #                 data[year] = {} 
    #             if team not in data[year]:
    #                 data[year][team] = {} 
    #             if player not in data[year][team]:
    #                 data[year][team][player] = pdata 
    #             else:
    #                 existing = data[year][team][player] 
    #                 for item in pdata:
    #                     existing.append(item)
    #                 data[year][team][player] = existing
                
    # team rushing: Tm, year, att, yds, TD, 1D, ybc/att, yac/att, att/br
    for filename in os.listdir(teamrushdir):
        filepath = os.path.join(teamrushdir, filename)
        with open(filepath, 'r', encoding='utf-8') as file:
            teamrush = pd.read_csv(file)
            filtered = teamrush[['Tm', 'Att', 'Yds', 'TD', '1D', 'YBC/Att', 'YAC/Att', 'Att/Br']]
            for index, row in filtered.iterrows():
                d = ([f'{col}: {row[col]}' for col in filtered.columns])
                team = row[0] 
                year = filename[:4]
                tdata = d[1:] 
                if year not in data:
                    data[year] = {} 
                if team not in data[year]:
                    data[year][team] = {}
                data[year][team]['TeamRush'] = tdata 
    upload(data, './NFLData/TeamNeeds/RB.json')
def wrsop():
    # std: Player, Team, Pos, Year, Age, G, GS, Ctch%, Succ%, Y/G, Y/Tgt, 1D, TD, awards 
    # stddir = './NFLData/PlayerStats/RecLeaders/'
    data = {} 
    # for filename in os.listdir(stddir):
    #     filepath = os.path.join(stddir, filename)
    #     with open(filepath, 'r', encoding='utf-8') as file:
    #         std = pd.read_csv(file)
    #         filtered = std[(std['Pos'] == 'WR')]
    #         filtered = filtered[['Player', 'Team', 'Pos', 'Age', 'G', 'GS', 'Ctch%', 'Succ%', 'Y/G', 'Y/Tgt', '1D', 'TD', 'Awards']]
    #         for index, row in filtered.iterrows():
    #             d = ([f'{col}: {row[col]}' for col in filtered.columns])
    #             player = row[0]
    #             team = row[1]
    #             year = filename[:4]
    #             pdata = d[2:]
    #             if year not in data:
    #                 data[year] = {} 
    #             if team not in data[year]:
    #                 data[year][team] = {} 
    #             if player not in data[year][team]:
    #                 data[year][team][player] = pdata
    #             else:
    #                 e = data[year][team][player]
    #                 for item in pdata:
    #                     e.append(item)
    #                 data[year][team][player] = e 

    # # adv: Player, Team, Pos, Year, YBC/R, YAC/R, BrkTkl, Rec/Br, Rat, ADOT, Drop, Drop%, Int
    # advdir = './NFLData/PlayerStats/AdvWRLeaders/'
    # for filename in os.listdir(advdir):
    #     filepath = os.path.join(advdir, filename)
    #     with open(filepath, 'r', encoding='utf-8') as file:
    #         adv = pd.read_csv(file)
    #         filtered = adv[(adv['Pos'] == 'WR')]
    #         filtered = filtered[['Player', 'Team', 'YBC/R', 'YAC/R', 'BrkTkl', 'Rec/Br', 'ADOT', 'Drop', 'Drop%', 'Int', 'Rat']]
    #         for index, row in filtered.iterrows():
    #             d = ([f'{col}: {row[col]}' for col in filtered.columns])
    #             player = row[0]
    #             team = row[1]
    #             year = filename[:4]
    #             pdata = d[2:]
    #             if year not in data:
    #                 data[year] = {} 
    #             if team not in data[year]:
    #                 data[year][team] = {} 
    #             if player not in data[year][team]:
    #                 data[year][team][player] = pdata
    #             else:
    #                 e = data[year][team][player]
    #                 for item in pdata:
    #                     e.append(item)
    #                 data[year][team][player] = e 
    # team: Tm, year, Tgt, Rec, Yds, TD, 1D, ybc/r, yac/r, ADOT, rec/br, drop%
    teamdir ='./NFLData/TeamStats/Receiving/'
    for filename in os.listdir(teamdir):
        filepath = os.path.join(teamdir, filename)
        with open(filepath, 'r', encoding='utf-8') as file:
            rec = pd.read_csv(file)
            filtered = rec[['Tm', 'Tgt', "Rec", 'Yds', 'TD', '1D', 'YBC/R', 'YAC/R', 'ADOT', 'Rec/Br', 'Drop%']]
            for index, row in filtered.iterrows():
                d = ([f'{col}: {row[col]}' for col in filtered.columns])
                # player = row[0]
                team = row[0]
                year = filename[:4]
                pdata = d[1:]
                if year not in data:
                    data[year] = {} 
                if team not in data[year]:
                    data[year][team] = {} 
                data[year][team]['TeamRec'] = pdata 
    upload(data, './NFLData/TeamNeeds/WR.json')

def tesop(): 
    # std: Player, Team, Pos, Year, Age, G, GS, Ctch%, Succ%, Y/G, Y/Tgt, 1D, TD, awards 
    # adv: Player, Team, Pos, Year, YBC/R, YAC/R, BrkTkl, Rec/Br, Rat, ADOT, Drop, Drop%, Int
    # OL Stats: Tm, Year, Att, Yds, TD, 1D, YBC/Att, YAC/Att, Att/Br
    # Team Rec: Tm, Year, Tgt, Rec, Yds, TD, 1D, YBC/R, YAC/R, ADOT, Rec/Br, Drop%

    # std: Player, Team, Pos, Year, Age, G, GS, Ctch%, Succ%, Y/G, Y/Tgt, 1D, TD, awards 
    stddir = './NFLData/PlayerStats/RecLeaders/'
    data = {} 
    # for filename in os.listdir(stddir):
    #     filepath = os.path.join(stddir, filename)
    #     with open(filepath, 'r', encoding='utf-8') as file:
    #         std = pd.read_csv(file)
    #         filtered = std[(std['Pos'] == 'TE')]
    #         filtered = filtered[['Player', 'Team', 'Pos', 'Age', 'G', 'GS', 'Ctch%', 'Succ%', 'Y/G', 'Y/Tgt', '1D', 'TD', 'Awards']]
    #         for index, row in filtered.iterrows():
    #             d = ([f'{col}: {row[col]}' for col in filtered.columns])
    #             player = row[0]
    #             team = row[1]
    #             year = filename[:4]
    #             pdata = d[2:]
    #             if year not in data:
    #                 data[year] = {} 
    #             if team not in data[year]:
    #                 data[year][team] = {} 
    #             if player not in data[year][team]:
    #                 data[year][team][player] = pdata
    #             else:
    #                 e = data[year][team][player]
    #                 for item in pdata:
    #                     e.append(item)
    #                 data[year][team][player] = e 

    # # adv: Player, Team, Pos, Year, YBC/R, YAC/R, BrkTkl, Rec/Br, Rat, ADOT, Drop, Drop%, Int
    # advdir = './NFLData/PlayerStats/AdvWRLeaders/'
    # for filename in os.listdir(advdir):
    #     filepath = os.path.join(advdir, filename)
    #     with open(filepath, 'r', encoding='utf-8') as file:
    #         adv = pd.read_csv(file)
    #         filtered = adv[(adv['Pos'] == 'TE')]
    #         filtered = filtered[['Player', 'Team', 'YBC/R', 'YAC/R', 'BrkTkl', 'Rec/Br', 'ADOT', 'Drop', 'Drop%', 'Int', 'Rat']]
    #         for index, row in filtered.iterrows():
    #             d = ([f'{col}: {row[col]}' for col in filtered.columns])
    #             player = row[0]
    #             team = row[1]
    #             year = filename[:4]
    #             pdata = d[2:]
    #             if year not in data:
    #                 data[year] = {} 
    #             if team not in data[year]:
    #                 data[year][team] = {} 
    #             if player not in data[year][team]:
    #                 data[year][team][player] = pdata
    #             else:
    #                 e = data[year][team][player]
    #                 for item in pdata:
    #                     e.append(item)
    #                 data[year][team][player] = e 
    # team: Tm, year, Tgt, Rec, Yds, TD, 1D, ybc/r, yac/r, ADOT, rec/br, drop%
    teamdir ='./NFLData/TeamStats/Receiving/'
    for filename in os.listdir(teamdir):
        filepath = os.path.join(teamdir, filename)
        with open(filepath, 'r', encoding='utf-8') as file:
            rec = pd.read_csv(file)
            filtered = rec[['Tm', 'Tgt', "Rec", 'Yds', 'TD', '1D', 'YBC/R', 'YAC/R', 'ADOT', 'Rec/Br', 'Drop%']]
            for index, row in filtered.iterrows():
                d = ([f'{col}: {row[col]}' for col in filtered.columns])
                team = row[0]
                year = filename[:4]
                pdata = d[1:]
                if year not in data:
                    data[year] = {} 
                if team not in data[year]:
                    data[year][team] = {} 
                data[year][team]['TeamRec'] = pdata

    teamrushdir = './NFLData/TeamStats/Rushing/'
    for filename in os.listdir(teamrushdir):
        filepath = os.path.join(teamrushdir, filename)
        with open(filepath, 'r', encoding='utf-8') as file:
            teamrush = pd.read_csv(file)
            filtered = teamrush[['Tm', 'Att', 'Yds', 'TD', '1D', 'YBC/Att', 'YAC/Att', 'Att/Br']]
            for index, row in filtered.iterrows():
                d = ([f'{col}: {row[col]}' for col in filtered.columns])
                team = row[0] 
                year = filename[:4]
                tdata = d[1:] 
                if year not in data:
                    data[year] = {} 
                if team not in data[year]:
                    data[year][team] = {}
                data[year][team]['TeamRush'] = tdata 
    upload(data, './NFLData/TeamNeeds/TE.json') 

def olsop(): 
    # OL Stats: Tm, Year, Att, Yds, TD, 1D, YBC/Att, YAC/Att, Att/Br, awards
    # Tm, Year, Sk, PktTime, Hurry, Hits, Prss%, Yds/Scr
    # Tm, Year, Sk, pkttime, hurry, hits, prss%, scrm, yds/scr 
    data = {} 
    teamrushdir = './NFLData/TeamStats/Rushing/'
    for filename in os.listdir(teamrushdir):
        filepath = os.path.join(teamrushdir, filename)
        with open(filepath, 'r', encoding='utf-8') as file:
            teamrush = pd.read_csv(file)
            filtered = teamrush[['Tm', 'Att', 'Yds', 'TD', '1D', 'YBC/Att', 'YAC/Att', 'Att/Br']]
            for index, row in filtered.iterrows():
                d = ([f'{col}: {row[col]}' for col in filtered.columns])
                team = row[0] 
                year = filename[:4]
                tdata = d[1:] 
                if year not in data:
                    data[year] = {} 
                if team not in data[year]:
                    data[year][team] = {}
                data[year][team]['TeamRush'] = tdata 
   
    
    pressuredir = './NFLData/TeamStats/Passing/Pressure/'
    for filename in os.listdir(pressuredir):
        filepath = os.path.join(pressuredir, filename)
        with open(filepath, 'r', encoding='utf-8') as file:
            pressurestats = pd.read_csv(file)
            pressurestats = pressurestats[['Tm', 'Sk', 'PktTime', 'Hits', 'Prss%', 'Scrm']]

            for index, row in pressurestats.iterrows():
                newrow = ([f'{col}: {row[col]}' for col in pressurestats.columns])
                team = row[0]
                year = filename[:4]
                tdata = newrow[1:]
                if year not in data:
                    data[year] = {} 
                if team not in data[year]:
                    data[year][team] = {} 
                data[year][team]['Pressure'] = tdata 
    upload(data, './NFLData/TeamNeeds/OL.json')

def desop():
    # Std: Player, Team, Year, Pos, Age, Sk, TFL, Comb, Solo, QBHits, Awards
    data = {} 
    # stddir = './NFLData/PlayerStats/Defense/'
    # for filename in os.listdir(stddir):
    #     filepath = os.path.join(stddir, filename)
    #     with open(filepath, 'r', encoding='utf-8') as file:
    #         std = pd.read_csv(file)
    #         filtered = std[(std['Pos'].isin(['DE', 'DT']))]
    #         filtered = filtered[['Player', 'Team', 'Age', 'Pos', 'G', 'GS', 'Sk', 'TFL', 'FF', 'FR', 'Comb', 'Solo', 'QBHits', 'Awards']]
    #         for index, row in filtered.iterrows():
    #             d = ([f'{col}: {row[col]}' for col in filtered.columns])
    #             player = row[0] 
    #             team = row[1] 
    #             year = filename[:4]
    #             tdata = d[2:]
    #             if year not in data:
    #                 data[year] = {}
    #             if team not in data[year]: 
    #                 data[year][team] = {} 
    #             if player not in data[year][team]:
    #                 data[year][team][player] = tdata
    #             else:
    #                 e = data[year][team][player]
    #                 for i in tdata:
    #                     e.append(i)
    #                 data[year][team][player] = e
    
    # # Adv: Player, Team, Year, Pos, Prss, Hrry, Bats, Mtkl%
    # dir = './NFLData/PlayerStats/AdvDefense/'
    # for filename in os.listdir(dir):
    #     filepath = os.path.join(dir, filename)
    #     with open(filepath, 'r', encoding='utf-8') as file:
    #         adv = pd.read_csv(file)
    #         filt = adv[(adv['Pos'] == 'DE')]
    #         filt = filt[['Player', 'Team', 'Prss', 'Hrry', 'Bats', 'MTkl%']]
    #         for index, row in filt.iterrows():
    #             d = ([f'{col}: {row[col]}' for col in filt.columns])
    #             player = row[0] 
    #             team = row[1] 
    #             year = filename[:4]
    #             tdata = d[2:]
    #             if year not in data:
    #                 data[year] = {}
    #             if team not in data[year]: 
    #                 data[year][team] = {} 
    #             if player not in data[year][team]:
    #                 data[year][team][player] = tdata
    #             else:
    #                 e = data[year][team][player]
    #                 for i in tdata:
    #                     e.append(i)
    #                 data[year][team][player] = e
    # TeamAdv: Tm, Year, Hrry%, QBKD%, Prss%, Mtkl
    dir = './NFLData/TeamStats/Defense/Advanced/'
    for filename in os.listdir(dir):
        filepath = os.path.join(dir, filename)
        with open(filepath, 'r', encoding='utf-8') as file:
            adv = pd.read_csv(file)
            filt = adv[['Tm', 'Hrry%', 'QBKD%', 'Prss%', 'MTkl']]
            for index, row in filt.iterrows():
                d = ([f'{col}: {row[col]}' for col in filt.columns]) 
                team = row[0] 
                year = filename[:4]
                tdata = d[1:]
                if year not in data:
                    data[year] = {}
                if team not in data[year]: 
                    data[year][team] = {} 
                data[year][team]['TeamAdv'] = tdata 
    # TeamPass: Rate, Sk, Yds, QBHits, TFL, ANY/A, EXP
    dir = './NFLData/TeamStats/Defense/Passing/'
    for filename in os.listdir(dir):
        filepath = os.path.join(dir, filename)
        with open(filepath, 'r', encoding='utf-8') as file:
            adv = pd.read_csv(file)
            filt = adv[['Tm', 'Rate', 'Sk', 'Yds.1', 'QBHits', 'TFL', 'ANY/A', 'EXP']]
            for index, row in filt.iterrows():
                d = ([f'{col}: {row[col]}' for col in filt.columns]) 
                team = row[0] 
                year = filename[:4]
                tdata = d[1:]
                if year not in data:
                    data[year] = {}
                if team not in data[year]: 
                    data[year][team] = {} 
                data[year][team]['TeamPassRush'] = tdata 
    # TeamRush: Tm, Year, Yds, Y/A, Y/G, EXP
    dir = './NFLData/TeamStats/Defense/Rushing/'
    for filename in os.listdir(dir):
        filepath = os.path.join(dir, filename)
        with open(filepath, 'r', encoding='utf-8') as file:
            adv = pd.read_csv(file)
            filt = adv[['Tm', 'Yds', 'Y/A', 'Y/G', 'EXP']]
            for index, row in filt.iterrows():
                d = ([f'{col}: {row[col]}' for col in filt.columns]) 
                team = row[0] 
                year = filename[:4]
                tdata = d[1:]
                if year not in data:
                    data[year] = {}
                if team not in data[year]: 
                    data[year][team] = {} 
                data[year][team]['TeamRushDef'] = tdata 
    upload(data, './NFLData/TeamNeeds/DE.json')

def dtsop():
    # Std: Player, Team, Year, Pos, Age, Sk, TFL, Comb, Solo, QBHits, Awards
    data = {} 
    # stddir = './NFLData/PlayerStats/Defense/'
    # for filename in os.listdir(stddir):
    #     filepath = os.path.join(stddir, filename)
    #     with open(filepath, 'r', encoding='utf-8') as file:
    #         std = pd.read_csv(file)
    #         filtered = std[(std['Pos'] == 'DT')]
    #         filtered = filtered[['Player', 'Team', 'Age', 'Pos', 'G', 'GS', 'Sk', 'TFL', 'FF', 'FR', 'Comb', 'Solo', 'QBHits', 'Awards']]
    #         for index, row in filtered.iterrows():
    #             d = ([f'{col}: {row[col]}' for col in filtered.columns])
    #             player = row[0] 
    #             team = row[1] 
    #             year = filename[:4]
    #             tdata = d[2:]
    #             if year not in data:
    #                 data[year] = {}
    #             if team not in data[year]: 
    #                 data[year][team] = {} 
    #             if player not in data[year][team]:
    #                 data[year][team][player] = tdata
    #             else:
    #                 e = data[year][team][player]
    #                 for i in tdata:
    #                     e.append(i)
    #                 data[year][team][player] = e
    
    # # Adv: Player, Team, Year, Pos, Prss, Hrry, Bats, Mtkl%
    # dir = './NFLData/PlayerStats/AdvDefense/'
    # for filename in os.listdir(dir):
    #     filepath = os.path.join(dir, filename)
    #     with open(filepath, 'r', encoding='utf-8') as file:
    #         adv = pd.read_csv(file)
    #         filt = adv[(adv['Pos'] == 'DT')]
    #         filt = filt[['Player', 'Team', 'Prss', 'Hrry', 'Bats', 'MTkl%']]
    #         for index, row in filt.iterrows():
    #             d = ([f'{col}: {row[col]}' for col in filt.columns])
    #             player = row[0] 
    #             team = row[1] 
    #             year = filename[:4]
    #             tdata = d[2:]
    #             if year not in data:
    #                 data[year] = {}
    #             if team not in data[year]: 
    #                 data[year][team] = {} 
    #             if player not in data[year][team]:
    #                 data[year][team][player] = tdata
    #             else:
    #                 e = data[year][team][player]
    #                 for i in tdata:
    #                     e.append(i)
    #                 data[year][team][player] = e
    # TeamAdv: Tm, Year, Hrry%, QBKD%, Prss%, Mtkl
    dir = './NFLData/TeamStats/Defense/Advanced/'
    for filename in os.listdir(dir):
        filepath = os.path.join(dir, filename)
        with open(filepath, 'r', encoding='utf-8') as file:
            adv = pd.read_csv(file)
            filt = adv[['Tm', 'Hrry%', 'QBKD%', 'Prss%', 'MTkl']]
            for index, row in filt.iterrows():
                d = ([f'{col}: {row[col]}' for col in filt.columns]) 
                team = row[0] 
                year = filename[:4]
                tdata = d[1:]
                if year not in data:
                    data[year] = {}
                if team not in data[year]: 
                    data[year][team] = {} 
                data[year][team]['TeamAdv'] = tdata 
    # TeamPass: Rate, Sk, Yds, QBHits, TFL, ANY/A, EXP
    dir = './NFLData/TeamStats/Defense/Passing/'
    for filename in os.listdir(dir):
        filepath = os.path.join(dir, filename)
        with open(filepath, 'r', encoding='utf-8') as file:
            adv = pd.read_csv(file)
            filt = adv[['Tm', 'Rate', 'Sk', 'Yds.1', 'QBHits', 'TFL', 'ANY/A', 'EXP']]
            for index, row in filt.iterrows():
                d = ([f'{col}: {row[col]}' for col in filt.columns]) 
                team = row[0] 
                year = filename[:4]
                tdata = d[1:]
                if year not in data:
                    data[year] = {}
                if team not in data[year]: 
                    data[year][team] = {} 
                data[year][team]['TeamPassRush'] = tdata 
    # TeamRush: Tm, Year, Yds, Y/A, Y/G, EXP
    dir = './NFLData/TeamStats/Defense/Rushing/'
    for filename in os.listdir(dir):
        filepath = os.path.join(dir, filename)
        with open(filepath, 'r', encoding='utf-8') as file:
            adv = pd.read_csv(file)
            filt = adv[['Tm', 'Yds', 'Y/A', 'Y/G', 'EXP']]
            for index, row in filt.iterrows():
                d = ([f'{col}: {row[col]}' for col in filt.columns]) 
                team = row[0] 
                year = filename[:4]
                tdata = d[1:]
                if year not in data:
                    data[year] = {}
                if team not in data[year]: 
                    data[year][team] = {} 
                data[year][team]['TeamRushDef'] = tdata 
    upload(data, './NFLData/TeamNeeds/DT.json')

def lbsop(): 
    data = {} 
    # Std: Player, Team, Year, Pos, Age, Comb, Solo, Awards
    # dir = './NFLData/PlayerStats/Defense/'
    # for filename in os.listdir(dir):
    #     filepath = os.path.join(dir, filename)
    #     with open(filepath, 'r', encoding='utf-8') as file:
    #         adv = pd.read_csv(file)
    #         filt = adv[(adv['Pos'] == 'LB')]
    #         filt = filt[['Player', 'Team', 'Pos', 'Age', 'G', 'GS','Comb', 'Solo', 'Awards']]
    #         for index, row in filt.iterrows():
    #             d = ([f'{col}: {row[col]}' for col in filt.columns])
    #             player = row[0] 
    #             team = row[1] 
    #             year = filename[:4]
    #             tdata = d[2:]
    #             if year not in data:
    #                 data[year] = {}
    #             if team not in data[year]: 
    #                 data[year][team] = {} 
    #             if player not in data[year][team]:
    #                 data[year][team][player] = tdata
    #             else:
    #                 e = data[year][team][player]
    #                 for i in tdata:
    #                     e.append(i)
    #                 data[year][team][player] = e
    # # Adv: Player, Team, Year, Pos, Mtkl%, Hrry, Prss, Sk, Rat, Cmp, Yds/Cmp, Cmp%, TD
    # dir = './NFLData/PlayerStats/AdvDefense/'
    # for filename in os.listdir(dir):
    #     filepath = os.path.join(dir, filename)
    #     with open(filepath, 'r', encoding='utf-8') as file:
    #         adv = pd.read_csv(file)
    #         filt = adv[(adv['Pos'] == 'LB')]
    #         filt = filt[['Player', 'Team', 'MTkl%', 'Hrry', 'Prss', 'Sk', "Rat", 'Cmp', 'Yds/Cmp', 'Cmp%', 'TD']]
    #         for index, row in filt.iterrows():
    #             d = ([f'{col}: {row[col]}' for col in filt.columns])
    #             player = row[0] 
    #             team = row[1] 
    #             year = filename[:4]
    #             tdata = d[2:]
    #             if year not in data:
    #                 data[year] = {}
    #             if team not in data[year]: 
    #                 data[year][team] = {} 
    #             if player not in data[year][team]:
    #                 data[year][team][player] = tdata
    #             else:
    #                 e = data[year][team][player]
    #                 for i in tdata:
    #                     e.append(i)
    #                 data[year][team][player] = e
    # TeamRush: Tm, Year, Yds, TD, Y/A, Y/G, EXP
    dir = './NFLData/TeamStats/Defense/Rushing/'
    for filename in os.listdir(dir):
        filepath = os.path.join(dir, filename)
        with open(filepath, 'r', encoding='utf-8') as file:
            adv = pd.read_csv(file)
            filt = adv[['Tm', 'Yds', 'Y/A', 'Y/G', 'EXP']]
            for index, row in filt.iterrows():
                d = ([f'{col}: {row[col]}' for col in filt.columns]) 
                team = row[0] 
                year = filename[:4]
                tdata = d[1:]
                if year not in data:
                    data[year] = {}
                if team not in data[year]: 
                    data[year][team] = {} 
                data[year][team]['TeamRushDef'] = tdata 
    # TeamPass: Tm, Year, Cmp%, TD, Int, PD, AY/A, Y/C, Y/G, Rate, Sk, Yds, QBHits, TFL, ANY/A, EXP 
    dir = './NFLData/TeamStats/Defense/Passing/'
    for filename in os.listdir(dir):
        filepath = os.path.join(dir, filename)
        with open(filepath, 'r', encoding='utf-8') as file:
            adv = pd.read_csv(file)
            filt = adv[['Tm', 'Cmp%', 'TD', 'Int', 'PD', 'AY/A', 'Y/C', 'Y/G', 'Rate', 'Sk', "Yds.1", 'QBHits', 'TFL', 'ANY/A', 'EXP']]
            for index, row in filt.iterrows():
                d = ([f'{col}: {row[col]}' for col in filt.columns]) 
                team = row[0] 
                year = filename[:4]
                tdata = d[1:]
                if year not in data:
                    data[year] = {}
                if team not in data[year]: 
                    data[year][team] = {} 
                data[year][team]['TeamPass'] = tdata 
    # TeamAdv: Tm ,Year, DADOT, YAC, Hrry%, QBKD%, Prss%, Mtkl 
    dir = './NFLData/TeamStats/Defense/Advanced/'
    for filename in os.listdir(dir):
        filepath = os.path.join(dir, filename)
        with open(filepath, 'r', encoding='utf-8') as file:
            adv = pd.read_csv(file)
            filt = adv[['Tm', 'DADOT', 'YAC', 'Hrry%', 'QBKD%', 'Prss%', 'MTkl']]
            for index, row in filt.iterrows():
                d = ([f'{col}: {row[col]}' for col in filt.columns]) 
                team = row[0] 
                year = filename[:4]
                tdata = d[1:]
                if year not in data:
                    data[year] = {}
                if team not in data[year]: 
                    data[year][team] = {} 
                data[year][team]['TeamAdv'] = tdata 
    upload(data, './NFLData/TeamNeeds/LB.json')

def cbsop():
    data = {} 
    # Std: Player, Team, Year, Pos, FF, FR, PD, Awards
    # dir = './NFLData/PlayerStats/Defense/'
    # for filename in os.listdir(dir):
    #     filepath = os.path.join(dir, filename)
    #     with open(filepath, 'r', encoding='utf-8') as file:
    #         adv = pd.read_csv(file)
    #         filt = adv[(adv['Pos'] == 'CB')]
    #         filt = filt[['Player', 'Team', 'Age', 'Pos', 'FF', 'FR', 'PD', 'Awards']]
    #         for index, row in filt.iterrows():
    #             d = ([f'{col}: {row[col]}' for col in filt.columns])
    #             player = row[0] 
    #             team = row[1] 
    #             year = filename[:4]
    #             tdata = d[2:]
    #             if year not in data:
    #                 data[year] = {}
    #             if team not in data[year]: 
    #                 data[year][team] = {} 
    #             if player not in data[year][team]:
    #                 data[year][team][player] = tdata
    #             else:
    #                 e = data[year][team][player]
    #                 for i in tdata:
    #                     e.append(i)
    #                 data[year][team][player] = e
    # # Adv: Player, Team, Year, Pos, Age, G, GS, Cmp, Cmp%, Rat, Int, Tgt, DADOT, AY/C, Mtkl, Mtkl%, Yds/Cmp
    # dir = './NFLData/PlayerStats/AdvDefense/'
    # for filename in os.listdir(dir):
    #     filepath = os.path.join(dir, filename)
    #     with open(filepath, 'r', encoding='utf-8') as file:
    #         adv = pd.read_csv(file)
    #         filt = adv[(adv['Pos'] == 'CB')]
    #         filt = filt[['Player', 'Team', 'G', 'GS', 'Cmp', 'Cmp%', 'Rat', 'Int', 'Tgt', 'DADOT', 'YAC', 'MTkl', 'MTkl%', 'Yds/Cmp']]
    #         for index, row in filt.iterrows():
    #             d = ([f'{col}: {row[col]}' for col in filt.columns])
    #             player = row[0] 
    #             team = row[1] 
    #             year = filename[:4]
    #             tdata = d[2:]
    #             if year not in data:
    #                 data[year] = {}
    #             if team not in data[year]: 
    #                 data[year][team] = {} 
    #             if player not in data[year][team]:
    #                 data[year][team][player] = tdata
    #             else:
    #                 e = data[year][team][player]
    #                 for i in tdata:
    #                     e.append(i)
    #                 data[year][team][player] = e
    # Pass Team: Tm, Year, Cmp%, TD, Int, PD, AY/A, Y/C, Y/G, Rate, Sk, Yds.1, QBHits, TFL, ANY/A, EXP 
    dir = './NFLData/TeamStats/Defense/Passing/'
    for filename in os.listdir(dir):
        filepath = os.path.join(dir, filename)
        with open(filepath, 'r', encoding='utf-8') as file:
            adv = pd.read_csv(file)
            filt = adv[['Tm', 'Cmp%', 'TD', 'Int', 'PD', 'AY/A', 'Y/C', 'Y/G', 'Rate', 'Sk', "Yds.1", 'QBHits', 'TFL', 'ANY/A', 'EXP']]
            for index, row in filt.iterrows():
                d = ([f'{col}: {row[col]}' for col in filt.columns]) 
                team = row[0] 
                year = filename[:4]
                tdata = d[1:]
                if year not in data:
                    data[year] = {}
                if team not in data[year]: 
                    data[year][team] = {} 
                data[year][team]['TeamPass'] = tdata 
    # Adv Team: Tm, Year, DADOT, YAC, Hrry%, QBKD%, Prss%, Mtkl 
    dir = './NFLData/TeamStats/Defense/Advanced/'
    for filename in os.listdir(dir):
        filepath = os.path.join(dir, filename)
        with open(filepath, 'r', encoding='utf-8') as file:
            adv = pd.read_csv(file)
            filt = adv[['Tm', 'DADOT', 'YAC', 'Hrry%', 'QBKD%', 'Prss%', 'MTkl']]
            for index, row in filt.iterrows():
                d = ([f'{col}: {row[col]}' for col in filt.columns]) 
                team = row[0] 
                year = filename[:4]
                tdata = d[1:]
                if year not in data:
                    data[year] = {}
                if team not in data[year]: 
                    data[year][team] = {} 
                data[year][team]['TeamAdv'] = tdata 
    upload(data, './NFLData/TeamNeeds/CB.json')

def ssop():
    # Std: Player, Team, Year, Pos, FF, FR, PD, Awards
    # Adv: Player, Team, Year, Pos, Age, G, GS, Cmp, Cmp%, Rat, Int, Tgt, DADOT, AY/C, Mtkl, Mtkl%, Yds/Cmp, Comb, Prss, Sk
    # Pass Team: Tm, Year, Cmp%, TD, Int, PD, AY/A, Y/C, Y/G, Rate, Sk, Yds.1, QBHits, TFL, ANY/A, EXP 
    # Adv Team: Tm, Year, DADOT, YAC, Hrry%, QBKD%, Prss%, Mtkl 
    data = {} 
    # Std: Player, Team, Year, Pos, FF, FR, PD, Awards
    # dir = './NFLData/PlayerStats/Defense/'
    # for filename in os.listdir(dir):
    #     filepath = os.path.join(dir, filename)
    #     with open(filepath, 'r', encoding='utf-8') as file:
    #         adv = pd.read_csv(file)
    #         filt = adv[(adv['Pos'] == 'S')]
    #         filt = filt[['Player', 'Team', 'Age', 'Pos', 'FF', 'FR', 'PD', 'Awards']]
    #         for index, row in filt.iterrows():
    #             d = ([f'{col}: {row[col]}' for col in filt.columns])
    #             player = row[0] 
    #             team = row[1] 
    #             year = filename[:4]
    #             tdata = d[2:]
    #             if year not in data:
    #                 data[year] = {}
    #             if team not in data[year]: 
    #                 data[year][team] = {} 
    #             if player not in data[year][team]:
    #                 data[year][team][player] = tdata
    #             else:
    #                 e = data[year][team][player]
    #                 for i in tdata:
    #                     e.append(i)
    #                 data[year][team][player] = e
    # # Adv: Player, Team, Year, Pos, Age, G, GS, Cmp, Cmp%, Rat, Int, Tgt, DADOT, AY/C, Mtkl, Mtkl%, Yds/Cmp
    # dir = './NFLData/PlayerStats/AdvDefense/'
    # for filename in os.listdir(dir):
    #     filepath = os.path.join(dir, filename)
    #     with open(filepath, 'r', encoding='utf-8') as file:
    #         adv = pd.read_csv(file)
    #         filt = adv[(adv['Pos'] == 'S')]
    #         filt = filt[['Player', 'Team', 'G', 'GS', 'Cmp', 'Cmp%', 'Rat', 'Int', 'Tgt', 'DADOT', 'YAC', 'MTkl', 'MTkl%', 'Yds/Cmp', 'Comb', 'Prss', 'Sk']]
    #         for index, row in filt.iterrows():
    #             d = ([f'{col}: {row[col]}' for col in filt.columns])
    #             player = row[0] 
    #             team = row[1] 
    #             year = filename[:4]
    #             tdata = d[2:]
    #             if year not in data:
    #                 data[year] = {}
    #             if team not in data[year]: 
    #                 data[year][team] = {} 
    #             if player not in data[year][team]:
    #                 data[year][team][player] = tdata
    #             else:
    #                 e = data[year][team][player]
    #                 for i in tdata:
    #                     e.append(i)
    #                 data[year][team][player] = e
    # Pass Team: Tm, Year, Cmp%, TD, Int, PD, AY/A, Y/C, Y/G, Rate, Sk, Yds.1, QBHits, TFL, ANY/A, EXP 
    dir = './NFLData/TeamStats/Defense/Passing/'
    for filename in os.listdir(dir):
        filepath = os.path.join(dir, filename)
        with open(filepath, 'r', encoding='utf-8') as file:
            adv = pd.read_csv(file)
            filt = adv[['Tm', 'Cmp%', 'TD', 'Int', 'PD', 'AY/A', 'Y/C', 'Y/G', 'Rate', 'Sk', "Yds.1", 'QBHits', 'TFL', 'ANY/A', 'EXP']]
            for index, row in filt.iterrows():
                d = ([f'{col}: {row[col]}' for col in filt.columns]) 
                team = row[0] 
                year = filename[:4]
                tdata = d[1:]
                if year not in data:
                    data[year] = {}
                if team not in data[year]: 
                    data[year][team] = {} 
                data[year][team]['TeamPass'] = tdata 
    # Adv Team: Tm, Year, DADOT, YAC, Hrry%, QBKD%, Prss%, Mtkl 
    dir = './NFLData/TeamStats/Defense/Advanced/'
    for filename in os.listdir(dir):
        filepath = os.path.join(dir, filename)
        with open(filepath, 'r', encoding='utf-8') as file:
            adv = pd.read_csv(file)
            filt = adv[['Tm', 'DADOT', 'YAC', 'Hrry%', 'QBKD%', 'Prss%', 'MTkl']]
            for index, row in filt.iterrows():
                d = ([f'{col}: {row[col]}' for col in filt.columns]) 
                team = row[0] 
                year = filename[:4]
                tdata = d[1:]
                if year not in data:
                    data[year] = {}
                if team not in data[year]: 
                    data[year][team] = {} 
                data[year][team]['TeamAdv'] = tdata 
        upload(data, './NFLData/TeamNeeds/S.json')


def clean_nfl():
    directory = './NFLData/TeamNeeds/'
    for filename in os.listdir(directory):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as file:
            olddata = json.load(file)
            newdata = {}
            for year, y in olddata.items():
                newdata[year] = {} 
                for team, t in y.items():
                    newdata[year][team] = {} 
                    for player, p in t.items():
                        for row in p:
                            l, v = row.split(':')
                            if l == 'Pos' or l == 'Awards':
                                if v == ' nan':
                                    v = None
                            else:
                                if(v == ' nan' or v == None):
                                    v = 0 
                                else:
                                    if '%' in v:
                                        v = v.replace('%', '')
                                    v = float(v)
                            newdata[year][team][f'{player}_{l}'] = v

            newdir = f'./NFLData/CleanedNFL_1/{filename}'
            upload(newdata, newdir)
                            
                
    # print(types)

def organize_nfl():
    directory = './NFLData/CleanedNFL/'
    for filename in os.listdir(directory):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as file: 
            olddata = json.load(file)
            # df = pd.json_normalize(olddata, sep='_')
            # team_data = olddata['2018']['DAL']
            # player_df = pd.json_normalize(team_data, sep='_').T
            for year, y in olddata.items():
                for team, t in y.items():
                    # players = {player: stats for player, stats in t.items() if 'GS' in stats}
                    players = {} 
                    for player, stats in t.items():
                        if 'GS' in stats:
                            players[player] = stats
                    print(players)
                    df_players = pd.DataFrame.from_dict(players, orient='index')
                    df_sorted = df_players.sort_values(by='GS', ascending=False)
                    print(df_sorted)

def populate_tables():
    directory = './NFLData/CleanedNFL/'
    for filename in os.listdir(directory):
        filepath = os.path.join(directory, filename)
        print(filepath[:-5])


                        

# qbsop()
# rbsop()
# wrsop()
# tesop()
# olsop()
# desop()
# dtsop()
# lbsop()
# cbsop()
# ssop()
# clean_nfl()
# organize_nfl()
populate_tables()