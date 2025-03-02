from supabase import create_client, Client
import pandas as pd 
import numpy as np 
from joblib import load, dump
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
# from sklearn.linear_model import LinearRegression
import seaborn as sns
import matplotlib.pyplot as plt

SUPABASE_URL = 'https://pvuzvnemuhutrdmpchmi.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2dXp2bmVtdWh1dHJkbXBjaG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0MDcwNzgsImV4cCI6MjA0ODk4MzA3OH0.fB_b1Oe_2ckp9FGh6vmEs2jIRHjdDoaqzHVsM8NRZRY'

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
pd.set_option('future.no_silent_downcasting', True)

def prep_data(pos):
    profile_res = supabase.table('db_playerprofile').select('*').in_('position', pos).execute()
    profile_data = pd.DataFrame(profile_res.data)
    return profile_data

def display(y_test, y_pred):
    print(classification_report(y_test, y_pred))
    acc = accuracy_score(y_test, y_pred)
    print(f'Accuracy: {acc}')

def collect_data(id, teamid, year, positions):

    conference = supabase.table('db_ncaateams').select('conference_id_id').eq('id', teamid).execute()
    confid = conference.data[0]['conference_id_id']
    
    combine_data = supabase.table('db_combine').select(
    "height, weight, forty, vertical, bench, broadjump, threecone, shuttle"
    ).eq('playerid_id', id).execute()
    combine_data = pd.DataFrame(combine_data.data)



    # Ensure missing values (NaN) in combine_data are filled with column means (or 0 if no mean exists)
    if not combine_data.empty:
        for col in combine_data.columns:
            if combine_data[col].isna().any():  
                mean_value = combine_data[col].mean()
                default_value = 0  

                # Fill NaNs with mean, but if mean is NaN, use 0
                combine_data[col] = combine_data[col].fillna(mean_value if not np.isnan(mean_value) else default_value).infer_objects(copy=False)

    conferences_data = supabase.table('db_conferences').select(
        "bowl_winpct, SRS, AP_finishes, to, founded"
    ).eq('id', confid).execute()
    conferences_data = pd.DataFrame(conferences_data.data)

    teamratings_data = supabase.table('db_teamratings').select(
        "AP_Rank, osrs, dsrs, year"
    ).eq('team_id', teamid).eq('year', year).execute()
    teamratings_data = pd.DataFrame(teamratings_data.data)

    # Fill only NaN values in AP_Rank with 50 
    if "AP_Rank" in teamratings_data.columns:
        teamratings_data["AP_Rank"] = teamratings_data["AP_Rank"].fillna(50).infer_objects(copy=False)

    # fix: height, AP_finishes. update conferences_data to include just bowl winpct, SRS, ap_finishes
    feet, inches = str(combine_data['height'].iloc[0]).split('-')
    combine_data['height'] = int((int(feet) * 12) + int(inches))
    years = min((conferences_data['to'].iloc[0] - conferences_data['founded'].iloc[0]), 30)
    conferences_data['AP_finishes'] = int(conferences_data['AP_finishes'].iloc[0] / years)
    conferences_data = conferences_data[['AP_finishes', 'bowl_winpct', 'SRS']]
    
    if 'QB' in positions:
        positional_data = supabase.table('db_passingleaders').select(
            "adj_yds_att, int_pct, ratings"
        ).eq('playerid_id', id).eq('year', year).execute()
        positional_data = pd.DataFrame(positional_data.data)
        return pd.concat([combine_data, conferences_data, positional_data, teamratings_data], axis=1)
    elif 'RB' in positions:
        positional_data = supabase.table('db_rbstats').select('rush_ypg, rec_ypg, rush_td').eq('playerid_id', id).eq('year', year).execute()
        positional_data = pd.DataFrame(positional_data.data)
        return pd.concat([combine_data, conferences_data, positional_data, teamratings_data], axis=1)
    elif 'WR' in positions:
        positional_data = supabase.table('db_recstats').select('ypg, rec, tot_td').eq('playerid_id', id).eq('year', year).execute()
        positional_data = pd.DataFrame(positional_data.data)
        return pd.concat([combine_data, conferences_data, positional_data, teamratings_data], axis=1)
    elif 'OL' in positions:
        return pd.concat([combine_data, conferences_data, teamratings_data], axis=1)
    elif 'DL' in positions:
        positional_data = supabase.table('db_defensivepositionalstats').select('TFL, sacks, hur, tot').eq('playerid_id', id).eq('year', year).execute()
        positional_data = pd.DataFrame(positional_data.data)
        return pd.concat([combine_data, conferences_data, positional_data, teamratings_data], axis=1)
    elif 'LB' in positions:
        positional_data = supabase.table('db_defensivepositionalstats').select('TFL, sacks, hur, tot, solo').eq('playerid_id', id).eq('year', year).execute()
        positional_data = pd.DataFrame(positional_data.data)
        return pd.concat([combine_data, conferences_data, positional_data, teamratings_data], axis=1)
    elif 'DB' in positions:
        positional_data = supabase.table('db_defensivepositionalstats').select('tot, solo, pd').eq('playerid_id', id).eq('year', year).execute()
        positional_data = pd.DataFrame(positional_data.data)
        return pd.concat([combine_data, conferences_data, positional_data, teamratings_data], axis=1)
    else:
        return None

