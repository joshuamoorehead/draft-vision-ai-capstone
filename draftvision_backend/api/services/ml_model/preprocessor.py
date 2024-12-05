# services/ml_model/preprocessor.py
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
import pandas as pd
import numpy as np

class DraftPreprocessor:
    def __init__(self):
        # Define features that match our database structure
        self.numeric_features = {
            'QB': [
                'completions', 'attempts', 'yards',
                'touchdowns', 'rating', 'team_sos'
            ],
            'RB': [
                'attempts', 'yards', 'touchdowns',
                'yards_per_attempt', 'receptions',
                'receiving_yards', 'team_sos'
            ],
            'WR': [
                'receptions', 'yards', 'touchdowns',
                'yards_per_reception', 'team_sos'
            ]
        }
        self.categorical_features = ['school']  # Simplified to just school for now
        self.scalers = {pos: StandardScaler() for pos in ['QB', 'RB', 'WR']}
        self.encoder = OneHotEncoder(drop='first', sparse=False)

    def fit_transform(self, data, position):
        """
        Preprocess training data for a specific position
        Returns scaled and encoded features ready for model training
        """
        # Handle numeric features
        numeric_data = data[self.numeric_features[position]].fillna(0)  # Fill missing stats with 0
        scaled_numeric = self.scalers[position].fit_transform(numeric_data)
        
        if self.categorical_features:
            categorical_data = data[self.categorical_features].fillna('Unknown')
            encoded_categorical = self.encoder.fit_transform(categorical_data)
            return np.hstack([scaled_numeric, encoded_categorical])
        
        return scaled_numeric

    def transform(self, data, position):
        """
        Transform new data using fitted scalers/encoders
        """
        numeric_data = data[self.numeric_features[position]].fillna(0)
        scaled_numeric = self.scalers[position].transform(numeric_data)
        
        if self.categorical_features:
            categorical_data = data[self.categorical_features].fillna('Unknown')
            encoded_categorical = self.encoder.transform(categorical_data)
            return np.hstack([scaled_numeric, encoded_categorical])
        
        return scaled_numeric