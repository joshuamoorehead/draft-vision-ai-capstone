import json
import os 
import pandas as pd
import django
import sys
import numpy as np 


#lines 10-12 let you use the db.models part. 
from django.db.models import Q
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "dv.settings")
django.setup()

from db.models import NFLQBTeam, NFLRBTeam, NFLWRTeam, NFLTETeam, NFLOLTeam, NFLDETeam, NFLDTTeam, NFLLBTeam, NFLCBTeam, NFLSTeam          


def upload():
    positions = {
        'QB': NFLQBTeam, 
        'RB': NFLRBTeam, 
        'WR': NFLWRTeam, 
        'TE': NFLTETeam, 
        'OL': NFLOLTeam, 
        'DE': NFLDETeam, 
        'DT': NFLDTTeam, 
        'LB': NFLLBTeam, 
        'CB': NFLCBTeam, 
        'S': NFLSTeam
    }
    directory = './NFLData/CleanedNFL/'
    for filename in os.listdir(directory):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as file:
            data = json.load(file)
            position = filename[:-5]
            for year, y1 in data.items():
                for team, t1 in y1.items():
                    items = []
                    items.append(year)
                    items.append(team) 
                    for stat, val in t1.items():
                        items.append(val)
                
                    fields= [field.name for field in positions[position]._meta.get_fields()]
                    playerdata = {fields[i+1]: items[i] for i in range(len(items))}
                    obj, created = positions[position].objects.get_or_create(**playerdata)
                    if created:
                        print(f'{position} for {obj.team} in {obj.year}created!')

def upload_y(df):
    positions = {
        'QB': NFLQBTeam, 
        'RB': NFLRBTeam, 
        'WR': NFLWRTeam, 
        'TE': NFLTETeam, 
        'OL': NFLOLTeam, 
        'DE': NFLDETeam, 
        'DT': NFLDTTeam, 
        'LB': NFLLBTeam, 
        'CB': NFLCBTeam, 
        'S': NFLSTeam
    }

    for index, row in df.iterrows():
        team = row['Team']
        pos = row['Position'] 
        investment = row['Z-Score']
        year = row['Year']
        # print(f'{pos} {year} {team} {investment}')
        try:
            dbrow = positions[pos].objects.get(year=year, team=team)
            dbrow.offseasoninvestment = investment
            dbrow.save()
            print(f'{pos} {year} {team} found successfully!')
        except:
            print(f'unable to find {pos} {year} {team} {investment}')


def normalize_y():
    directory = './NFLData/offseasoninvestment/final_investment.json'
    with open(directory, 'r') as file:
        data = json.load(file)

    investments = [] 
    for team, y1 in data.items():
        for year, p1 in y1.items():
            for position, investment in p1.items():
                investments.append({'Team': team, 'Year': (int(year) - 1), 'Position': str(position), 'Investment': investment})
    
    # calculating Z-Score 
    df = pd.DataFrame(investments)
    df['Z-Score'] = np.nan

    groups = df.groupby(['Year', 'Position'])
    for (year, position), group in groups:
        inv = group['Investment'] 
        mean_investment = inv.mean()
        std_investment = inv.std()

        for index in group.index:
            if std_investment == 0:
                df.at[index, 'Z-Score'] = 0
            else:
                df.at[index, 'Z-Score'] = (df.at[index, 'Investment'] - mean_investment) / std_investment

    upload_y(df)
    # print(df)
    
    # INTERPRETING: A Z score > 1 == high investment, Z < -1 Means Low Investment, Z = 0 means average. 



# upload()
normalize_y()
# upload_y()