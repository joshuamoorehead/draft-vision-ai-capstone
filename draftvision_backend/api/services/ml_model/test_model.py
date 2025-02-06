from django.db import connection
from api.services.ml_model.training import train_model, generate_mock_rankings, generate_prospect_rankings
import pandas as pd


def test_connection():
    # Simple test query
    import pandas as pd
    test = pd.read_sql("SELECT COUNT(*) FROM core_player", connection)
    print(f"Total players in database: {test.iloc[0][0]}")

def test_rankings_generation():
    try:
        # Train model
        # model, preprocessor = train_model(connection)

        prospects = pd.read_sql("""
            SELECT p.id, p.name, p.position, p.school,
                ps.completions, ps.attempts, ps.yards, ps.touchdowns, ps.rating,
                rs.attempts as rush_attempts, rs.yards as rush_yards, 
                rs.touchdowns as rush_touchdowns, rs.yards_per_attempt,
                rec.receptions, rec.yards as rec_yards, rec.touchdowns as rec_touchdowns,
                ty.sos
            FROM core_player p
            LEFT JOIN core_passingstats ps ON p.id = ps.player_id
            LEFT JOIN core_rushingstats rs ON p.id = rs.player_id
            LEFT JOIN core_receivingstats rec ON p.id = rec.player_id
            LEFT JOIN core_teamyear ty ON ps.team_year_id = ty.id
            WHERE p.position IN ('QB', 'RB', 'WR')
            AND (ps.year = 2023 OR rs.year = 2023 OR rec.year = 2023)
        """, connection)

        print(f"\nFound {len(prospects)} prospects")
        print("\nFirst few prospects:")
        print(prospects[['name', 'position', 'school']].head())

        # Generate rankings
        rankings = generate_mock_rankings()
        
        print("\nTop 10 Prospects:")
        for rank in rankings[:10]:
            print(f"{rank['name']} ({rank['position']}) - {rank['value_score']}")

    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    test_rankings_generation()