from django.db import models

class NFLPlayer(models.Model):
    name = models.CharField(max_length=100)
    position = models.CharField(max_length=50)
    forty_yard_dash = models.FloatField()  # 40-yard dash time in seconds
    vertical_jump = models.FloatField()    # Vertical jump in inches
    broad_jump = models.FloatField()       # Broad jump in inches
    bench = models.IntegerField()          # Bench in reps of 225
    weight = models.FloatField()           # Weight in pounds
    three_cone = models.FloatField()       # 3-cone time in seconds

    def __str__(self):
        return self.name
