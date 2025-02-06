from supabase import create_client, Client

SUPABASE_URL = 'https://pvuzvnemuhutrdmpchmi.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2dXp2bmVtdWh1dHJkbXBjaG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0MDcwNzgsImV4cCI6MjA0ODk4MzA3OH0.fB_b1Oe_2ckp9FGh6vmEs2jIRHjdDoaqzHVsM8NRZRY'

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