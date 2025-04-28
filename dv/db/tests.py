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
import uuid


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
            print("Waiting for 'Enter Draft Room' button...")
            enter_button = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable(
                (   By.XPATH, "//button[normalize-space(text())='Enter Draft Room']")
                )
            )
            print("✅ 'Enter Draft Room' button found. Clicking...")
            enter_button.click()
            print("✅ Enter Draft Room button clicked.")
            print("Waiting for 'Start Draft' button...")
            start_button = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable(
                    (By.XPATH, "//button[normalize-space(text())='Start Draft']")
                )
            )
            print("✅ 'Start Draft' button found. Clicking...")
            start_button.click()
            print("✅ Start Draft button clicked.")    
            print("Waiting for 'Return Home' button (up to 40s)...")
            return_home_btn = WebDriverWait(driver, 40).until(
                EC.element_to_be_clickable(
                    (By.XPATH, "//button[normalize-space(text())='Return Home']")
                )
            )
            print("✅ 'Return Home' button found. Clicking...")
            return_home_btn.click()
            print("✅ Return Home button clicked.")
        except Exception as e:
            print("❌ Error occurred:", e)

        finally:
            print("Closing the browser...")
            driver.quit()
            print("✅ Browser closed. Mock draft Selenium script finished.\n")
    def test_player_list(self):
        print("🚀 Running Selenium Player List Test: Opening the home page and navigating through Player List.")
        driver = webdriver.Chrome()
        try:
            # 1) Open the web app
            print("Opening the web app...")
            driver.get("https://draftvision-ai-cfd79.web.app/")
            print("✅ Web app opened successfully.")

            # 2) Click the "Draft Tools" dropdown
            print("Waiting for 'Draft Tools' dropdown...")
            draft_tools_btn = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable(
                    (By.XPATH, "//button[normalize-space(text())='Draft Tools']")
                )
            )
            draft_tools_btn.click()
            print("✅ 'Draft Tools' dropdown clicked.")

            # 3) Click the "Player List" option
            print("Waiting for 'Player List' link...")
            player_list_link = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.LINK_TEXT, "Player List"))
            )
            player_list_link.click()
            print("✅ 'Player List' clicked.")

            # 4) Click the first arrow SVG to expand details
            print("Waiting for first arrow icon...")
            arrows = WebDriverWait(driver, 10).until(
                EC.presence_of_all_elements_located(
                    (By.CSS_SELECTOR, "svg.h-6.w-6.text-white")
                )
            )
            arrows[0].click()
            print("✅ First arrow icon clicked.")

            # 5) Click the "Stats" button
            print("Waiting for 'Stats' button...")
            stats_btn = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable(
                    (By.XPATH, "//button[normalize-space(text())='Stats']")
                )
            )
            stats_btn.click()
            print("✅ 'Stats' button clicked.")

            # 6) Click the "Back to List" button
            print("Waiting for 'Back to List' button...")
            back_btn = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable(
                    (By.XPATH, "//button[normalize-space(text())='Back to List']")
                )
            )
            back_btn.click()
            print("✅ 'Back to List' button clicked.")

        except Exception as e:
            print("❌ Error occurred:", e)
            self.fail(f"Selenium Player List test failed: {e}")

        finally:
            print("Closing the browser for Player List test...")
            driver.quit()
            print("✅ Browser closed. Player List test finished.\n")
    def test_big_board_flow(self):
        """Selenium test: open home, navigate to Big Board, drill into Impact, then return."""
        print("🚀 Running Selenium Big Board Test.")
        driver = webdriver.Chrome()
        try:
            # 1) Open the web app
            print("Opening the web app...")
            driver.get("https://draftvision-ai-cfd79.web.app/")
            print("✅ Web app opened successfully.")

            # 2) Click the "Draft Tools" dropdown
            print("Waiting for 'Draft Tools' dropdown...")
            draft_tools_btn = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable(
                    (By.XPATH, "//button[normalize-space(text())='Draft Tools']")
                )
            )
            draft_tools_btn.click()
            print("✅ 'Draft Tools' dropdown clicked.")

            # 3) Click the "Big Board" option
            print("Waiting for 'Big Board' link...")
            big_board_link = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.LINK_TEXT, "Big Board"))
            )
            big_board_link.click()
            print("✅ 'Big Board' clicked.")

            # 4) Click the first arrow icon to expand
            print("Waiting for first arrow icon...")
            arrows = WebDriverWait(driver, 10).until(
                EC.presence_of_all_elements_located(
                    (By.CSS_SELECTOR, "svg.h-6.w-6.text-white")
                )
            )
            arrows[0].click()
            print("✅ First arrow icon clicked.")

            # 5) Click the "Impact" button
            print("Waiting for 'Impact' button...")
            impact_btn = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable(
                    (By.XPATH, "//button[normalize-space(text())='Impact']")
                )
            )
            impact_btn.click()
            print("✅ 'Impact' button clicked.")

            # 6) Click the "Back to List" button
            print("Waiting for 'Back to List' button...")
            back_btn = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable(
                    (By.XPATH, "//button[normalize-space(text())='Back to List']")
                )
            )
            back_btn.click()
            print("✅ 'Back to List' button clicked.")

        except Exception as e:
            print("❌ Error in Big Board test:", e)
            self.fail(f"Selenium Big Board test failed: {e}")
        finally:
            print("Closing the browser for Big Board test...")
            driver.quit()
            print("✅ Browser closed. Big Board test finished.\n")
    def test_player_comparison_flow(self):
        print("🚀 Running Selenium Player Comparison Test.")
        driver = webdriver.Chrome()
        try:
            # 1) Open the web app and open the Draft Tools menu
            driver.get("https://draftvision-ai-cfd79.web.app/")
            WebDriverWait(driver, 15).until(
                EC.element_to_be_clickable((By.XPATH, "//button[normalize-space(text())='Draft Tools']"))
            ).click()

            # 2) Navigate to Player Comparison
            WebDriverWait(driver, 15).until(
                EC.element_to_be_clickable((By.LINK_TEXT, "Player Comparison"))
            ).click()

            # 3) First search: type 'a' and click “Richie James”
            first_input = WebDriverWait(driver, 15).until(
                EC.presence_of_all_elements_located(
                    (By.CSS_SELECTOR, 'input[placeholder="Search for a player..."]')
                )
            )[0]
            first_input.send_keys("a")
            WebDriverWait(driver, 15).until(
                EC.element_to_be_clickable((
                    By.XPATH,
                    "//div[@class='text-white font-medium' and normalize-space(.)='Richie James']"
                ))
            ).click()
            print("✅ Selected Richie James")

            # 4) Second search: type 'b' and click “Arizona State”
            second_input = WebDriverWait(driver, 15).until(
                EC.presence_of_all_elements_located(
                    (By.CSS_SELECTOR, 'input[placeholder="Search for a player..."]')
                )
            )[1]
            second_input.send_keys("b")
            WebDriverWait(driver, 15).until(
                EC.element_to_be_clickable((
                    By.XPATH,
                    "//div[@class='text-gray-400 text-sm' and normalize-space(.)='Arizona State']"
                ))
            ).click()
            print("✅ Selected Eno Benjamin")

            # 5) Finally click Compare Different Players
            WebDriverWait(driver, 30).until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Compare Different Players')]"))
            ).click()
            print("✅ Player Comparison flow succeeded.")

        except Exception as e:
            print("❌ Error in Player Comparison test:", e)
            self.fail(f"Player Comparison test failed: {e}")
        finally:
            driver.quit()
            print("✅ Browser closed for Player Comparison.\n")

    def test_player_prediction_flow(self):
        print("🚀 Running Selenium Player Prediction Test.")
        driver = webdriver.Chrome()
        try:
            print("Opening the web app...")
            driver.get("https://draftvision-ai-cfd79.web.app/")
            print("✅ Web app opened successfully.")

            print("Opening 'Draft Tools'...")
            WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//button[normalize-space(text())='Draft Tools']"))
            ).click()

            print("Selecting 'Player Prediction'...")
            WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.LINK_TEXT, "Player Prediction"))
            ).click()

            print("Entering player name 'test'...")
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, 'input[placeholder="Enter player name"]'))
            ).send_keys("test")

            print("Selecting position QB...")
            Select(WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "select"))
            )).select_by_value("QB")

            print("Entering passing yards…")
            passing_fields = WebDriverWait(driver, 10).until(
                EC.presence_of_all_elements_located((By.CSS_SELECTOR, 'input[placeholder="Enter passing yards"]'))
            )
            if len(passing_fields) == 1:
                # if only one field rendered, use it twice
                passing_fields[0].send_keys("100")
                passing_fields[0].send_keys("100")
            else:
                passing_fields[0].send_keys("100")
                passing_fields[1].send_keys("100")
            print("✅ Passing yards entered.")

            print("Entering touchdowns and interceptions…")
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, 'input[placeholder="Enter touchdowns"]'))
            ).send_keys("100")
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, 'input[placeholder="Enter interceptions"]'))
            ).send_keys("100")
            print("✅ TDs and INTs entered.")

            print("Clicking 'Create Player'…")
            WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//button[normalize-space(text())='Create Player']"))
            ).click()

            print("Clicking 'Create Another Player'…")
            WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//button[normalize-space(text())='Create Another Player']"))
            ).click()

        except Exception as e:
            print("❌ Error in Player Prediction test:", e)
            self.fail(f"Player Prediction test failed: {e}")
        finally:
            driver.quit()
            print("✅ Browser closed for Player Prediction.\n")
    def test_community_flow(self):
        print("🚀 Running Selenium Community Test.")
        driver = webdriver.Chrome()
        try:
            # 1) Open the web app
            driver.get("https://draftvision-ai-cfd79.web.app/")
            print("✅ Home page opened.")

            # 2) Click the top‐nav "Community" link
            WebDriverWait(driver, 15).until(
                EC.element_to_be_clickable((By.LINK_TEXT, "Community"))
            ).click()
            print("✅ Navigated to Community page.")

            # 3) Click the first "View Draft" button
            WebDriverWait(driver, 15).until(
                EC.element_to_be_clickable(
                    (By.XPATH, "//button[normalize-space(text())='View Draft']")
                )
            ).click()
            print("✅ Clicked first 'View Draft' button.")

        except Exception as e:
            print("❌ Error in Community test:", e)
            self.fail(f"Community test failed: {e}")
        finally:
            driver.quit()
            print("✅ Browser closed for Community test.\n")
    def test_login_flow(self):
        print("🚀 Running Selenium Login Test.")
        driver = webdriver.Chrome()
        try:
            # 1) Open the web app
            driver.get("https://draftvision-ai-cfd79.web.app/")
            print("✅ Home page opened.")

            # 2) Click the "Log In" button
            WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable(
                    (By.XPATH, "//button[normalize-space(text())='Log In']")
                )
            ).click()
            print("✅ 'Log In' clicked.")

            # 3) Enter email
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, "email"))
            ).send_keys("draftvisionAI@test.com")
            print("✅ Entered email.")

            # 4) Enter password
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, "password"))
            ).send_keys("DraftVision123")
            print("✅ Entered password.")

            # 5) Click the form's "Sign In" submit button
            WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((
                    By.XPATH,
                    "//div[contains(@class,'flex items-center justify-between')]/button[@type='submit' and normalize-space(text())='Sign In']"
                ))
            ).click()
            print("✅ Submitted login form (Sign In).")

        except Exception as e:
            print("❌ Error in Login test:", e)
            self.fail(f"Login test failed: {e}")
        finally:
            driver.quit()
            print("✅ Browser closed for Login test.\n")
    def test_signup_flow(self):
        print("🚀 Running Selenium Sign Up Test.")
        driver = webdriver.Chrome()
        try:
            # 1) Open the web app
            driver.get("https://draftvision-ai-cfd79.web.app/")
            print("✅ Home page opened.")

            # 2) Click the "Sign Up" button in the top nav
            WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable(
                    (By.XPATH, "//button[normalize-space(text())='Sign Up']")
                )
            ).click()
            print("✅ 'Sign Up' clicked (nav).")

            # generate a unique email
            unique_email = f"test+{uuid.uuid4().hex[:8]}@email.com"
            print(f"ℹ️  Using unique signup email: {unique_email}")

            # 3) Enter sign-up details
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, "signup-email"))
            ).send_keys(unique_email)
            print("✅ Entered signup email.")

            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, "signup-username"))
            ).send_keys("tester")
            print("✅ Entered signup username.")

            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, "signup-password"))
            ).send_keys("password123")
            print("✅ Entered signup password.")

            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, "confirm-password"))
            ).send_keys("password123")
            print("✅ Confirmed signup password.")

            # 4) Click the form's "Sign Up" submit button
            WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((
                    By.XPATH,
                    "//div[contains(@class,'flex items-center justify-center')]/button[@type='submit' and normalize-space(text())='Sign Up']"
                ))
            ).click()
            print("✅ Submitted signup form (Sign Up).")


        except Exception as e:
            print("❌ Error in Sign Up test:", e)
            self.fail(f"Sign Up test failed: {e}")
        finally:
            driver.quit()
            print("✅ Browser closed for Sign Up test.\n")
