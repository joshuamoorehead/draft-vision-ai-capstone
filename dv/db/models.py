from django.db import models

# Create your models here.
class PlayerProfile(models.Model):
    name = models.CharField(max_length=50)
    position = models.CharField(max_length=5)
    school = models.CharField(max_length=50)
    years_ncaa = models.JSONField(null=True, blank=True)
    year_drafted = models.IntegerField(null=True, blank=True)
    draft_round = models.IntegerField(null=True, blank=True)
    draft_pick = models.IntegerField(null=True, blank=True)
    career_av = models.FloatField(null=True, blank=True)

class NCAATeams(models.Model):
    team_name = models.CharField(max_length=50)
    conference = models.CharField(max_length=50)

class YearlyNCAATeamData(models.Model):
    teamid = models.CharField(max_length=60)
    year = models.IntegerField(null=True, blank=True)
    AP_Finish = models.IntegerField(null=True, blank=True)
    wins = models.IntegerField(null=True, blank=True)
    losses = models.IntegerField(null=True, blank=True)
    SRS = models.FloatField(null=True, blank=True)
    SOS = models.FloatField(null=True, blank=True)
    PPG = models.FloatField(null=True, blank=True)
    Opp_PPG = models.FloatField(null=True, blank=True)


class PassingLeaders(models.Model):
    playerid = models.ForeignKey(PlayerProfile, on_delete=models.CASCADE)
    year = models.IntegerField(null=True, blank=True)
    team = models.CharField(max_length=50)
    conference = models.CharField(max_length= 50)
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