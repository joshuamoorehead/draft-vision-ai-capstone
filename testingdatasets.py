import cfbd.configuration
from dotenv import load_dotenv
from bs4 import BeautifulSoup as bs
import os 
import cfbd
import json 




load_dotenv()
api_key = os.getenv('API_KEY')

# base_url = f"https://api.collegefootballdata.com/bearer={api_key}records?year=2022&conference=SEC"
# config = cfbd.Configuration()
# config.api_key['Authorization'] = api_key
# config.api_key_prefix['Authorization'] = 'Bearer'

# api_instance = cfbd.RatingsApi(cfbd.ApiClient(config))
# conf = api_instance.get_conference_sp_ratings(year=2022, conference='SEC')

# for d in conf:
#     print(d)
#     print('-----------')

# team = api_instance.get_sp_ratings(year=2023, team='Georgia')
# for t in team:
#     print(t)

# team = api_instance.get_fpi_ratings(year=2022, team='Georgia')
# for t in team:
#     print(t)
