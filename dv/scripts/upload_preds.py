import pandas as pd 
import django
import sys 
import os
import numpy as np 
from django.db.models import Q
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "dv.settings")
django.setup()
from db.models import TeamNeeds

def upload(df):
    for index, row in df.iterrows():
        obj, created = TeamNeeds.objects.get_or_create(
            team = row['Team'], 
            year = row['Year'], 
            qb_sop = row['QB'], 
            rb_sop = row['RB'], 
            wr_sop = row['WR'], 
            te_sop = row['TE'], 
            ol_sop = row['OL'], 
            de_sop = row['DE'], 
            dt_sop = row["DT"], 
            lb_sop = row['LB'], 
            cb_sop = row['CB'], 
            s_sop = row['S']
        )
        if created:
            print(f'{obj.team} created successfully!')


if __name__ == '__main__':
    directory = './NFLData/atemp/'
    data = pd.DataFrame(columns=['Team', 'Year', 'QB', 'RB', 'WR', 'TE','OL', 'DE', 'DT', 'LB', 'CB', 'S'])
    for filename in os.listdir(directory):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as file:
            f = pd.read_csv(file)
            df = f[['team', 'year', 'prediction']]
            data['Team'], data['Year'] = df['team'], df['year']
            position = filename[:-4]
            for ind, row in df.iterrows():
                data.loc[(data['Team'] == row['team']) & (data['Year'] == row['year']), position] = row['prediction']

    # upload this to supabase 
    # print(data)
    upload(data)

    
    
            