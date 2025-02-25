# file: qb_draft_predictor_example.py

import torch
import torch.nn as nn
import torch.nn.functional as F

# Example sub-network for the Combine module (physical/athletic data)
class CombineModule(nn.Module):
    def __init__(self, input_dim, hidden_dim=32):
        super(CombineModule, self).__init__()
        self.fc1 = nn.Linear(input_dim, hidden_dim)
        self.fc2 = nn.Linear(hidden_dim, hidden_dim)
    
    def forward(self, x):
        x = F.relu(self.fc1(x))
        return F.relu(self.fc2(x))

# Example sub-network for the Conferences module with an embedding for categorical data.
class ConferencesModule(nn.Module):
    def __init__(self, num_conferences, embed_dim=8, other_features_dim=5, hidden_dim=32):
        super(ConferencesModule, self).__init__()
        self.conference_embed = nn.Embedding(num_conferences, embed_dim)
        self.fc1 = nn.Linear(embed_dim + other_features_dim, hidden_dim)
        self.fc2 = nn.Linear(hidden_dim, hidden_dim)
    
    def forward(self, conference_idx, numeric_features):
        emb = self.conference_embed(conference_idx)  # shape: [batch_size, embed_dim]
        x = torch.cat([emb, numeric_features], dim=-1)
        x = F.relu(self.fc1(x))
        return F.relu(self.fc2(x))

# Example sub-network for Historical Team Success
class HistoricalTeamSuccessModule(nn.Module):
    def __init__(self, input_dim, hidden_dim=32):
        super(HistoricalTeamSuccessModule, self).__init__()
        self.fc1 = nn.Linear(input_dim, hidden_dim)
        self.fc2 = nn.Linear(hidden_dim, hidden_dim)
    
    def forward(self, x):
        x = F.relu(self.fc1(x))
        return F.relu(self.fc2(x))

# Example sub-network for Passing Leaders (QB-specific stats)
class PassingLeadersModule(nn.Module):
    def __init__(self, input_dim, hidden_dim=64):
        super(PassingLeadersModule, self).__init__()
        self.fc1 = nn.Linear(input_dim, hidden_dim)
        self.fc2 = nn.Linear(hidden_dim, hidden_dim)
    
    def forward(self, x):
        x = F.relu(self.fc1(x))
        return F.relu(self.fc2(x))

# Example sub-network for Team Offense
class TeamOffenseModule(nn.Module):
    def __init__(self, input_dim, hidden_dim=32):
        super(TeamOffenseModule, self).__init__()
        self.fc1 = nn.Linear(input_dim, hidden_dim)
        self.fc2 = nn.Linear(hidden_dim, hidden_dim)
    
    def forward(self, x):
        x = F.relu(self.fc1(x))
        return F.relu(self.fc2(x))

# Example sub-network for Team Ratings
class TeamRatingsModule(nn.Module):
    def __init__(self, input_dim, hidden_dim=32):
        super(TeamRatingsModule, self).__init__()
        self.fc1 = nn.Linear(input_dim, hidden_dim)
        self.fc2 = nn.Linear(hidden_dim, hidden_dim)
    
    def forward(self, x):
        x = F.relu(self.fc1(x))
        return F.relu(self.fc2(x))

# Example sub-network for Team Success
class TeamSuccessModule(nn.Module):
    def __init__(self, input_dim, hidden_dim=32):
        super(TeamSuccessModule, self).__init__()
        self.fc1 = nn.Linear(input_dim, hidden_dim)
        self.fc2 = nn.Linear(hidden_dim, hidden_dim)
    
    def forward(self, x):
        x = F.relu(self.fc1(x))
        return F.relu(self.fc2(x))

