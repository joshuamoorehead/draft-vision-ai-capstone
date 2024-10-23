import csv
from django.core.management.base import BaseCommand
from players.models import NFLPlayer
from django.db import transaction

class Command(BaseCommand):
    help = 'Load NFL combine player stats from a CSV file'

    def handle(self, *args, **kwargs):
        # Read the CSV file and collect data
        stats = []
        with open('2022_combine.csv', newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                stats.append({
                    'name': row['Player'],
                    'position': row['Pos'],
                    'forty_yard_dash': float(row['40yd']) if row['40yd'] else None,
                    'vertical_jump': float(row['Vertical']) if row['Vertical'] else None,
                    'broad_jump': float(row['Broad Jump']) if row['Broad Jump'] else None,
                    'bench': float(row['Bench']) if row['Bench'] else None,
                    'weight': float(row['Wt']) if row['Wt'] else None,
                })

        # Save to the database, filling in missing values
        with transaction.atomic():
            for stat in stats:
                NFLPlayer.objects.create(
                    name=stat['name'],
                    position=stat['position'],
                    forty_yard_dash=stat['forty_yard_dash'] if stat['forty_yard_dash'] is not None else 5.0,
                    vertical_jump=stat['vertical_jump'] if stat['vertical_jump'] is not None else 30,
                    broad_jump=stat['broad_jump'] if stat['broad_jump'] is not None else 100,
                    bench=stat['bench'] if stat['bench'] is not None else 5,
                    weight=stat['weight'] if stat['weight'] is not None else 200,
                )

        self.stdout.write(self.style.SUCCESS('Successfully imported combine stats'))
