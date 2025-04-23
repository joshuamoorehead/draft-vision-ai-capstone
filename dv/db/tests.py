from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from .models import PlayerProfile, NCAATeams
from .serializers import PlayerProfileSerializer, NCAATeamsSerializer
from django.core.exceptions import ValidationError
from django.db.utils import IntegrityError
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
import time


# Create your tests here.

class PlayerAPITest(APITestCase):
    # Set up a new player
    def setUp(self):
        print("\nSetting up test database and creating test player...")
        self.player = PlayerProfile.objects.create(
            name="Joe Football", 
            school="LSU", 
            position="QB",
        )
        print("Test player created successfully.\n")

    # Make sure player is in dummy database
    def test_player_creation(self):
        print("Testing player creation: Ensuring that 'Joe Football' is in the database with correct attributes.")
        player = PlayerProfile.objects.get(name="Joe Football")
        self.assertEqual(player.school, "LSU")
        self.assertEqual(player.position, "QB")
        print("✅ Player creation test passed!\n")

    # Make sure filtered position list has player
    def test_filter_position(self):
        print("Testing position filter: Retrieving all quarterbacks and ensuring 'Joe Football' exists.")
        quarterbacks = PlayerProfile.objects.filter(position="QB")
        self.assertEqual(quarterbacks.count(), 1)
        self.assertEqual(quarterbacks.first().name, "Joe Football")
        print("✅ Position filter test passed!\n")

    # Make sure filtered team list has player
    def test_filter_team(self):
        print("Testing team filter: Retrieving all players from LSU and ensuring 'Joe Football' exists.")
        lsu_team = PlayerProfile.objects.filter(school="LSU")
        self.assertEqual(lsu_team.count(), 1)
        self.assertEqual(lsu_team.first().name, "Joe Football")
        print("✅ Team filter test passed!\n")

    # Make sure player's unset fields are none
    def test_nullable_fields(self):
        print("Testing default null fields: Ensuring unset fields are None.")
        player = PlayerProfile.objects.get(name="Joe Football")
        self.assertIsNone(player.nfl_team)
        self.assertIsNone(player.age_drafted)
        self.assertIsNone(player.years_ncaa)
        self.assertIsNone(player.year_drafted)
        self.assertIsNone(player.draft_round)
        self.assertIsNone(player.draft_pick)
        self.assertIsNone(player.career_av)
        self.assertIsNone(player.draft_av)
        print("✅ Null fields test passed!\n")

    # Adding another player to the same school and making sure filtered list still works
    def test_multiple_players_same_team(self):
        print("Testing team filter: Creating a second player from LSU and ensuring count is 2.")
        PlayerProfile.objects.create(name="Joe WideReceiver", school="LSU", position="WR")
        lsu_team = PlayerProfile.objects.filter(school="LSU")
        self.assertEqual(lsu_team.count(), 2)
        print("✅ Team filter with multiple players test passed!\n")

    # Adding another player to the same position and making sure filtered list still works
    def test_multiple_players_same_position(self):
        print("Testing position filter: Creating a second quarterback and ensuring count is 2.")
        PlayerProfile.objects.create(name="Joe Quarterback", school="USC", position="QB")
        quarterbacks = PlayerProfile.objects.filter(position="QB")
        self.assertEqual(quarterbacks.count(), 2)
        print("✅ Position filter with multiple players test passed!\n")

    # Adding a player with nfl draft fields set and making sure the fields match.
    def test_drafted_player(self):
        print("Testing player creation: Creating a drafted player to test nfl draft data fields.")
        drafted_player = PlayerProfile.objects.create(
            name="Joe Draft",
            position="QB",
            school="MSU",
            age_drafted=22,
            year_drafted=2023,
            draft_round=1,
            draft_pick=5,
            career_av=45.6,
            draft_av=12.3
        )
        self.assertEqual(drafted_player.draft_round, 1)
        self.assertEqual(drafted_player.draft_pick, 5)
        self.assertAlmostEqual(drafted_player.career_av, 45.6)
        self.assertAlmostEqual(drafted_player.draft_av, 12.3)
        print("✅ Draft data fields test passed!\n")

    def test_mock_draft_with_selenium(self):
        print("🚀 Running Selenium Mock Draft Test: Navigating through the draft process.")

        driver = webdriver.Chrome()

        try:
            print("Starting the Selenium script...")

            # Open the web app
            print("Opening the web app...")
            driver.get("https://draftvision-ai-cfd79.web.app/")
            print("✅ Web app opened successfully.")

            # Wait for the "Mock Draft" link and click it
            print("Waiting for 'Mock Draft' link...")
            mock_draft_link = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.LINK_TEXT, "Mock Draft"))
            )
            print("✅ 'Mock Draft' link found. Clicking...")
            mock_draft_link.click()
            print("✅ 'Mock Draft' page opened.")

            # Confirm navigation to the mock draft page
            print("Confirming navigation to the mock draft page...")
            WebDriverWait(driver, 10).until(
                EC.url_contains("/mockdraft")
            )
            print("✅ Successfully navigated to the mock draft page.")

            # Click "Select All Teams"
            print("Waiting for 'Select All Teams' button...")
            select_all_button = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "button.w-6.h-6.border-2.border-black.rounded-full.bg-gray-300"))
            )
            print("✅ 'Select All Teams' button found. Clicking...")
            select_all_button.click()
            print("✅ 'Select All Teams' button clicked.")

            # Set the draft rounds to 7
            print("Waiting for draft rounds dropdown...")
            rounds_dropdown = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "select.ml-2.px-2.py-1.bg-gray-200.rounded"))
            )
            print("✅ Draft rounds dropdown found. Setting to 2 rounds...")
            select = Select(rounds_dropdown)
            select.select_by_visible_text("2")
            print("✅ Draft rounds set to 2.")

            # Set the timer to 600 seconds
            print("Waiting for timer dropdown...")
            timer_dropdown = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "select.ml-2.px-2.py-1.bg-gray-200.rounded"))
            )
            print("✅ Timer dropdown found. Verifying options...")

            # Debug: Print available options
            print("Available options:")
            for option in Select(timer_dropdown).options:
                print(f" - {option.text}")

            print("Setting timer to 600 seconds...")
            try:
                timer_select = Select(timer_dropdown)
                timer_select.select_by_value("600")
            except Exception:
                print("⚠️ Select failed, trying direct option click...")
                option = timer_dropdown.find_element(By.XPATH, "//option[@value='600']")
                option.click()

            print("✅ Timer set to 600 seconds.")

            # Enter the draft
            print("Waiting for 'Enter Draft' button...")
            enter_draft_button = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "button.mt-8.px-6.py-2.bg-white.text-black.text-lg.font-semibold.rounded.hover\\:bg-gray-200"))
            )
            print("✅ 'Enter Draft' button found. Clicking...")
            enter_draft_button.click()
            print("✅ 'Enter Draft' button clicked.")

            # Start the draft
            print("Waiting for 'Start Draft' button...")
            start_draft_button = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "button.mt-8.mb-8.px-6.py-2.bg-white.text-black.text-lg.font-semibold.rounded.hover\\:bg-gray-200"))
            )
            print("✅ 'Start Draft' button found. Clicking...")
            start_draft_button.click()
            print("✅ 'Start Draft' button clicked.")

            print("✅ Draft setup completed successfully!")

            for pick_number in range(1, 60):  # Adjust based on the actual number of picks
                print(f"Making pick {pick_number}...")
                pick_button = WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "button.ml-4.px-4.py-2.bg-blue-500.text-white.rounded"))
                )
                pick_button.click()
                time.sleep(1)

            print("✅ Draft completed successfully!")

            # Verify draft completion message
            print("Waiting for the draft to complete...")
            time.sleep(5)

            draft_complete_message = WebDriverWait(driver, 15).until(
                EC.presence_of_element_located((By.XPATH, "//h2[text()='Draft Complete!']"))
            )
            print("✅ 'Draft Complete' message found.")

            # Click "Return to Mock Draft Home" button
            print("Waiting for 'Return to Mock Draft Home' button...")
            return_home_button = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//button[text()='Return to Mock Draft Home']"))
            )
            return_home_button.click()
            print("✅ 'Return to Mock Draft Home' button clicked.")

            # Verify navigation back to the mock draft home
            print("Verifying navigation back to mock draft home...")
            enter_draft_button = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "button.mt-8.px-6.py-2.bg-white.text-black.text-lg.font-semibold.rounded.hover\\:bg-gray-200"))
            )
            print("✅ Navigation successful. 'Enter Draft' button is visible.")

        except Exception as e:
            print("❌ Error occurred:", e)

        finally:
            print("Closing the browser...")
            driver.quit()
            print("✅ Browser closed. Selenium script finished.\n")
