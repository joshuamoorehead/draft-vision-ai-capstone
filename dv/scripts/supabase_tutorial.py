"""
basically use this if you want to learn how to use supabase. just going to walk through a few quick examples on how to use 
requirements.txt should be updated to hold all the required libraries. 
"""

from supabase import create_client, Client 

# initial setup. use this URL and Key exactly. 
SUPABASE_URL = 'https://pvuzvnemuhutrdmpchmi.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2dXp2bmVtdWh1dHJkbXBjaG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0MDcwNzgsImV4cCI6MjA0ODk4MzA3OH0.fB_b1Oe_2ckp9FGh6vmEs2jIRHjdDoaqzHVsM8NRZRY'

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


#prints all table headers. plug in <table_name> with one of the 4 tables in the comments above. 
def get_table_headers():
    # current table names: db_ncaateams, db_passingleaders, db_playerprofile, db_yearlyncaateamdata
    table_name = 'db_playerprofile'
    response = supabase.table(table_name).select('*').limit(1).execute()

    if response.data:
        column_headers = list(response.data[0].keys())
        print(f'column headers: {column_headers}')
    else:
        print('error printing headers')

def print_data(data):
    if data:
        for row in data:
            print(row)
    else:
        print('error loading data')
def sample_query():
    # query using the .eq() method. you can have multiple .eq()'s in one call. 

    # example 1: pulls all quarterbacks in "playerprofile" table
    response = supabase.table('db_playerprofile').select("*").eq('position', 'QB').execute()
    # print_data(response.data)

    # example 2- pulls all quarterbacks drafted in 2017
    # response = supabase.table('db_playerprofile').select("*").eq("year_drafted", 2017).eq('position', 'QB').execute()
    # print_data(response.data)
    # print('-------------------------------')

    # select()- which columns you show
    # eq(column, value)- which columns you query by
    # example 3- joining. This requires a bit more coding but still feasible. 
    # in this example, I'll find the id's and passer ratings of SEC QB's in 2018, I'll then use the ID's to link them to a player profile id and fetch the name. 
    passingstats_response = supabase.table('db_passingleaders').select('playerid_id', 'ratings').eq('year', 2018).eq('conference', 'SEC').execute()
    player_data = []
    if passingstats_response.data:
        for row in passingstats_response.data:
            player_id = row['playerid_id']
            name = supabase.table('db_playerprofile').select('name').eq('id', player_id).execute()
            player_data.append({'id': player_id, 'name': name.data[0]['name'], 'rating': row['ratings']}) #have to do some messing around with the "name.data" part. 
    
    for player in player_data:
        for key, val in player.items():
            print(f'{key}: {val}')
        print('-----')




get_table_headers()
# sample_query()