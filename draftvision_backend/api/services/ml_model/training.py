# services/ml_model/training.py
from .meta_model import MetaModel
from .data_loader import load_data  # to be implemented when DB ready

def train_model():
    # This will be updated when database is ready
    data = load_data()
    
    meta_model = MetaModel()
    meta_model.train(data)
    return meta_model

def generate_draft_board(meta_model, prospects):
    predictions = []
    for prospect in prospects:
        prediction = meta_model.predict(prospect)
        predictions.append({
            'name': prospect['name'],
            'position': prospect['position'],
            'college': prospect['college'],
            'predicted_value': prediction
        })
    return sorted(predictions, key=lambda x: x['predicted_value'], reverse=True)