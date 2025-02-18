from supabase import create_client, Client
import pandas as pd 
from joblib import load 
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression, HuberRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error
from joblib import dump
from sklearn.preprocessing import StandardScaler, PolynomialFeatures
from sklearn.dummy import DummyRegressor


SUPABASE_URL = 'https://pvuzvnemuhutrdmpchmi.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2dXp2bmVtdWh1dHJkbXBjaG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0MDcwNzgsImV4cCI6MjA0ODk4MzA3OH0.fB_b1Oe_2ckp9FGh6vmEs2jIRHjdDoaqzHVsM8NRZRY'

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# all the data is ready. Pull DB, create a model, then predict. avoid 2024. 
def prep_data(position):
    data = supabase.table(f'db_nfl{position.lower()}team').select('*').in_('year', [2018, 2019, 2020, 2021, 2022, 2023]).execute()
    df = pd.DataFrame(data.data)
    return df 

def save_model(position, randomforest, X_train):
    dump(randomforest, f'./NFLData/TeamNeedsModels/{position}.joblib')
    # dump(X_train)
    print('saved model!')

def predict(): 
    positions = ['QB', 'RB', 'WR', 'TE', 'OL', 'DE', 'DT', 'LB', 'CB', 'S']
    for position in positions: 
        data = prep_data(position)
        bins = [-float('inf'), -1, 1, float('inf')]
        labels = [-1, 0, 1]

        X = data.drop(columns=['id', 'year', 'team', 'offseasoninvestment'])
        data['investment_category'] = pd.cut(data['offseasoninvestment'], bins=bins, labels=labels)
        y = data['investment_category']

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        poly = PolynomialFeatures(degree=2, interaction_only=True, include_bias=False)
        X_train_poly = poly.fit_transform(X_train)
        X_test_poly = poly.transform(X_test)

        randomforest = RandomForestRegressor(n_estimators=1000, random_state=42)
        randomforest.fit(X_train_poly, y_train)

        y_pred = randomforest.predict(X_test_poly)
        mse = mean_squared_error(y_test, y_pred)
        print(f'MSE: {mse}')

        save_model(position, randomforest, X_train)

def prep_predict(position):
    data = supabase.table(f'db_nfl{position.lower()}team').select('*').eq('year', 2024).execute()
    df = pd.DataFrame(data.data)
    return df 

if __name__ == '__main__':
    positions = ['QB', 'RB', 'WR', 'TE', 'OL', 'DE', 'DT', 'LB', 'CB', 'S']
    for position in positions: 
        data = prep_predict(position)
        X = data.drop(columns=['id', 'year', 'team', 'offseasoninvestment'])
        teams = data['team']
        years = data['year']
        model = load(f'./NFLData/TeamNeedsModels/{position}.joblib')

        poly = PolynomialFeatures(degree=2, interaction_only=True, include_bias=False)
        X_poly = poly.fit_transform(X)
        y_pred = model.predict(X_poly)



        res = pd.DataFrame({
            'team': teams,
            'year': years,
            'prediction': y_pred 
        })
        res.to_csv(f'./NFLData/atemp/{position}.csv')