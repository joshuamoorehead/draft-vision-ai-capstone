# services/ml_model/training.py
from .meta_model import ProspectRankingModel
from .preprocessor import DraftPreprocessor
import pandas as pd

def load_data_from_db(connection):
    # First check what's in each table with basic queries
    players = pd.read_sql("""
        SELECT 
            p.id,
            p.name,
            p.position,
            p.school,
            p.height,
            p.weight,
            p.years_ncaa,
            d.draft_round,
            d.draft_pick,
            d.draft_av
        FROM core_player p
        LEFT JOIN core_draftinfo d ON p.id = d.player_id
        WHERE p.position IN ('QB', 'RB', 'WR')
    """, connection)

    # Simplified queries to just get raw stats
    passing_stats = pd.read_sql("SELECT * FROM core_passingstats", connection)
    rushing_stats = pd.read_sql("SELECT * FROM core_rushingstats", connection)
    receiving_stats = pd.read_sql("SELECT * FROM core_receivingstats", connection)

    print("\nDiagnostic Counts:")
    print(f"Players: {len(players)}")
    print(f"Passing stats: {len(passing_stats)}")
    print(f"Rushing stats: {len(rushing_stats)}")
    print(f"Receiving stats: {len(receiving_stats)}")

    return {
        'players': players,
        'passing_stats': passing_stats,
        'rushing_stats': rushing_stats,
        'receiving_stats': receiving_stats
    }

def prepare_position_data(raw_data, position):
    players = raw_data['players']
    position_players = players[players['position'] == position]

    print(f"\nPreparing data for {position}:")
    print(f"Number of {position} players: {len(position_players)}")
    
    if position == 'QB':
        stats = raw_data['passing_stats']
        print(f"Available QB stats: {stats.columns.tolist()}")
        relevant_columns = [
            'player_id', 'completions', 'attempts', 'yards', 
            'touchdowns', 'rating', 'sos'  # Removed yards_per_game
        ]
    elif position == 'RB':
        rushing = raw_data['rushing_stats']
        receiving = raw_data['receiving_stats']
        relevant_columns = ['player_id', 'attempts', 'yards', 'touchdowns', 'yards_per_attempt', 'sos']
        # First merge rushing stats with only available columns
        position_data = position_players.merge(
            rushing[['player_id', 'attempts', 'yards', 'touchdowns', 'yards_per_attempt', 'sos']],
            left_on='id',
            right_on='player_id',
            how='left'
        ).fillna(0)
        
        # Then add receiving stats
        position_data = position_data.merge(
            receiving[['player_id', 'receptions', 'yards']].rename(
                columns={'yards': 'receiving_yards'}
            ),
            left_on='id',
            right_on='player_id',
            how='left'
        ).fillna(0)
        print("RB rushing stats shape:", rushing[relevant_columns].shape)
        print("RB receiving stats shape:", receiving[['player_id', 'receptions', 'yards']].shape)
        
        return position_data
    else:  # WR
        stats = raw_data['receiving_stats']
        relevant_columns = [
            'player_id', 'receptions', 'yards', 'touchdowns',
            'yards_per_reception', 'sos'  # Removed yards_per_game
        ]

    position_data = position_players.merge(
        stats[relevant_columns],
        left_on='id',
        right_on='player_id',
        how='left'
    ).fillna(0)

    print(f"\nFinal {position} training data shape:", position_data.shape)
    print("Sample of prepared data:")
    print(position_data.head())
    
    return position_data

# In training.py, modify the train_model function:
def train_model(connection):
    import time
    print("Starting model training...")
    
    start_time = time.time()
    print("Loading data from database...")
    raw_data = load_data_from_db(connection)
    data_load_time = time.time()
    print(f"Data loading took {data_load_time - start_time:.2f} seconds")

    preprocessor = DraftPreprocessor()
    ranking_model = ProspectRankingModel()
    
    for position in ['QB', 'RB', 'WR']:
        print(f"\nTraining {position} model...")
        pos_start = time.time()
        
        position_data = prepare_position_data(raw_data, position)
        print(f"Number of {position} players for training: {len(position_data)}")
        
        processed_features = preprocessor.fit_transform(position_data, position)
        print(f"Features processed, shape: {processed_features.shape}")
        
        ranking_model.train(position, processed_features, position_data['draft_pick'])
        
        print(f"{position} model training took {time.time() - pos_start:.2f} seconds")

    total_time = time.time() - start_time
    print(f"\nTotal training time: {total_time:.2f} seconds")
    
    return ranking_model, preprocessor

def generate_prospect_rankings(ranking_model, preprocessor, prospects):
    rankings = ranking_model.predict_rankings(prospects)
    
    formatted_rankings = []
    for rank, prospect in enumerate(rankings, 1):
        formatted_rankings.append({
            'rank': rank,
            'name': prospect['name'],
            'position': prospect['position'],
            'school': prospect['school'],
            'value_score': round(prospect['value_score'], 1)
        })
    
    return sorted(formatted_rankings, key=lambda x: x['value_score'], reverse=True)

