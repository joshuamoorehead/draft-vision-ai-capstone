# services/ml_model/meta_model.py
class MetaModel:
    def __init__(self):
        self.model = RandomForestRegressor()
        self.position_models = {
            'QB': QBModel(),
            'RB': RBModel(),
            'WR': WRModel()
        }
    
    def prepare_meta_features(self, position_outputs, additional_data):
        """
        Combines position model outputs with additional features
        additional_data includes team needs, school prestige, etc.
        """
        meta_features = {
            'position_score': position_outputs['raw_score'],
            'position_rank': position_outputs['rank'],
            'school_prestige': additional_data['school_prestige'],
            'competition_level': additional_data['competition_level'],
            # Add more features as they become available
        }
        return pd.DataFrame(meta_features)

    def predict(self, player_data):
        # Get position-specific prediction
        position = player_data['position']
        position_model = self.position_models[position]
        position_output = position_model.predict(player_data)
        
        # Combine with additional features
        meta_features = self.prepare_meta_features(
            position_output,
            player_data['additional_data']
        )
        
        return self.model.predict(meta_features)
