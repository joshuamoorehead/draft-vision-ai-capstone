# predicting the success of the 2024 class. 

from supabase import create_client, Client
import pandas as pd 
from joblib import load 

from dotenv import load_dotenv
import os 
load_dotenv()

SUPABASE_URL = os.getenv('REACT_APP_SUPABASE_URL')
SUPABASE_KEY = os.getenv('REACT_APP_SUPABASE_KEY')
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def prep_data():
    profile_res = supabase.table('db_playerprofile').select('*').eq('year_drafted',2024).eq('position', 'QB').execute()
    profile_data = pd.DataFrame(profile_res.data)
    # print(len(profile_data))

    passStats_res = supabase.table('db_passingleaders').select('*').eq('year', 2023).execute()
    passing_data = pd.DataFrame(passStats_res.data)
    # print(len(passing_data))

    data = pd.merge(profile_data, passing_data, left_on='id', right_on='playerid_id', how='inner')
    # print(data.head())
    relevant_cols = ['school', 'name', 'conference', 'draft_round', 'draft_pick', 'career_av', 'games', 'cmp', 'att', 'comp_pct', 'yds', 'td', 'int', 'int_pct', 'adj_yds', 'adj_yds_att', 'yds_carr', 'yds_g', 'ratings']
    data = data[relevant_cols]
    data = pd.get_dummies(data, columns=['school', 'conference'], drop_first=True)

    return data 

if __name__ == '__main__':
    data = prep_data()
    cols = load('./model/training_cols.joblib')

    X = data.drop(columns=['career_av', 'name'])
    X_aligned = X.reindex(columns=cols, fill_value=0)
    y = data['career_av']
    names = data['name']

    model = load('./model/random_forest_model.joblib')
    y_pred = model.predict(X_aligned)
    
    i = 0
    res = pd.DataFrame({
        'name': names, 
        'prediction 2024': y_pred
    })
    res.to_csv('./model/2024pred.csv')