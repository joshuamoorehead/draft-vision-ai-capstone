from django.db import models
from django.contrib.postgres.fields import ArrayField

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


class PlayerProfile(models.Model):
    name = models.CharField(max_length=100)
    position = models.CharField(max_length=10)
    college = models.CharField(max_length=30)
    years_ncaa = ArrayField(models.IntegerField(), size=10, blank=True, default=list)
    year_drafted = models.IntegerField(null=True, blank=True, default=None)
    draft_round = models.IntegerField(null=True, default=None, blank=True)
    draft_pick = models.IntegerField(null=True, blank=True, default=None)
    draft_team = models.CharField(null=True, blank=True, max_length=30, default=None)
    career_av = models.FloatField(null=True, blank=True, default=0.0)
    draft_av = models.FloatField(null=True, blank=True, default=0.0)

# class ConferenceData(models.Model):
#     conference = models.CharField(max_length=20)


class NCAA_Teams(models.Model):
    team_name = models.CharField(max_length=100)
    # conference = models.ForeignKey(ConferenceData)

class NCAAYearlyTeamData(models.model):
    team = models.ForeignKey(NCAA_Teams, on_delete=models.CASCADE)
    year = models.IntegerField()
    AP_finish = models.IntegerField(null=True, blank=True)
    wins = models.IntegerField()
    losses = models.IntegerField()
    OSRS = models.FloatField()
    DSRS = models.FloatField()
    SRS = models.FloatField()
    PPG = models.FloatField()
    Opp_PPG = models.FloatField()
    pass_yds_att = models.FloatField()
    opp_pass_yds_att = models.FloatField()
    rush_yd_att = models.FloatField()
    opp_rush_yd_att = models.FloatField()
    tot_yds_att = models.FloatField()
    opp_tot_yds_att = models.FloatField()


class PassingLeaders(models.Model):
    player = models.ForeignKey(PlayerProfile, on_delete=models.CASCADE)
    year = models.IntegerField()
    team = models.ForeignKey(NCAA_Teams, on_delete=models.CASCADE)
    # conference- add later 
    games = models.IntegerField(default=0)
    cmp = models.IntegerField(default=0)
    att = models.IntegerField(default=0)
    cmp_pct = models.FloatField(default = 0.0)
    yds = models.IntegerField(default=0)
    TD = models.IntegerField(default=0)
    TD_pct = models.FloatField(default=0.0)
    int = models.IntegerField(default=0)
    int_pct = models.FloatField(default=0.0)
    yards_att = models.FloatField(default=0.0)
    adj_yds_att = models.FloatField(default=0.0)
    yds_cmp = models.FloatField(default=0.0)
    yds_game = models.FloatField(default=0.0)
    rating = models.FloatField(default=0.0)
    awards = ArrayField(models.CharField(max_length=50, size=10, default=list, blank=True))

class RushingLeaders(models.Model):
    player = models.ForeignKey(PlayerProfile, on_delete=models.CASCADE)
    year = models.IntegerField()
    team = models.ForeignKey(NCAA_Teams, on_delete=models.CASCADE)
    # conference- add later 
    games = models.IntegerField()
    att = models.IntegerField()
    yds = models.IntegerField()
    yds_att = models.FloatField()
    td = models.IntegerField()
    yds_g = models.FloatField()
    rec = models.IntegerField()
    rec_yds = models.IntegerField()
    rec_yds_g = models.FloatField()
    plays = models.IntegerField()
    tot_yds = models.IntegerField()
    tot_avg = models.FloatField()
    tot_td = models.IntegerField()
    awards = ArrayField(models.CharField(max_length=50, size=10, default=list, blank=True))



class RecLeaders(models.Model): 
    player = models.ForeignKey(PlayerProfile, on_delete=models.CASCADE)
    year = models.IntegerField()
    team = models.ForeignKey(NCAA_Teams, on_delete=models.CASCADE)
    # add conference later 
    games = models.IntegerField()
    rec = models.IntegerField()
    yds = models.IntegerField()
    yds_rec = models.FloatField()
    td = models.IntegerField()
    yds_g = models.FloatField()
    rush_att = models.IntegerField()
    rush_yds = models.IntegerField()
    rush_td = models.IntegerField()
    player = models.IntegerField()
    tot_yds = models.IntegerField()
    tot_avg = models.FloatField()
    tot_td = models.IntegerField()
    awards = ArrayField(models.CharField(max_length=50, size=10, default=list, blank=True))
