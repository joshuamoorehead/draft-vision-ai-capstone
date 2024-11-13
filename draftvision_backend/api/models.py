from django.db import models

class Player(models.Model):
    name = models.CharField(max_length=100)
    college = models.CharField(max_length=100)
    position = models.CharField(max_length=10)
    height = models.IntegerField(help_text="Height in inches")
    weight = models.IntegerField(help_text="Weight in pounds")
    biography = models.TextField()  # For the biography tab in player card
    player_image = models.URLField(null=True, blank=True)  # For player headshots
    draft_rating = models.FloatField(help_text="AI-generated draft rating")
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} - {self.position}"

class CollegeStats(models.Model):
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='college_stats')
    year = models.IntegerField()
    games_played = models.IntegerField()
    stats_json = models.JSONField(help_text="Position-specific statistics stored as JSON")
    best_performance = models.TextField(null=True, blank=True)  # For best performance tab
    scheme = models.TextField(null=True, blank=True)  # For scheme tab
    
    class Meta:
        unique_together = ['player', 'year']
        
    def __str__(self):
        return f"{self.player.name} - {self.year} Stats"

class NFLTeam(models.Model):
    name = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    logo_url = models.URLField()
    current_pick = models.IntegerField()  # For mock draft order
    
    def __str__(self):
        return f"{self.city} {self.name}"

class MockDraft(models.Model):
    user_team = models.ForeignKey(NFLTeam, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    completed = models.BooleanField(default=False)
    grade = models.CharField(max_length=2, null=True)  # A+, A, B+, etc.

class MockDraftPick(models.Model):
    mock_draft = models.ForeignKey(MockDraft, on_delete=models.CASCADE, related_name='picks')
    player = models.ForeignKey(Player, on_delete=models.CASCADE)
    pick_number = models.IntegerField()
    team = models.ForeignKey(NFLTeam, on_delete=models.CASCADE)
    ai_analysis = models.TextField()  # AI-generated analysis of the pick
    
    class Meta:
        ordering = ['pick_number']

class DraftPrediction(models.Model):
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='predictions')
    predicted_round = models.IntegerField()
    predicted_overall_pick = models.IntegerField()
    confidence_score = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.player.name} - Round {self.predicted_round}"
