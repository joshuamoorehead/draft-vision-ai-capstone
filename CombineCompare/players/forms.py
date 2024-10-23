from django import forms

class PlayerStatsForm(forms.Form):
    forty_yard_dash = forms.FloatField(label='40-yard Dash Time (seconds)')
    vertical_jump = forms.FloatField(label='Vertical Jump (inches)')
    broad_jump = forms.FloatField(label='Broad Jump (inches)')
    bench = forms.IntegerField(label='Bench (reps of 225lbs)')
    weight = forms.FloatField(label='Weight (pounds)')

