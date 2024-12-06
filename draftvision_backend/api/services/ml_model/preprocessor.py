# services/ml_model/preprocessor.py
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
import pandas as pd
import numpy as np

class DraftPreprocessor:
    def __init__(self):
        # Update features to match only what we're getting from database
        self.numeric_features = {
            'QB': [
                'completions', 'attempts', 'yards', 
                'touchdowns', 'rating', 'sos'
            ],
            'RB': [
                'attempts', 'yards', 'touchdowns',
                'yards_per_attempt', 'receptions',
                'receiving_yards', 'sos'
            ],
            'WR': [
                'receptions', 'yards', 'touchdowns',
                'yards_per_reception', 'sos'
            ]
        }
        self.categorical_features = ['school']
        self.scalers = {pos: StandardScaler() for pos in ['QB', 'RB', 'WR']}
        self.encoder = OneHotEncoder(drop='first', sparse_output=False)

    def fit_transform(self, data, position):
        # Handle numeric features
        numeric_data = data[self.numeric_features[position]].fillna(0)
        scaled_numeric = self.scalers[position].fit_transform(numeric_data)
        
        if self.categorical_features:
            categorical_data = data[self.categorical_features].fillna('Unknown')
            encoded_categorical = self.encoder.fit_transform(categorical_data)
            return np.hstack([scaled_numeric, encoded_categorical])
        
        return scaled_numeric

    def transform(self, data, position):
        numeric_data = data[self.numeric_features[position]].fillna(0)
        scaled_numeric = self.scalers[position].transform(numeric_data)
        
        if self.categorical_features:
            categorical_data = data[self.categorical_features].fillna('Unknown')
            encoded_categorical = self.encoder.transform(categorical_data)
            return np.hstack([scaled_numeric, encoded_categorical])
        
        return scaled_numeric