# services/ml_model/preprocessor.py
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
import pandas as pd
import numpy as np

class DraftPreprocessor:
    def __init__(self):
        self.numeric_features = {
            'QB': ['passing_yards', 'completion_percentage', 'touchdowns', 
                  'interceptions', 'qbr', 'rushing_yards',
                  'forty_time', 'height', 'weight'],
            'RB': ['rushing_yards', 'yards_per_carry', 'touchdowns',
                  'receptions', 'receiving_yards',
                  'forty_time', 'bench_press', 'vertical_jump'],
            'WR': ['receptions', 'receiving_yards', 'receiving_tds',
                  'yards_per_reception', 'catch_rate',
                  'forty_time', 'vertical_jump', 'broad_jump']
        }
        self.categorical_features = ['school', 'conference']
        self.scaler = StandardScaler()
        self.encoder = OneHotEncoder(drop='first', sparse=False)
        
    def fit_transform(self, data, position):
        """
        Preprocess training data for a specific position
        """
        # Handle missing values
        numeric_data = data[self.numeric_features[position]].fillna(data[self.numeric_features[position]].mean())
        
        # Scale numeric features
        scaled_numeric = self.scaler.fit_transform(numeric_data)
        
        # Encode categorical features
        if self.categorical_features:
            categorical_data = data[self.categorical_features].fillna('Unknown')
            encoded_categorical = self.encoder.fit_transform(categorical_data)
            
            # Combine numeric and categorical
            return np.hstack([scaled_numeric, encoded_categorical])
        
        return scaled_numeric
    
    def transform(self, data, position):
        """
        Preprocess new data using fitted scalers/encoders
        """
        numeric_data = data[self.numeric_features[position]].fillna(data[self.numeric_features[position]].mean())
        scaled_numeric = self.scaler.transform(numeric_data)
        
        if self.categorical_features:
            categorical_data = data[self.categorical_features].fillna('Unknown')
            encoded_categorical = self.encoder.transform(categorical_data)
            return np.hstack([scaled_numeric, encoded_categorical])
        
        return scaled_numeric

    def prepare_meta_features(self, position_outputs, additional_data):
        """
        Preprocess features for meta model
        """
        meta_features = pd.DataFrame({
            'position_score': position_outputs['raw_score'],
            'position_rank_percentile': position_outputs['rank'] / position_outputs['total_players'],
            'school_prestige': additional_data['school_prestige'],
            'conference_strength': additional_data['conference_strength']
        })
        
        return self.scaler.fit_transform(meta_features)