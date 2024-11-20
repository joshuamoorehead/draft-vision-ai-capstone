# services/ml_model/position_models.py
from sklearn.ensemble import RandomForestRegressor
import pandas as pd

class BasePositionModel:
    def __init__(self):
        self.model = RandomForestRegressor()
        self.position = None
        self.features = []
        
    def prepare_data(self, data):
        return data[self.features]

class QBModel(BasePositionModel):
    def __init__(self):
        super().__init__()
        self.position = 'QB'
        self.features = [
            'passing_yards', 'completion_percentage', 'touchdowns', 
            'interceptions', 'qbr', 'rushing_yards',
            'forty_time', 'height', 'weight'  # combine metrics
        ]

class RBModel(BasePositionModel):
    def __init__(self):
        super().__init__()
        self.position = 'RB'
        self.features = [
            'rushing_yards', 'yards_per_carry', 'touchdowns',
            'receptions', 'receiving_yards',
            'forty_time', 'bench_press', 'vertical_jump'  # combine metrics
        ]

class WRModel(BasePositionModel):
    def __init__(self):
        super().__init__()
        self.position = 'WR'
        self.features = [
            'receptions', 'receiving_yards', 'receiving_tds',
            'yards_per_reception', 'catch_rate',
            'forty_time', 'vertical_jump', 'broad_jump'  # combine metrics
        ]
