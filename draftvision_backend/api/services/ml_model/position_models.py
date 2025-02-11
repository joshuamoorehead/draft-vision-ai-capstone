# services/ml_model/position_models.py
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import MinMaxScaler
import numpy as np

class BasePositionModel:
    def __init__(self):
        # We'll use RandomForest to predict draft position
        self.draft_model = RandomForestRegressor(
            n_estimators=100,
            random_state=42
        )
        # This scaler will convert draft positions to value scores (higher is better)
        self.value_scaler = MinMaxScaler(feature_range=(0, 100))
        self.position = None
        self.features = []

    def draft_position_to_value_score(self, draft_positions):
        """
        Convert predicted draft positions to value scores (0-100).
        Lower draft positions should result in higher value scores.
        """
        # Invert draft positions so earlier picks get higher scores
        inverted_positions = -1 * np.array(draft_positions).reshape(-1, 1)
        # Scale to 0-100 range
        return self.value_scaler.fit_transform(inverted_positions).flatten()

    def train(self, X, y):
        """
        Train the model using historical draft data.
        When prospect ratings become available, we'll integrate them here.
        """
        self.draft_model.fit(X, y)
        # Future enhancement: Train on prospect ratings instead
        # self.rating_model.fit(X, prospect_ratings)  # Currently commented out

    def predict_value(self, X):
        """
        Predict value scores for new prospects.
        Currently based on draft position predictions, but will use ratings in future.
        """
        # Get draft position predictions
        draft_predictions = self.draft_model.predict(X)
        
        # Convert to value scores (0-100)
        value_scores = self.draft_position_to_value_score(draft_predictions)
        
        # Add some randomness to break up clustering
        # This helps create more spread in the rankings
        noise = np.random.normal(0, 2, size=len(value_scores))
        value_scores = np.clip(value_scores + noise, 0, 100)
        
        # Future enhancement: Directly predict prospect ratings
        # return self.rating_model.predict(X)  # Currently commented out
        
        return value_scores
    
class QBModel(BasePositionModel):
    def __init__(self):
        super().__init__()
        self.position = 'QB'
        # Statistics we'll use to evaluate QBs
        self.features = [
            'completions', 
            'attempts',
            'yards',
            'touchdowns',
            'rating',
            'team_sos'  # Strength of schedule
        ]

        # Initialize models and scalers
        self.draft_model = RandomForestRegressor(
            n_estimators=100,
            random_state=42
        )
        self.value_scaler = MinMaxScaler(feature_range=(0, 100))

class WRModel(BasePositionModel):
    def __init__(self):
        super().__init__()
        self.position = 'WR'
        # Statistics we'll use to evaluate WRs
        self.features = [
            'receptions',
            'yards',
            'touchdowns',
            'yards_per_reception',
            'team_sos'  # Strength of schedule
        ]

        # Initialize models and scalers
        self.draft_model = RandomForestRegressor(
            n_estimators=100,
            random_state=42
        )
        self.value_scaler = MinMaxScaler(feature_range=(0, 100))

class RBModel(BasePositionModel):
    def __init__(self):
        super().__init__()
        self.position = 'RB'
        # Statistics we'll use to evaluate RBs
        self.features = [
            'attempts',
            'yards',
            'touchdowns',
            'yards_per_attempt',
            'receptions',     # Pass-catching ability
            'receiving_yards',
            'team_sos'  # Strength of schedule
        ]

        # Initialize models and scalers
        self.draft_model = RandomForestRegressor(
            n_estimators=100,
            random_state=42
        )
        self.value_scaler = MinMaxScaler(feature_range=(0, 100))