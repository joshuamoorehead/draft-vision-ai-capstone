from supabase import create_client, Client

from dotenv import load_dotenv
import os 
load_dotenv()

SUPABASE_URL = os.getenv('REACT_APP_SUPABASE_URL')
SUPABASE_KEY = os.getenv('REACT_APP_SUPABASE_KEY')
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# response = supabase.table("db_playerprofile").select("*").execute()
# returns all QBs drafted in 2017. 
response = supabase.table('db_playerprofile').select("*").eq("year_drafted", 2017).eq('position', 'QB').execute()
  
if response.data:
    data = response.data
    for row in data:
        print(f'{row['name']}\t{row['draft_pick']}\t{row['career_av']}')
else:
    print(f'error: {response.error}')