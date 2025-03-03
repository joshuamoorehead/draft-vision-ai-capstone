from supabase import create_client, Client
import pandas as pd 
from joblib import load 

from dotenv import load_dotenv
import os 
load_dotenv()

SUPABASE_URL = os.getenv('REACT_APP_SUPABASE_URL')
SUPABASE_KEY = os.getenv('REACT_APP_SUPABASE_KEY')
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

import numpy as np 
import torch 
import torch.nn as nn 
import torch.nn.functional as F


#this code returns a tensor of a player's combine data. 
#player parameter is the player's id. 
def prep_combine(player):
    data = (supabase.table('db_combine').select('height', 'weight', 'forty', 'vertical', 'bench', 'broadjump', 'threecone', 'shuttle').eq('playerid_id', player).execute()).data[0]

    order = ['height', 'weight', 'forty', 'vertical', 'bench', 'broadjump', 'threecone', 'shuttle']
    feet, inches = data['height'].split('-')
    data['height'] = (int(feet) * 12) + int(inches) 

    data_arr_uncleaned = np.column_stack([data[feat] for feat in order])
    data_arr = [0.0 if x is None else x for x in data_arr_uncleaned]

    data_arr = np.array(data_arr, dtype=np.float32)
    tensor = torch.tensor(data_arr, dtype=torch.float32)

    print(f'Tensor shape: {tensor.shape}')

    return tensor


def prep_historical_team_success(teamid):
    team = (supabase.table('db_historicalteamsuccess').select('pct', 'conference_wins', 'bowl_wins', 'SRS', 'SOS', 'years_in_final_AP', 'conference_championships').eq('team_id', teamid).execute()).data[0]
    order = ['pct', 'conference_wins', 'bowl_wins', 'SRS', 'SOS', 'years_in_final_AP', 'conference_championships']
    data_arr_uncleaned = np.column_stack([team[feat] for feat in order])
    data_arr = [0.0 if x is None else x for x in data_arr_uncleaned]
    data_arr = np.array(data_arr, dtype=np.float32)
    tensor = torch.tensor(data_arr, dtype=torch.float32)

    print(tensor.shape)
    return tensor
    # print(type(team))

def prep_passing(player): 
    pass 

def prep_conferences(conference):
    pass

def prep_defensive_stats(playerid):
    pass

def prep_rbstats(playerid):
    pass

def prep_wrstats(playerid):
    pass

def prep_teamdefense(teamid):
    pass

def prep_teamoffense(teamid):
    pass

def prep_teamratings(teamid):
    pass

def prep_teamsuccess(teamid):
    pass


def prep_data():
    profiles = supabase.table('db_playerprofile').select('id', 'position', 'years_ncaa', 'draft_round', 'draft_pick', 'career_av', 'age_drafted', 'schoolid_id').eq('position', 'QB').execute()
    
    for player in profiles.data:
        # print(player['id'])
        # combine_data = prep_combine(player['id'])
        teamhistory = prep_historical_team_success(player['schoolid_id'])
        # print(combine_data)
        
#modular neural network will include: 
#combine, conferences, defensivepositionalstats, historicalteamsuccess, passing leaders, rbstats, recstats, teamdefense, teamoffense, teamratings, teamsuccess
#preparing data: no need to overcomplicate string stuff, I think I can just use the ID's. 

class CombineModule(nn.Module):
    # input_dim = size of input vector, hidden_dim = size of hidden layer 
    #fc1 = first fully connected layer. 
    #output: tensor of 
    def __init__(self, input_dim, hidden_dim=32):
        super(CombineModule, self).__init__()
        self.fc1 =nn.Linear(input_dim, hidden_dim)
        self.fc2 = nn.Linear(hidden_dim, hidden_dim)

    def forward(self, x):
        x = F.relu(self.fc1(x))
        return F.relu(self.fc2(x))
    



if __name__ == '__main__':
    data = prep_data()