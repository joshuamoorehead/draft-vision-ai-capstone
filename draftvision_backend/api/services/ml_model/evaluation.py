# services/ml_model/evaluation.py
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import numpy as np

def evaluate_model(ranking_model, test_data, preprocessor):
    """
    Evaluate model performance using value scores
    """
    results = {}
    
    for position in ['QB', 'RB', 'WR']:
        position_data = test_data[test_data['position'] == position]
        if len(position_data) == 0:
            continue
            
        # Preprocess test data
        X_test = preprocessor.transform(position_data, position)
        
        # Get value score predictions
        predicted_scores = ranking_model.position_models[position].predict_value(X_test)
        
        # For now, we'll evaluate against transformed draft positions
        # Later, we'll evaluate against actual prospect ratings
        actual_draft_positions = position_data['draft_position']
        actual_scores = ranking_model.position_models[position].draft_position_to_value_score(actual_draft_positions)
        
        # Calculate metrics
        results[position] = {
            'mean_absolute_error': mean_absolute_error(actual_scores, predicted_scores),
            'root_mean_squared_error': np.sqrt(mean_squared_error(actual_scores, predicted_scores)),
            'r2_score': r2_score(actual_scores, predicted_scores),
            'average_predicted_score': np.mean(predicted_scores),
            'score_standard_deviation': np.std(predicted_scores)
        }
        
        # Add distribution analysis
        results[position]['score_distribution'] = {
            'top_25%': np.percentile(predicted_scores, 75),
            'median': np.percentile(predicted_scores, 50),
            'bottom_25%': np.percentile(predicted_scores, 25)
        }
    
    return results