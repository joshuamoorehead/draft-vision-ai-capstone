import cfbd.configuration
from dotenv import load_dotenv
from bs4 import BeautifulSoup as bs
import os 
import cfbd
import json 




load_dotenv()
api_key = os.getenv('API_KEY')

# base_url = f"https://api.collegefootballdata.com/bearer={api_key}records?year=2022&conference=SEC"
config = cfbd.Configuration()
config.api_key['Authorization'] = api_key
config.api_key_prefix['Authorization'] = 'Bearer'

api_instance = cfbd.DraftApi(cfbd.ApiClient(config))
conf = api_instance.get_draft_picks(year=2022, conference='SEC', position='Defensive End')

# for d in conf:
#     temp = d.__dict__
#     if temp['_player'] == 'Jalen Carter':
#         print(f'{temp['_stat_type']}:\t{temp['_stat']}')
#         print('-----------')

for d in conf:
    temp = d.__dict__
    print(f'{temp['_overall']}\n{temp['_pre_draft_ranking']}\n{temp['_pre_draft_position_ranking']}\n{temp['_pre_draft_grade']}')
    print('-------------')

# team = api_instance.get_sp_ratings(year=2023, team='Georgia')
# for t in team:
#     print(t)

# team = api_instance.get_fpi_ratings(year=2022, team='Georgia')
# for t in team:
#     print(t)
