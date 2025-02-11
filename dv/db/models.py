from django.db import models
from django.contrib.auth.models import User

# Player Profile Model
class PlayerProfile(models.Model):
    name = models.CharField(max_length=50)
    position = models.CharField(max_length=5)
    school = models.CharField(max_length=50)
    years_ncaa = models.JSONField(null=True, blank=True)
    year_drafted = models.IntegerField(null=True, blank=True)
    draft_round = models.IntegerField(null=True, blank=True)
    draft_pick = models.IntegerField(null=True, blank=True)
    career_av = models.FloatField(null=True, blank=True)

# Conferences Model
class Conferences(models.Model):
    conference = models.CharField(max_length=50)
    abbreviation = models.CharField(max_length=50, null=True)
    founded = models.IntegerField()
    to = models.IntegerField()
    wins = models.IntegerField()
    losses = models.IntegerField()
    winpct = models.FloatField()
    bowl_wins = models.IntegerField()
    bowl_losses = models.IntegerField()
    bowl_winpct = models.FloatField()
    SRS = models.FloatField()
    SOS = models.FloatField()
    AP_finishes = models.IntegerField()

# NCAA Teams Model
class NCAATeams(models.Model):
    team_name = models.CharField(max_length=50)
    conference_id = models.ForeignKey(Conferences, on_delete=models.CASCADE, null=True)

# Team Success Model
class TeamSuccess(models.Model):
    teamid = models.CharField(max_length=60)
    year = models.IntegerField(null=True, blank=True)
    AP_Finish = models.IntegerField(null=True, blank=True)
    wins = models.IntegerField(null=True, blank=True)
    losses = models.IntegerField(null=True, blank=True)
    SRS = models.FloatField(null=True, blank=True)
    SOS = models.FloatField(null=True, blank=True)
    PPG = models.FloatField(null=True, blank=True)
    Opp_PPG = models.FloatField(null=True, blank=True)

# Passing Leaders Model
class PassingLeaders(models.Model):
    playerid = models.ForeignKey(PlayerProfile, on_delete=models.CASCADE)
    year = models.IntegerField(null=True, blank=True)
    team = models.CharField(max_length=50)
    conference = models.CharField(max_length=50)
    games = models.IntegerField(null=True, blank=True)
    cmp = models.IntegerField(null=True, blank=True)
    att = models.IntegerField(null=True, blank=True)
    comp_pct = models.FloatField(null=True, blank=True)
    yds = models.IntegerField(null=True, blank=True)
    td = models.IntegerField(null=True, blank=True)
    td_pct = models.FloatField(null=True, blank=True)
    int = models.IntegerField(null=True, blank=True)
    int_pct = models.FloatField(null=True, blank=True)
    adj_yds = models.FloatField(null=True, blank=True)
    adj_yds_att = models.FloatField(null=True, blank=True)
    yds_carr = models.FloatField(null=True, blank=True)
    yds_g = models.FloatField(null=True, blank=True)
    ratings = models.FloatField(null=True, blank=True)
    awards = models.JSONField(null=True, blank=True)

# User Profile Model (Newly Added)
class UserProfile(models.Model):
    user_id = models.CharField(max_length=255, unique=True)  # Supabase user ID
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # User preferences and saved data
    saved_mock_drafts = models.JSONField(default=list)
    watchlist = models.JSONField(default=list)
    prediction_history = models.JSONField(default=list)

    def __str__(self):
        return self.email

# Coaches Model
class Coaches(models.Model):
    name = models.CharField(max_length=50)
    school = models.CharField(max_length=50)
    conference = models.ForeignKey(Conferences, on_delete=models.CASCADE)
    wins = models.IntegerField()
    losses = models.IntegerField()
    pct = models.FloatField()

# Defensive Positional Stats Model
class DefensivePositionalStats(models.Model):
    playerid = models.ForeignKey(PlayerProfile, on_delete=models.CASCADE)
    year = models.IntegerField()
    team = models.ForeignKey(NCAATeams, on_delete=models.CASCADE)
    conference = models.ForeignKey(Conferences, on_delete=models.CASCADE)
    TFL = models.IntegerField(null=True, blank=True)
    sacks = models.IntegerField(null=True, blank=True)
    hur = models.IntegerField(null=True, blank=True)
    td = models.IntegerField(null=True, blank=True)
    pd = models.IntegerField(null=True, blank=True)
    tot = models.IntegerField(null=True, blank=True)
    solo = models.IntegerField(null=True, blank=True)

# Running Back Stats Model
class RBStats(models.Model):
    playerid = models.ForeignKey(PlayerProfile, on_delete=models.CASCADE)
    team = models.ForeignKey(NCAATeams, on_delete=models.CASCADE)
    conference = models.ForeignKey(Conferences, on_delete=models.CASCADE)
    year = models.IntegerField()
    games = models.IntegerField(null=True, blank=True)
    att = models.IntegerField(null=True, blank=True)
    yds = models.IntegerField(null=True, blank=True)
    yds_att = models.FloatField(null=True, blank=True)
    rush_td = models.IntegerField(null=True, blank=True)
    rush_ypg = models.FloatField(null=True, blank=True)
    rec = models.IntegerField(null=True, blank=True)
    rec_yds = models.IntegerField(null=True, blank=True)
    ypc = models.FloatField(null=True, blank=True)
    rec_td = models.IntegerField(null=True, blank=True)
    rec_ypg = models.FloatField(null=True, blank=True)
    snaps = models.IntegerField(null=True, blank=True)
    tot_yds = models.IntegerField(null=True, blank=True)
    tot_avg = models.FloatField(null=True, blank=True)
    tot_td = models.IntegerField(null=True, blank=True)
    awards = models.JSONField(null=True, blank=True)
