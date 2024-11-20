from django.db import models

class Player(models.Model):
    name = models.CharField(max_length=100)
    college = models.CharField(max_length=100)
    position = models.CharField(max_length=10)
    player_rating = models.FloatField(default=0.0, help_text="AI-generated rating (0-100)")
    image_url = models.URLField(null=True, blank=True)
    year = models.IntegerField(default=2025)
    
    class Meta:
        ordering = ['-player_rating']
    
    def __str__(self):
        return f"{self.name} - {self.position}"

class PlayerDetail(models.Model):
    player = models.OneToOneField(Player, on_delete=models.CASCADE, related_name='details')
    biography = models.TextField(blank=True)
    stats_json = models.JSONField(default=dict, help_text="Position-specific statistics")
    rankings_json = models.JSONField(default=dict, help_text="Various ranking information")
    scheme_fit = models.TextField(blank=True)
    best_performance = models.TextField(blank=True)

    def __str__(self):
        return f"{self.player.name} - Details"
