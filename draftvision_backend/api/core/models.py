from django.db import models


class Team(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class TeamYear(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="years")
    year = models.IntegerField()
    sos = models.FloatField(help_text="Strength of Schedule")

    class Meta:
        unique_together = ('team', 'year')  # Prevent duplicate records

    def __str__(self):
        return f"{self.team.name} ({self.year})"


class Player(models.Model):
    name = models.CharField(max_length=100)
    position = models.CharField(max_length=10)  # e.g., QB, RB, WR
    school = models.CharField(max_length=100, null=True, blank=True)
    height = models.IntegerField(null=True, blank=True)  # Height in inches
    weight = models.IntegerField(null=True, blank=True)  # Weight in pounds
    years_ncaa = models.JSONField(default=list, help_text="Years the player played in NCAA")

    def __str__(self):
        return self.name


class DraftInfo(models.Model):
    player = models.ForeignKey(
        Player, 
        on_delete=models.CASCADE, 
        related_name="draft_info"  # Add this line
    )
    draft_av = models.FloatField(null=True, blank=True)
    draft_round = models.IntegerField(null=True, blank=True)
    draft_pick = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return f"{self.player.name} - Draft Info"


class PassingStats(models.Model):
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name="passing_stats")
    team_year = models.ForeignKey(TeamYear, on_delete=models.CASCADE, related_name="passing_stats", default=1)
    year = models.IntegerField()  # Optional if team_year.year is sufficient
    completions = models.IntegerField(default=0)
    attempts = models.IntegerField(default=0)
    yards = models.IntegerField(default=0)
    touchdowns = models.IntegerField(default=0)
    interceptions = models.IntegerField(default=0)
    completion_pct = models.FloatField(null=True, blank=True, help_text="Completion percentage")
    yards_per_attempt = models.FloatField(null=True, blank=True, help_text="Yards per attempt")
    rating = models.FloatField(null=True, blank=True, help_text="Passer rating")
    interception_pct=models.FloatField(null=True,blank=True,help_text="IntPCT")
    touchdown_pct=models.FloatField(null=True,blank=True,help_text="TDPCT")
    awards=models.TextField(null=True,blank=True,help_text="awards")

    class Meta:
        unique_together = ('player', 'team_year', 'year')  # Modify if `year` is removed

    def save(self, *args, **kwargs):
        if not self.year and self.team_year:
            self.year = self.team_year.year  # Auto-populate year if missing
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.player.name} ({self.team_year.team.name}, {self.year}) - Passing Stats"


class RushingStats(models.Model):
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name="rushing_stats")
    team_year = models.ForeignKey(TeamYear, on_delete=models.CASCADE, related_name="rushing_stats", default=1)
    year = models.IntegerField()
    attempts = models.IntegerField(default=0)
    yards = models.IntegerField(default=0)
    yards_per_attempt = models.FloatField(default=0.0)
    touchdowns = models.IntegerField(default=0)
    yards_per_game = models.FloatField(default=0.0)
    awards = models.TextField(null=True, blank=True)

    class Meta:
        unique_together = ('player', 'team_year', 'year')

    def __str__(self):
        return f"{self.player.name} ({self.year}) - Rushing Stats"



class ReceivingStats(models.Model):
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name="receiving_stats")
    team_year = models.ForeignKey(TeamYear, on_delete=models.CASCADE, related_name="receiving_stats", default=1)
    year = models.IntegerField()
    receptions = models.IntegerField(default=0)
    yards = models.IntegerField(default=0)
    yards_per_reception = models.FloatField(default=0.0)
    touchdowns = models.IntegerField(default=0)
    games_played = models.IntegerField(default=0)
    yards_per_game = models.FloatField(default=0.0)
    awards = models.TextField(null=True, blank=True)

    class Meta:
        unique_together = ('player', 'team_year', 'year')

    def __str__(self):
        return f"{self.player.name} ({self.year}) - Receiving Stats"
