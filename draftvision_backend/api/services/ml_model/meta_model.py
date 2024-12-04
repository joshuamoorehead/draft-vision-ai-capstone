# services/ml_model/meta_model.py
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import MinMaxScaler
from .position_models import QBModel, RBModel, WRModel  # Note the relative import
import numpy as np
import pandas as pd

class ProspectRankingModel:
    def __init__(self):
        self.position_models = {
            'QB': QBModel(),
            'RB': RBModel(),
            'WR': WRModel()
        }
        # Future enhancement: Add weights for position value
        self.position_weights = {
            'QB': 1.0,  # QBs might be valued higher
            'RB': 1.0,
            'WR': 1.0
        }

    def train(self, training_data):
        """
        Train all position-specific models.
        """
        for position, model in self.position_models.items():
            position_data = training_data[training_data['position'] == position]
            X = self.prepare_features(position_data)
            y = position_data['draft_position']
            # Future enhancement: Use prospect_rating instead of draft_position
            # y = position_data['prospect_rating']
            model.train(X, y)

    def predict_rankings(self, prospects):
        """
        Generate rankings for a list of prospects.
        """
        rankings = []
        for position, model in self.position_models.items():
            position_prospects = prospects[prospects['position'] == position]
            if len(position_prospects) == 0:
                continue

            X = self.prepare_features(position_prospects)
            value_scores = model.predict_value(X)

            for idx, prospect in position_prospects.iterrows():
                rankings.append({
                    'name': prospect['name'],
                    'position': position,
                    'school': prospect['school'],
                    'value_score': value_scores[idx],
                    # Future enhancement: Add confidence scores
                    # 'confidence': model.predict_proba(X)[idx]
                })

        # Sort by value score (higher is better)
        return sorted(rankings, key=lambda x: x['value_score'], reverse=True)