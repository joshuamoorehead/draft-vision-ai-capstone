# services/ml_model/training.py
from .meta_model import ProspectRankingModel  # Note the new import
from .preprocessor import DraftPreprocessor
import pandas as pd

def load_data_from_db(connection):
    """
    Load and combine data from our database tables
    """
    # Load player data
    players = pd.read_sql("""
        SELECT * FROM core_player 
        WHERE position IN ('QB', 'RB', 'WR')
    """, connection)
    
    # Load stats based on position
    passing_stats = pd.read_sql("SELECT * FROM core_passingstats", connection)
    rushing_stats = pd.read_sql("SELECT * FROM core_rushingstats", connection)
    receiving_stats = pd.read_sql("SELECT * FROM core_receivingstats", connection)
    
    # Load team strength of schedule
    team_sos = pd.read_sql("SELECT * FROM core_teamyears", connection)
    
    return {
        'players': players,
        'passing_stats': passing_stats,
        'rushing_stats': rushing_stats,
        'receiving_stats': receiving_stats,
        'team_sos': team_sos
    }

def prepare_position_data(raw_data, position):
    """
    Prepare data for a specific position by combining relevant stats
    """
    players = raw_data['players']
    position_players = players[players['position'] == position]
    
    if position == 'QB':
        stats = raw_data['passing_stats']
        relevant_columns = ['completions', 'attempts', 'yards', 'touchdowns', 'rating']
    elif position == 'RB':
        stats = raw_data['rushing_stats']
        receiving = raw_data['receiving_stats']
        # Combine rushing and receiving stats for RBs
        relevant_columns = ['attempts', 'yards', 'touchdowns', 'yards_per_attempt']
    else:  # WR
        stats = raw_data['receiving_stats']
        relevant_columns = ['receptions', 'yards', 'touchdowns', 'yards_per_reception']
    
    # Merge stats with player data
    position_data = position_players.merge(stats[relevant_columns + ['player']], on='player')
    
    # Add team strength of schedule
    position_data = position_data.merge(raw_data['team_sos'][['team', 'year', 'sos']], 
                                      on=['team', 'year'])
    
    return position_data

def train_model(connection):
    """
    Load data and train the prospect ranking model
    """
    # Load all required data
    raw_data = load_data_from_db(connection)
    
    # Initialize models
    preprocessor = DraftPreprocessor()
    ranking_model = ProspectRankingModel()  # Using our new model
    
    # Prepare and preprocess data for each position
    for position in ['QB', 'RB', 'WR']:
        position_data = prepare_position_data(raw_data, position)
        processed_features = preprocessor.fit_transform(position_data, position)
        
        # Future enhancement:
        # When prospect ratings are available, replace draft_position with prospect_rating
        ranking_model.train(position, processed_features, position_data['draft_position'])
    
    return ranking_model, preprocessor

def generate_prospect_rankings(ranking_model, preprocessor, prospects):
    """
    Generate sorted prospect rankings with value scores
    """
    # Get rankings using our new value score system
    rankings = ranking_model.predict_rankings(prospects)
    
    # Format the output for display
    formatted_rankings = []
    for rank, prospect in enumerate(rankings, 1):
        formatted_rankings.append({
            'rank': rank,
            'name': prospect['name'],
            'position': prospect['position'],
            'school': prospect['school'],
            'value_score': round(prospect['value_score'], 1)  # Round to 1 decimal
        })
    
    return formatted_rankings