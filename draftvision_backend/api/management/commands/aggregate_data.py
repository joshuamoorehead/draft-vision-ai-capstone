from django.core.management.base import BaseCommand
from api.core.models import Player, PassingStats, RushingStats, ReceivingStats, TeamYear, DraftInfo
import pandas as pd


class Command(BaseCommand):
    help = "Aggregate player data and export it into a unified dataset"

    def handle(self, *args, **kwargs):
        # Initialize a list to hold all player stats
        data = []

        # Loop through all players
        for player in Player.objects.all():
            # Get stats for each year
            years = set(
                PassingStats.objects.filter(player=player).values_list('year', flat=True)
            ) | set(
                RushingStats.objects.filter(player=player).values_list('year', flat=True)
            ) | set(
                ReceivingStats.objects.filter(player=player).values_list('year', flat=True)
            )

            # Fetch draft info
            draft_info = player.draft_info.first()  # Assuming a relationship exists
            draft_av = draft_info.draft_av if draft_info else None

            # Loop through each year
            for year in years:
                # Fetch stats for the year
                passing = PassingStats.objects.filter(player=player, year=year).first()
                rushing = RushingStats.objects.filter(player=player, year=year).first()
                receiving = ReceivingStats.objects.filter(player=player, year=year).first()

                # Fetch SOS for the year
                team_year = passing.team_year if passing else rushing.team_year if rushing else receiving.team_year if receiving else None

                # Determine if the player played in 2023
                played_in_2023 = year == 2023

                # Apply draft_av rules
                if draft_av is None:
                    if played_in_2023:
                        draft_av = None
                    else:
                        draft_av = 0

                # Compile the stats for this player-year
                row = {
                    "Player": player.name,
                    "Position": player.position,
                    "Year": year,
                    "Team": team_year.team.name if team_year else None,
                    "SOS": team_year.sos if team_year else None,
                    "Draft AV": draft_av,
                    # Passing stats
                    "Completions": passing.completions if passing else 0,
                    "Attempts": passing.attempts if passing else 0,
                    "Passing Yards": passing.yards if passing else 0,
                    "Passing Touchdowns": passing.touchdowns if passing else 0,
                    "Interceptions": passing.interceptions if passing else 0,
                    "Passer Rating": passing.rating if passing else None,
                    # Rushing stats
                    "Rushing Attempts": rushing.attempts if rushing else 0,
                    "Rushing Yards": rushing.yards if rushing else 0,
                    "Rushing Touchdowns": rushing.touchdowns if rushing else 0,
                    "Yards per Attempt": rushing.yards_per_attempt if rushing else None,
                    # Receiving stats
                    "Receptions": receiving.receptions if receiving else 0,
                    "Receiving Yards": receiving.yards if receiving else 0,
                    "Receiving Touchdowns": receiving.touchdowns if receiving else 0,
                    "Yards per Reception": receiving.yards_per_reception if receiving else None,
                }

                data.append(row)

        # Create a DataFrame from the collected data
        df = pd.DataFrame(data)
        print(df.columns)
        print(df.head())

        # Add aggregated stats
        aggregated_data = df.groupby("Player").agg({
            "Completions": "sum",
            "Attempts": "sum",
            "Passing Yards": "sum",
            "Passing Touchdowns": "sum",
            "Interceptions": "sum",
            "Rushing Attempts": "sum",
            "Rushing Yards": "sum",
            "Rushing Touchdowns": "sum",
            "Receptions": "sum",
            "Receiving Yards": "sum",
            "Receiving Touchdowns": "sum",
            "SOS": "mean",  # Average SOS over career
            "Draft AV": "mean"  # Aggregated Draft AV
        }).reset_index()

        # Add an identifier for the aggregated row
        aggregated_data["Year"] = "Career Totals"
        aggregated_data["Position"] = "N/A"

        # Combine yearly data with aggregated data
        final_df = pd.concat([df, aggregated_data], ignore_index=True)

        # Save the DataFrame as a CSV
        output_file = "data/player_aggregated_stats.csv"
        final_df.to_csv(output_file, index=False)
        # Assuming 'final_df' is your aggregated DataFrame

        # Step 1: Identify players with entries for the 2023 season
        players_with_2023 = final_df[final_df['Year'] == 2023]['Player'].unique()

        # Step 2: Split the data into two groups
        # Players with entries for 2023
        df_with_2023 = final_df[final_df['Player'].isin(players_with_2023)]

        # Players without entries for 2023
        df_without_2023 = final_df[~final_df['Player'].isin(players_with_2023)]

        # Step 3: Save the DataFrames as CSV files
        df_with_2023.to_csv('data/players_with_2023.csv', index=False)
        df_without_2023.to_csv('data/players_without_2023.csv', index=False)

        # Optional: Save the combined DataFrame
        final_df.to_csv('data/all_players_data.csv', index=False)

        print("Data has been split and saved successfully.")
        self.stdout.write(f"Data aggregation completed! Output saved to {output_file}")
        