from supabase import create_client, Client
import pandas as pd 
from joblib import load 


SUPABASE_URL = 'https://pvuzvnemuhutrdmpchmi.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2dXp2bmVtdWh1dHJkbXBjaG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0MDcwNzgsImV4cCI6MjA0ODk4MzA3OH0.fB_b1Oe_2ckp9FGh6vmEs2jIRHjdDoaqzHVsM8NRZRY'

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def prep_data():
    pass
#modular neural network will include: 
#combine, conferences, defensivepositionalstats, historicalteamsuccess, passing leaders, rbstats, recstats, teamdefense, teamoffense, teamratings, teamsuccess



if __name__ == '__main__':
    data = prep_data()