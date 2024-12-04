import os
import json
import pandas as pd
from django.core.management.base import BaseCommand
from api.core.models import Player, Team, TeamYear, DraftInfo, PassingStats, RushingStats, ReceivingStats
def normalize_name(name):
        return name.replace("*", "").strip()

class Command(BaseCommand):
    help = "Import data files into the database"
    def handle(self, *args, **options):
        data_dir = "data"  # Directory containing your data files

        self.stdout.write("Starting data import...")
        self.import_full_player_list(os.path.join(data_dir, "fullplayerlist.json"))
        self.import_teams(os.path.join(data_dir, "teams"))
        self.import_draft(os.path.join(data_dir, "draft"))
        self.import_passing_stats(os.path.join(data_dir, "passing"))
        self.import_receiving_stats(os.path.join(data_dir, "receiving"))
        self.import_rushing_stats(os.path.join(data_dir, "rushing"))
        self.stdout.write("All data imported successfully!")

    def import_full_player_list(self, full_player_list_path):
        """Import the full player list"""
        if not os.path.exists(full_player_list_path):
            self.stdout.write(f"File {full_player_list_path} not found. Skipping.")
            return

        with open(full_player_list_path, "r") as f:
            player_data = json.load(f)
            for player in player_data:
                try:
                    self.stdout.write(f"Processing player: {player}")  # Debug: Log player data
                    Player.objects.update_or_create(
                        name=normalize_name(player["name"]),
                        defaults={
                            "position": player.get("position", "Unknown"),
                            "school": player.get("school", None),
                            "height": player.get("height", None),
                            "weight": player.get("weight", None),
                            "years_ncaa": player.get("years_ncaa", []),
                        }
                    )
                except Exception as e:
                    self.stdout.write(f"Error processing player: {player}")
                    self.stdout.write(f"Error: {e}")
                    continue  # Skip problematic players and continue
        self.stdout.write("Full player list imported successfully.")

    def import_teams(self, teams_dir):
        """Import team and SOS data from CSV files."""
        for file in os.listdir(teams_dir):
            if file.endswith(".csv"):
                try:
                    file_path = os.path.join(teams_dir, file)
                    self.stdout.write(f"Processing file: {file_path}")  # Log file being processed
                    team_data = pd.read_csv(file_path)
                    year = int(file.split(".")[0])  # Extract year from filename

                    for _, row in team_data.iterrows():
                        try:
                            self.stdout.write(f"Processing row: {row.to_dict()}")  # Log each row

                            # Create or get the team
                            team, _ = Team.objects.get_or_create(name=row["School"])

                            # Create or update the team's year-specific SOS
                            TeamYear.objects.update_or_create(
                                team=team,
                                year=year,
                                defaults={
                                    "sos": row["SOS"],
                                },
                            )
                        except Exception as e:
                            self.stdout.write(f"Error processing row: {row.to_dict()}")
                            self.stdout.write(f"Error: {e}")
                            continue  # Skip to the next row
                except Exception as e:
                    self.stdout.write(f"Error processing file: {file_path}")
                    self.stdout.write(f"Error: {e}")
                    continue  # Skip to the next file
        self.stdout.write("Teams and their SOS imported successfully.")



    def import_draft(self, draft_dir):
        """Import draft information"""
        for file in os.listdir(draft_dir):
            if file.endswith(".json"):
                file_path = os.path.join(draft_dir, file)
                try:
                    with open(file_path, "r") as f:
                        draft_data = json.load(f)
                        self.stdout.write(f"Processing draft file: {file}")
                        
                        for player_data in draft_data:
                            try:
                                name = normalize_name(player_data.get("name"))
                                draft_av = player_data.get("draft_av", "")

                                if not name:
                                    self.stdout.write(f"Skipping entry with missing 'name' in file {file}")
                                    continue

                                if draft_av == "":
                                    self.stdout.write(f"Warning: Missing 'draft_av' for player {name} in file {file}")
                                    draft_av = None  # Set to None if missing

                                player, _ = Player.objects.get_or_create(
                                    name=name,
                                    defaults={"position": "Unknown", "school": "Unknown"}  # Provide default values
                                )

                                DraftInfo.objects.update_or_create(
                                    player=player,
                                    defaults={
                                        "draft_av": draft_av,
                                    }
                                )
                            except Exception as e:
                                self.stdout.write(f"Error processing player data: {player_data} - {str(e)}")
                except FileNotFoundError:
                    self.stdout.write(f"File not found: {file_path}")
                except json.JSONDecodeError as e:
                    self.stdout.write(f"Error decoding JSON from file {file_path}: {str(e)}")

        self.stdout.write("Draft data imported successfully.")

    def import_passing_stats(self,passing_dir):
        """
        Import passing stats from CSV files in the given directory.
        Each file is named with the year (e.g., 2015.csv).
        """
        for file in os.listdir(passing_dir):
            if file.endswith(".csv"):
                file_path = os.path.join(passing_dir, file)
                try:
                    stats_data = pd.read_csv(file_path)
                    year = int(file.split(".")[0])  # Extract year from filename

                    print(f"Processing passing stats for year: {year}")
                    for _, row in stats_data.iterrows():
                        try:
                            # Fetch the Player
                            player_name = normalize_name(row["Player"])
                            player = Player.objects.filter(name=player_name).first()
                            if not player:
                                """print(f"Player not found: {row['Player']}. Skipping row.")"""
                                continue

                            # Fetch the Team
                            team = Team.objects.filter(name=row["Team"]).first()
                            if not team:
                                print(f"Team not found: {row['Team']}. Skipping row.")
                                continue

                            # Fetch the TeamYear
                            team_year = TeamYear.objects.filter(team=team, year=year).first()
                            if not team_year:
                                print(f"TeamYear not found for {row['Team']} ({year}). Skipping row.")
                                continue

                            # Map the relevant stats
                            defaults = {
                                "completions": row.get("Cmp", 0),
                                "attempts": row.get("Att", 0),
                                "completion_pct": row.get("Cmp%", 0),
                                "yards": row.get("Yds", 0),
                                "touchdowns": row.get("TD", 0),
                                "touchdown_pct":row.get("TD%",0),
                                "interceptions": row.get("Int", 0),
                                "interception_pct":row.get("Int%",0),
                                "yards_per_attempt": row.get("Y/A", 0),
                                "rating": row.get("Rate", 0),
                                "awards": row.get("Awards", None),
                            }

                            # Create or update the PassingStats record
                            PassingStats.objects.update_or_create(
                                player=player,
                                team_year=team_year,
                                year=year,
                                defaults=defaults
                            )
                        except Exception as e:
                            print(f"Error processing row: {row.to_dict()} - {e}")
                            continue
                except Exception as e:
                    print(f"Error processing file {file_path}: {e}")
        print("Passing stats import completed successfully.")
    def import_receiving_stats(self,receiving_dir):
        """
        Import receiving stats from CSV files in the given directory.
        Each file is named with the year (e.g., 2015.csv).
        """
        for file in os.listdir(receiving_dir):
            if file.endswith(".csv"):
                file_path = os.path.join(receiving_dir, file)
                try:
                    stats_data = pd.read_csv(file_path)
                    year = int(file.split(".")[0])  # Extract year from filename

                    print(f"Processing receiving stats for year: {year}")
                    for _, row in stats_data.iterrows():
                        try:
                            # Fetch the Player
                            player_name = normalize_name(row["Player"])
                            player = Player.objects.filter(name=player_name).first()
                            if not player:
                                print(f"Player not found: {row['Player']}. Skipping row.")
                                continue

                            # Fetch the Team
                            team = Team.objects.filter(name=row["Team"]).first()
                            if not team:
                                print(f"Team not found: {row['Team']}. Skipping row.")
                                continue

                            # Fetch the TeamYear
                            team_year = TeamYear.objects.filter(team=team, year=year).first()
                            if not team_year:
                                print(f"TeamYear not found for {row['Team']} ({year}). Skipping row.")
                                continue

                            # Map the relevant stats
                            defaults = {
                                "receptions": row.get("Rec", 0),
                                "yards": row.get("Yds", 0),
                                "yards_per_reception": row.get("Y/R", 0),
                                "touchdowns": row.get("TD", 0),
                                "games_played": row.get("G", 0),
                                "yards_per_game": row.get("Y/G", 0.0),
                                "awards": row.get("Awards", None),
                            }

                            # Create or update the ReceivingStats record
                            ReceivingStats.objects.update_or_create(
                                player=player,
                                team_year=team_year,
                                year=year,
                                defaults=defaults
                            )
                        except Exception as e:
                            print(f"Error processing row: {row.to_dict()} - {e}")
                            continue
                except Exception as e:
                    print(f"Error processing file {file_path}: {e}")
        print("Receiving stats import completed successfully.")
    def import_rushing_stats(self,rushing_dir):
        """
        Import rushing stats from CSV files in the given directory.
        Each file is named with the year (e.g., 2015.csv).
        """
        for file in os.listdir(rushing_dir):
            if file.endswith(".csv"):
                file_path = os.path.join(rushing_dir, file)
                try:
                    stats_data = pd.read_csv(file_path)
                    year = int(file.split(".")[0])  # Extract year from filename

                    print(f"Processing rushing stats for year: {year}")
                    for _, row in stats_data.iterrows():
                        try:
                            # Fetch the Player
                            player_name = normalize_name(row["Player"])
                            player = Player.objects.filter(name=player_name).first()
                            if not player:
                                """print(f"Player not found: {normalize_name(row['Player'])}. Skipping row.")"""
                                continue

                            # Fetch the Team
                            team = Team.objects.filter(name=row["Team"]).first()
                            if not team:
                                print(f"Team not found: {row['Team']}. Skipping row.")
                                continue

                            # Fetch the TeamYear
                            team_year = TeamYear.objects.filter(team=team, year=year).first()
                            if not team_year:
                                print(f"TeamYear not found for {row['Team']} ({year}). Skipping row.")
                                continue

                            # Map the relevant stats
                            defaults = {
                                "attempts": row.get("Att", 0),
                                "yards": row.get("Yds", 0),
                                "yards_per_attempt": row.get("Y/A", 0.0),
                                "touchdowns": row.get("TD", 0),
                                "yards_per_game": row.get("Y/G", 0.0),
                                "awards": row.get("Awards", None),
                            }

                            # Create or update the RushingStats record
                            RushingStats.objects.update_or_create(
                                player=player,
                                team_year=team_year,
                                year=year,
                                defaults=defaults
                            )
                        except Exception as e:
                            print(f"Error processing row: {row.to_dict()} - {e}")
                            continue
                except Exception as e:
                    print(f"Error processing file {file_path}: {e}")
        print("Rushing stats import completed successfully.")