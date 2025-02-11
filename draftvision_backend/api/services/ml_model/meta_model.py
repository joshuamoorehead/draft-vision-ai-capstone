# services/ml_model/meta_model.py
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import MinMaxScaler
from .position_models import QBModel, RBModel, WRModel
import numpy as np
import pandas as pd

class ProspectRankingModel:
    def __init__(self):
        self.position_models = {
            'QB': QBModel(),
            'RB': RBModel(),
            'WR': WRModel()
        }
        self.position_weights = {
            'QB': 1.0,
            'RB': 1.0,
            'WR': 1.0
        }

    def train(self, position, features, draft_positions):
        """
        Train a specific position model
        """
        model = self.position_models[position]
        model.train(features, draft_positions)

    def predict_rankings(self, prospects):
        """
        Generate rankings for a list of prospects
        """
        rankings = []
        
        for position, model in self.position_models.items():
            position_prospects = prospects[prospects['position'] == position]
            if len(position_prospects) == 0:
                continue

            # Generate value scores
            features = position_prospects[model.features]
            value_scores = model.predict_value(features)

            # Create ranking entries
            for idx, prospect in position_prospects.iterrows():
                rankings.append({
                    'name': prospect['name'],
                    'position': position,
                    'school': prospect['school'],
                    'value_score': value_scores[idx],
                    # Future: add key stats for context
                    # 'key_stats': self._get_key_stats(prospect, position)
                })

        return sorted(rankings, key=lambda x: x['value_score'], reverse=True)