# Master model that combines all sub-networks
class QBDraftPredictor(nn.Module):
    def __init__(self,
                 combine_input_dim,
                 conf_num, conf_other_dim,
                 hist_input_dim,
                 passing_input_dim,
                 team_offense_dim,
                 team_ratings_dim,
                 team_success_dim,
                 final_hidden_dim=64,
                 output_dim=3):
        super(QBDraftPredictor, self).__init__()
        # Initialize each sub-network
        self.combine_module = CombineModule(combine_input_dim, hidden_dim=32)
        self.conferences_module = ConferencesModule(conf_num, embed_dim=8, other_features_dim=conf_other_dim, hidden_dim=32)
        self.hist_team_module = HistoricalTeamSuccessModule(hist_input_dim, hidden_dim=32)
        self.passing_module = PassingLeadersModule(passing_input_dim, hidden_dim=64)
        self.team_offense_module = TeamOffenseModule(team_offense_dim, hidden_dim=32)
        self.team_ratings_module = TeamRatingsModule(team_ratings_dim, hidden_dim=32)
        self.team_success_module = TeamSuccessModule(team_success_dim, hidden_dim=32)
        
        # After concatenation, we need to combine all features
        total_hidden = 32 + 32 + 32 + 64 + 32 + 32 + 32  # sum of each submodule's output dimension
        self.fc1 = nn.Linear(total_hidden, final_hidden_dim)
        self.fc2 = nn.Linear(final_hidden_dim, output_dim)  # output_dim=3 for 3 draft categories
    
    def forward(self, 
                combine_data,
                conf_idx, conf_numeric,
                hist_data,
                passing_data,
                offense_data,
                ratings_data,
                success_data):
        
        combine_out = self.combine_module(combine_data)
        conf_out = self.conferences_module(conf_idx, conf_numeric)
        hist_out = self.hist_team_module(hist_data)
        passing_out = self.passing_module(passing_data)
        offense_out = self.team_offense_module(offense_data)
        ratings_out = self.team_ratings_module(ratings_data)
        success_out = self.team_success_module(success_data)
        
        # Concatenate all outputs
        x = torch.cat([combine_out, conf_out, hist_out, passing_out, offense_out, ratings_out, success_out], dim=-1)
        
        # Final dense layers
        x = F.relu(self.fc1(x))
        logits = self.fc2(x)
        return logits

if __name__ == "__main__":
    # 1. Define dummy input dimensions
    combine_input_dim = 10   # ex: 10 combine features (height, weight, etc.)
    conf_num = 20            # ex: 20 unique conferences
    conf_other_dim = 5       # ex: 5 numeric conf features (winpct, bowl_wins, etc.)
    hist_input_dim = 15      # ex: 15 historical team success features
    passing_input_dim = 20   # ex: 20 QB passing stats
    team_offense_dim = 18    # ex: 18 overall team offense stats
    team_ratings_dim = 10    # ex: 10 overall team rating features
    team_success_dim = 8     # ex: 8 team success metrics
    
    # 2. Create model instance
    model = QBDraftPredictor(combine_input_dim,
                             conf_num, conf_other_dim,
                             hist_input_dim,
                             passing_input_dim,
                             team_offense_dim,
                             team_ratings_dim,
                             team_success_dim,
                             final_hidden_dim=64,
                             output_dim=3)
    
    # 3. Create dummy inputs
    # Let's simulate a batch of size 4
    batch_size = 4
    
    combine_data   = torch.randn(batch_size, combine_input_dim)     # (4 x 10)
    conf_idx       = torch.randint(0, conf_num, (batch_size,))      # (4,) integer IDs
    conf_numeric   = torch.randn(batch_size, conf_other_dim)        # (4 x 5)
    hist_data      = torch.randn(batch_size, hist_input_dim)        # (4 x 15)
    passing_data   = torch.randn(batch_size, passing_input_dim)     # (4 x 20)
    offense_data   = torch.randn(batch_size, team_offense_dim)      # (4 x 18)
    ratings_data   = torch.randn(batch_size, team_ratings_dim)      # (4 x 10)
    success_data   = torch.randn(batch_size, team_success_dim)      # (4 x 8)
    
    # 4. Forward pass
    logits = model(combine_data,
                   conf_idx, conf_numeric,
                   hist_data,
                   passing_data,
                   offense_data,
                   ratings_data,
                   success_data)
    
    print("Logits shape:", logits.shape)  # Should be [4, 3]
    print("Logits:", logits)
