# column headers profile: ['id', 'name', 'position', 'school', 'years_ncaa', 'year_drafted', 'draft_round', 'draft_pick', 'career_av']
# column headers passing: ['id', 'year', 'team', 'conference', 'games', 'cmp', 'att', 'comp_pct', 'yds', 'td', 'td_pct', 'int', 'int_pct', 'adj_yds', 'adj_yds_att', 'yds_carr', 'yds_g', 'ratings', 'awards', 'playerid_id']

from supabase import create_client, Client
import pandas as pd 
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error
import numpy as np 
import matplotlib.pyplot as plt 
from joblib import dump 

SUPABASE_URL = 'https://pvuzvnemuhutrdmpchmi.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2dXp2bmVtdWh1dHJkbXBjaG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0MDcwNzgsImV4cCI6MjA0ODk4MzA3OH0.fB_b1Oe_2ckp9FGh6vmEs2jIRHjdDoaqzHVsM8NRZRY'

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def load_data():
    profile_res = supabase.table('db_playerprofile').select('*').eq('position', 'QB').execute()
    profile_data = pd.DataFrame(profile_res.data)
    # print(len(profile_data))

    passStats_res = supabase.table('db_passingleaders').select('*').execute()
    passing_data = pd.DataFrame(passStats_res.data)
    # print(len(passing_data))

    data = pd.merge(profile_data, passing_data, left_on='id', right_on='playerid_id', how='inner')
    # print(data.head())
    return data 


def fix_missing(data):
    numeric_cols = data.select_dtypes(include=['float64', 'int64']).columns
    data[numeric_cols] = data[numeric_cols].fillna(data[numeric_cols].median())

    categorical_columns = data.select_dtypes(include=['object']).columns
    data[categorical_columns] = data[categorical_columns].fillna("N/A")

    return data 

def plot(y_test, y_pred):
    plt.figure(figsize=(10, 6))
    plt.scatter(y_test, y_pred, alpha=0.7)
    plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], '--r', linewidth=2)  # Line of perfect prediction
    plt.xlabel('Actual Values')
    plt.ylabel('Predicted Values')
    plt.title('Predicted vs Actual Values')
    plt.show()

def show_results_table(y_test, y_pred):
    results_df = pd.DataFrame({
        'Actual': y_test.values, 
        'Predicted': y_pred, 
        'Diff': y_test.values - y_pred
    })
    # print(results_df.head())
    results_df.to_csv('./data/predicted_vs_actual.csv')

# use "from joblib import load" to load model again. 
def save_model(randomforest):
    dump(randomforest, 'random_forest_model.joblib')
    print('saved model!')

if __name__ == '__main__':
    data = load_data()
    relevant_cols = ['school', 'conference', 'draft_round', 'draft_pick', 'career_av', 'games', 'cmp', 'att', 'comp_pct', 'yds', 'td', 'int', 'int_pct', 'adj_yds', 'adj_yds_att', 'yds_carr', 'yds_g', 'ratings']
    data = data[relevant_cols]

    data = pd.get_dummies(data, columns=['school', 'conference'], drop_first=True)

    data = fix_missing(data)

    X = data.drop(columns=['career_av'])
    y = data['career_av']

    X['draft_round'] = X['draft_round'].replace("N/A", np.nan).astype(float)

    X = X.apply(pd.to_numeric, errors='coerce')
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print(len(y_train))
    print(len(y_test))

    randomforest = RandomForestRegressor(n_estimators=100, random_state=42)
    randomforest.fit(X_train, y_train)

    y_pred = randomforest.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    print(f'MSE: {mse}')

    # plot(y_test, y_pred)
    # show_results_table(y_test, y_pred)

    save_model(randomforest)