# def process_player(player):

def save_model(rf, name):
    dump(rf, f'./data/savedmodels/{name}.joblib')
    # dump(X_train.columns, './model/training_cols.joblib')
    print('saved model!')

def process_qb():
    data = prep_data()
    X = pd.DataFrame()
    y = []
    buckets = {
        2: 1, 
        4: 2, 
        12: 3
    }

    for ind, player in data.iterrows():
        try: 
            lastseason = int(player['year_drafted'] - 1)
            player_data = collect_data(int(player['id']), int(player['schoolid_id']), lastseason)
            if isinstance(player_data, pd.Series):
                player_data = player_data.to_frame().T
            if not player_data.empty and player_data.notna().all().any():
                X = pd.concat([X, player_data], ignore_index=True)            
            draft_round = player['draft_round']
            for b in buckets:
                if draft_round <= b:
                    y.append(buckets[b])
                    break
        except:
            print(f'could not add {player["name"]}')
    
    y = pd.DataFrame(y)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    rf = RandomForestClassifier(n_estimators=500, random_state=42)
    rf.fit(X_train, y_train)

    save_model(rf, 'QB')
    y_pred = rf.predict(X_test)
    display(y_test, y_pred)
    
def populate_x_y(data, positions):
    nulls = 0 
    X, y = pd.DataFrame(), []
    buckets = {
        2: 1, 
        4: 2, 
        12: 3
    }
    for ind, player in data.iterrows():
        # print(f'y: {len(y)} x: {len(X)}') 
        # print(X)
        # print(y)
        try: 
            lastseason = int(player['year_drafted'] - 1)
            player_data = collect_data(int(player['id']), int(player['schoolid_id']), lastseason, positions)
            if isinstance(player_data, pd.Series):
                player_data = player_data.to_frame().T
            if not player_data.empty:
                X = pd.concat([X, player_data], ignore_index=True)
            draft_round = player['draft_round']
            for b in buckets:
                if draft_round <= b:
                    y.append(buckets[b])
                    break
        except:
            # print(f'could not add {player["name"]}')
            nulls += 1
            continue 

    print(f'nulls: {nulls}')

            
    print(len(y))
    print(len(X))
    # y = pd.DataFrame(y)
    return X, y

def create_model(X, y, positions):
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    rf = RandomForestClassifier(n_estimators=500, random_state=42)
    rf.fit(X_train, y_train)

    save_model(rf, positions[0])
    y_pred = rf.predict(X_test)
    display(y_test, y_pred)

def process_pos(positions):
    data = prep_data(positions)
    X, y = populate_x_y(data, positions)
    create_model(X, y, positions)



def test_qb():
    data = prep_data()
    player = data.iloc[0]
    lastseason = int(player['year_drafted'] - 1)
    player_data = collect_data(int(player['id']), int(player['schoolid_id']), lastseason)
    print(player_data)

if __name__ == '__main__':
    positions = [['OL', 'OT', 'T', 'C', 'G', 'OG'], ['DL', 'DE', 'DT', 'NT'], ['LB', 'ILB', 'OLB'], ['DB', 'CB', 'S']]
    positions = [['QB'], ['RB'], ['WR', 'TE']]
    for p in positions:
        process_pos(p)
    



    