from supabase import create_client, Client
import pandas as pd 
import numpy as np 
from joblib import load, dump
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report, mean_absolute_error, mean_squared_error
# from sklearn.linear_model import LinearRegression
import seaborn as sns
import matplotlib.pyplot as plt
import os 
import sys
import django 
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "dv.settings")
django.setup()
from db.models import predictions_2024
from dotenv import load_dotenv
load_dotenv()

SUPABASE_URL = os.getenv('REACT_APP_SUPABASE_URL')
SUPABASE_KEY = os.getenv('REACT_APP_SUPABASE_KEY')
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
pd.set_option('future.no_silent_downcasting', True)


def save_model(rf, name):
    dump(rf, f'./data/savedmodelsXAV/{name}.joblib')
    print('saved model!')

def display(y_test, y_pred):
    mse = mean_squared_error(y_test, y_pred)
    print(f'MSE: {mse}')
    mae = mean_absolute_error(y_test, y_pred)
    print(f'MAE: {mae}')


def prep_data(pos, years):
    # years = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023]
    profile_res = supabase.table('db_playerprofile').select('*').in_('position', pos).in_('year_drafted', years).execute()
    profile_data = pd.DataFrame(profile_res.data)
    return profile_data

def collect_data(id, teamid, year, positions, draftround):
    conference = supabase.table('db_ncaateams').select('conference_id_id').eq('id', teamid).execute()
    confid = conference.data[0]['conference_id_id']

    conferences_data = supabase.table('db_conferences').select("bowl_winpct, SRS, AP_finishes, to, founded").eq('id', confid).execute()
    conferences_data = pd.DataFrame(conferences_data.data)
    years = min((conferences_data['to'].iloc[0] - conferences_data['founded'].iloc[0]), 30)
    conferences_data['AP_finishes'] = int(conferences_data['AP_finishes'].iloc[0] / years)
    conferences_data = conferences_data[['AP_finishes', 'bowl_winpct', 'SRS']]


    teamratings_data = supabase.table('db_teamratings').select("AP_Rank, osrs, dsrs, wins, losses").eq('team_id', teamid).eq('year', year).execute()
    teamratings_data = pd.DataFrame(teamratings_data.data)

    round = pd.DataFrame([[draftround]], columns=['round'])

    if "AP_Rank" in teamratings_data.columns:
        teamratings_data["AP_Rank"] = teamratings_data["AP_Rank"].fillna(50).infer_objects(copy=False)



    if 'QB' in positions:
        positional_data = supabase.table('db_passingleaders').select(
            "adj_yds_att, int_pct, ratings, awards"
        ).eq('playerid_id', id).eq('year', year).execute()
        positional_data = pd.DataFrame(positional_data.data)
        if pd.isna(positional_data['awards'].iloc[0]):
            positional_data['awards'] = 0
        else:
            positional_data['awards'] = 1 
        return pd.concat([conferences_data, positional_data, teamratings_data, round], axis=1)
    elif 'RB' in positions:
        positional_data = supabase.table('db_rbstats').select('rush_ypg, rec_ypg, rush_td, awards').eq('playerid_id', id).eq('year', year).execute()
        positional_data = pd.DataFrame(positional_data.data)
        if pd.isna(positional_data['awards'].iloc[0]):
            positional_data['awards'] = 0
        else:
            positional_data['awards'] = 1 
        return pd.concat([conferences_data, positional_data, teamratings_data, round], axis=1)
    elif 'WR' in positions:
        positional_data = supabase.table('db_recstats').select('ypg, rec, tot_td, awards').eq('playerid_id', id).eq('year', year).execute()
        positional_data = pd.DataFrame(positional_data.data)
        if pd.isna(positional_data['awards'].iloc[0]):
            positional_data['awards'] = 0
        else:
            positional_data['awards'] = 1 
        return pd.concat([conferences_data, positional_data, teamratings_data, round], axis=1)
    elif 'OL' in positions:
        return pd.concat([conferences_data, teamratings_data, round], axis=1)
    elif 'DL' in positions:
        # positional_data = supabase.table('db_defensivepositionalstats').select('TFL, sacks, hur, tot').eq('playerid_id', id).eq('year', year).execute()
        # positional_data = pd.DataFrame(positional_data.data)
        return pd.concat([conferences_data, teamratings_data, round], axis=1)
    elif 'LB' in positions:
        positional_data = supabase.table('db_defensivepositionalstats').select('TFL, sacks, hur, tot, solo').eq('playerid_id', id).eq('year', year).execute()
        positional_data = pd.DataFrame(positional_data.data)
        return pd.concat([conferences_data, positional_data, teamratings_data, round], axis=1)
    elif 'DB' in positions:
        positional_data = supabase.table('db_defensivepositionalstats').select('tot, solo, pd').eq('playerid_id', id).eq('year', year).execute()
        positional_data = pd.DataFrame(positional_data.data)
        return pd.concat([conferences_data, positional_data, teamratings_data, round], axis=1)
    else:
        return None

