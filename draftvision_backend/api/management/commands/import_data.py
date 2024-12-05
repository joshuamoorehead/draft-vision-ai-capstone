import os
import json
import pandas as pd
from django.core.management.base import BaseCommand
from django.db import connection, transaction


def normalize_name(name):
    """Normalize player names by removing extra characters."""
    return name.replace("*", "").strip()


def execute_sql(sql, params=None):
    """Execute raw SQL with optional parameters."""
    with connection.cursor() as cursor:
        cursor.execute(sql, params or [])


class Command(BaseCommand):
    help = "Import data files into the database"

    def handle(self, *args, **options):
        """Handle the overall import process."""
        data_dir = "data"  # Directory containing your data files

        self.stdout.write("Starting data import...")
        try:
            self.import_full_player_list(os.path.join(data_dir, "fullplayerlist.json"))
            self.import_teams(os.path.join(data_dir, "teams"))
            self.import_draft(os.path.join(data_dir, "draft"))
            self.import_passing_stats(os.path.join(data_dir, "passing"))
            self.import_receiving_stats(os.path.join(data_dir, "receiving"))
            self.import_rushing_stats(os.path.join(data_dir, "rushing"))
        except Exception as e:
            self.stdout.write(f"Error during import: {e}")
        self.stdout.write("All data imported successfully!")

    @transaction.atomic
    def import_full_player_list(self, full_player_list_path):
        """Import the full player list into the database."""
        if not os.path.exists(full_player_list_path):
            self.stdout.write(f"File {full_player_list_path} not found. Skipping.")
            return

        self.stdout.write(f"Processing file: {full_player_list_path}")
        with open(full_player_list_path, "r") as f:
            player_data = json.load(f)
            for player in player_data:
                try:
                    sql = """
                    INSERT INTO core_player (name, position, school, height, weight, years_ncaa)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (name) DO NOTHING;
                    """
                    params = (
                        normalize_name(player["name"]),
                        player.get("position", "Unknown"),
                        player.get("school", None),
                        player.get("height", None),
                        player.get("weight", None),
                        json.dumps(player.get("years_ncaa", [])),
                    )
                    execute_sql(sql, params)
                except Exception as e:
                    self.stdout.write(f"Error processing player: {player}")
                    self.stdout.write(f"Error: {e}")
                    continue
        self.stdout.write("Full player list imported successfully.")

    @transaction.atomic
    def import_teams(self, teams_dir):
        """Import teams and their strength of schedule (SOS)."""
        for file in os.listdir(teams_dir):
            if file.endswith(".csv"):
                file_path = os.path.join(teams_dir, file)
                try:
                    team_data = pd.read_csv(file_path)
                    year = int(file.split(".")[0])  # Extract year from filename

                    for _, row in team_data.iterrows():
                        sql_team = """
                        INSERT INTO core_team (name)
                        VALUES (%s)
                        ON CONFLICT (name) DO NOTHING;
                        """
                        sql_team_year = """
                        INSERT INTO core_teamyear (team_id, year, sos)
                        VALUES (
                            (SELECT id FROM core_team WHERE name = %s),
                            %s,
                            %s
                        )
                        ON CONFLICT (team_id, year) DO UPDATE SET sos = EXCLUDED.sos;
                        """
                        params_team = (row["School"],)
                        params_team_year = (row["School"], year, row["SOS"])
                        execute_sql(sql_team, params_team)
                        execute_sql(sql_team_year, params_team_year)
                except Exception as e:
                    self.stdout.write(f"Error processing file: {file_path}")
                    self.stdout.write(f"Error: {e}")
                    continue
        self.stdout.write("Teams and their SOS imported successfully.")

    @transaction.atomic
    def import_draft(self, draft_dir):
        """Import draft information."""
        for file in os.listdir(draft_dir):
            if file.endswith(".json"):
                file_path = os.path.join(draft_dir, file)
                try:
                    with open(file_path, "r") as f:
                        draft_data = json.load(f)
                        for player_data in draft_data:
                            try:
                                sql = """
                                INSERT INTO core_draftinfo (player_id, draft_av)
                                VALUES (
                                    (SELECT id FROM core_player WHERE name = %s),
                                    %s
                                )
                                ON CONFLICT (player_id) DO UPDATE SET draft_av = EXCLUDED.draft_av;
                                """
                                params = (
                                    normalize_name(player_data["name"]),
                                    player_data.get("draft_av", None),
                                )
                                execute_sql(sql, params)
                            except Exception as e:
                                self.stdout.write(f"Error processing player data: {player_data} - {str(e)}")
                except FileNotFoundError:
                    self.stdout.write(f"File not found: {file_path}")
                except json.JSONDecodeError as e:
                    self.stdout.write(f"Error decoding JSON from file {file_path}: {str(e)}")

        self.stdout.write("Draft data imported successfully.")

    @transaction.atomic
    def import_passing_stats(self, passing_dir):
        """Import passing stats."""
        self._import_stats(passing_dir, "core_passingstats", {
            "Cmp": "completions",
            "Att": "attempts",
            "Cmp%": "completion_pct",
            "Yds": "yards",
            "TD": "touchdowns",
            "TD%": "touchdown_pct",
            "Int": "interceptions",
            "Int%": "interception_pct",
            "Y/A": "yards_per_attempt",
            "Rate": "rating",
            "Awards": "awards",
        })

    @transaction.atomic
    def import_receiving_stats(self, receiving_dir):
        """Import receiving stats."""
        self._import_stats(receiving_dir, "core_receivingstats", {
            "Rec": "receptions",
            "Yds": "yards",
            "Y/R": "yards_per_reception",
            "TD": "touchdowns",
            "G": "games_played",
            "Y/G": "yards_per_game",
            "Awards": "awards",
        })

    @transaction.atomic
    def import_rushing_stats(self, rushing_dir):
        """Import rushing stats."""
        self._import_stats(rushing_dir, "core_rushingstats", {
            "Att": "attempts",
            "Yds": "yards",
            "Y/A": "yards_per_attempt",
            "TD": "touchdowns",
            "Y/G": "yards_per_game",
            "Awards": "awards",
        })

    def _import_stats(self, stats_dir, table_name, column_mapping):
        """Generic method to import stats data."""
        for file in os.listdir(stats_dir):
            if file.endswith(".csv"):
                file_path = os.path.join(stats_dir, file)
                try:
                    stats_data = pd.read_csv(file_path)
                    stats_data.rename(columns=column_mapping, inplace=True)
                    year = int(file.split(".")[0])  # Extract year from filename

                    for _, row in stats_data.iterrows():
                        sql = f"""
                        INSERT INTO {table_name} (player_id, team_year_id, year, {", ".join(column_mapping.values())})
                        VALUES (
                            (SELECT id FROM core_player WHERE name = %s),
                            (SELECT id FROM core_teamyear WHERE team_id = (SELECT id FROM core_team WHERE name = %s) AND year = %s),
                            %s,
                            {", ".join(["%s"] * len(column_mapping))}
                        )
                        ON CONFLICT (player_id, team_year_id, year) DO UPDATE SET {", ".join([f"{col} = EXCLUDED.{col}" for col in column_mapping.values()])};
                        """
                        params = (
                            normalize_name(row["Player"]),
                            row["Team"], year, year,
                        ) + tuple(row[col] for col in column_mapping.values())
                        execute_sql(sql, params)
                except Exception as e:
                    self.stdout.write(f"Error processing file {file_path}: {e}")
        self.stdout.write(f"{table_name} import completed successfully.")