def populate_X(data, positions): 
    nulls = 0 
    X = pd.DataFrame()
    names = [] 
    for ind, player in data.iterrows():
        try: 
            lastseason = int(player['year_drafted'] - 1)
            player_data = collect_data(int(player['id']), int(player['schoolid_id']), lastseason, positions, player['draft_round'])
            if isinstance(player_data, pd.Series):
                player_data = player_data.to_frame().T
            if not player_data.empty:
                X = pd.concat([X, player_data], ignore_index=True)
            
            name = player['name'] 
            names.append(name)
        except:
            nulls += 1
            continue 

    print(f'nulls: {nulls}')        
    print(len(X))

    return X, names
def populate_x_y(data, positions):
    nulls = 0 
    X, y = pd.DataFrame(), []

    for ind, player in data.iterrows():
        # print(X.columns)
        try: 
            while len(X) != len(y):
                if len(X) > len(y):
                    X = X.iloc[:-1]
                elif len(y) > len(X):
                    y.pop()
            lastseason = int(player['year_drafted'] - 1)
            player_data = collect_data(int(player['id']), int(player['schoolid_id']), lastseason, positions, player['draft_round'])
            if isinstance(player_data, pd.Series):
                player_data = player_data.to_frame().T
            if not player_data.empty:
                X = pd.concat([X, player_data], ignore_index=True)
            years_pro = min(4, 2023-lastseason)
            
            ydata = (player['career_av'] / years_pro)
            y.append(ydata)



        except:
            nulls += 1
            continue 

    print(f'nulls: {nulls}')        
    print(len(y))
    print(len(X))

    return X, y

def create_model(X, y, positions):
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    rf = RandomForestRegressor(n_estimators=500, random_state=42)
    rf.fit(X_train, y_train)

    save_model(rf, positions[0])
    y_pred = rf.predict(X_test)
    display(y_test, y_pred)
"""
test model. will be used to collect data for QB to amke sure we have it right. 
"""
def test_model():
    position = ['RB']
    data = prep_data(position)
    player = data.iloc[0]
    print(player['name'])
    lastseason = int(player['year_drafted'] - 1)
    player_data = collect_data(int(player['id']), int(player['schoolid_id']), lastseason, position, player['draft_round'])
    print(player_data)
    years_pro = min(4, 2023-lastseason)
    print(years_pro)
    y = player['career_av'] / years_pro

def process(positions):
    years = [2023]
    data = prep_data(positions, years)
    # print(len(data))
    X, y = populate_x_y(data, positions)
    create_model(X, y, positions)

def predict_2024(positions):
    year = [2024]
    data = prep_data(positions, year)
    print(len(data))
    print('populating data')
    X, names = populate_X(data, positions)
    print(f'loading {positions[0]} model')
    model = load(f'./data/savedmodelsXAV/{positions[0]}.joblib')
    # print(X.columns)
    y_pred = model.predict(X)
    res = pd.DataFrame({
        'name': names, 
        'prediction 2024': y_pred
    })
    res.to_csv(f'./data/xavPredictions/2024{positions[0]}pred.csv')

def load_into_supa(): 
    directory = './data/xavPredictions/'
    for filename in os.listdir(directory):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as file:
            data = pd.read_csv(file)
            for ind, row in data.iterrows():
                name = row['name']
                prediction = round(row['prediction 2024'], 2)
                id = supabase.table('db_playerprofile').select('id').eq('name', name).execute()
                player_id = id.data
                playerid = ((id.data)[0]['id'])
                obj, created = predictions_2024.objects.get_or_create(
                    xAV = prediction, 
                    player_id = playerid
                )
                if created:
                    print(f'{name} created successfully')


# Index(['AP_finishes', 'bowl_winpct', 'SRS', 'TFL', 'sacks', 'hur', 'tot', 'AP_Rank', 'osrs', 'dsrs', 'wins', 'losses', 'round']
# Index(['AP_finishes', 'bowl_winpct', 'SRS', 'AP_Rank', 'osrs', 'dsrs', 'wins', 'losses', 'round']
if __name__ == '__main__':
    # positions = [['RB'], ['WR', 'TE'], ['LB', 'ILB', 'OLB'], ['DB', 'CB', 'S']]
    # for p in positions:
    #     process(p)
    # positions = ['DL', 'DE', 'DT', 'NT']
    # # process(positions)
    # positions = [['DL', 'DE', 'DT', 'NT'], ['LB', 'ILB', 'OLB'], ['DB', 'CB', 'S']]
    # for p in positions:
    #     predict_2024(p)
    load_into_supa()