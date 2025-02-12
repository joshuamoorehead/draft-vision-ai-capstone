from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
import time

# Initialize WebDriver
driver = webdriver.Chrome()

try:
    print("Starting the Selenium script...")

    # Open the web app
    print("Opening the web app...")
    driver.get("https://draftvision-ai-cfd79.web.app/")
    print("Web app opened successfully.")

    # Wait for the "Mock Draft" link and click it
    print("Waiting for 'Mock Draft' link...")
    mock_draft_link = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.LINK_TEXT, "Mock Draft"))
    )
    print("'Mock Draft' link found. Clicking...")
    mock_draft_link.click()
    print("'Mock Draft' page opened.")

    # Confirm navigation to the mock draft page
    print("Confirming navigation to the mock draft page...")
    WebDriverWait(driver, 10).until(
        EC.url_contains("/mockdraft")
    )
    print("Successfully navigated to the mock draft page.")

    # Click "Select All Teams"
    print("Waiting for 'Select All Teams' button...")
    select_all_button = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "button.w-6.h-6.border-2.border-black.rounded-full.bg-gray-300"))
    )
    print("'Select All Teams' button found. Clicking...")
    select_all_button.click()
    print("'Select All Teams' button clicked.")

    # Set the draft rounds to 7
    print("Waiting for draft rounds dropdown...")
    rounds_dropdown = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "select.ml-2.px-2.py-1.bg-gray-200.rounded"))
    )
    print("Draft rounds dropdown found. Setting to 7 rounds...")
    select = Select(rounds_dropdown)
    select.select_by_visible_text("7")
    print("Draft rounds set to 7.")

    # Set the timer to 600 seconds
    print("Waiting for timer dropdown...")
    # Wait for the timer dropdown to load fully
    timer_dropdown = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "select.ml-2.px-2.py-1.bg-gray-200.rounded"))
    )
    print("Timer dropdown found. Verifying options...")

    # Debug: Print available options
    print("Available options:")
    for option in Select(timer_dropdown).options:
        print(option.text)

    # Set the value "600" directly
    print("Setting timer to 600 seconds...")
    try:
        timer_select = Select(timer_dropdown)
        timer_select.select_by_value("600")
    except Exception as e:
        print("Select failed, trying direct option click...")
        option = timer_dropdown.find_element(By.XPATH, "//option[@value='600']")
        option.click()

    print("Timer set to 600 seconds.")


    # Enter the draft
    print("Waiting for 'Enter Draft' button...")
    enter_draft_button = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "button.mt-8.px-6.py-2.bg-white.text-black.text-lg.font-semibold.rounded.hover\\:bg-gray-200"))
    )
    print("'Enter Draft' button found. Clicking...")
    enter_draft_button.click()
    print("'Enter Draft' button clicked.")

    # Start the draft
    print("Waiting for 'Start Draft' button...")
    start_draft_button = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "button.mt-8.mb-8.px-6.py-2.bg-white.text-black.text-lg.font-semibold.rounded.hover\\:bg-gray-200"))
    )
    print("'Start Draft' button found. Clicking...")
    start_draft_button.click()
    print("'Start Draft' button clicked.")

    print("Draft setup completed successfully!")
    for pick_number in range(1, 219):  # Adjust based on the actual number of picks
        print(f"Making pick {pick_number}...")
        
        # Wait for the pick buttons to load
        pick_button = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "button.ml-4.px-4.py-2.bg-blue-500.text-white.rounded"))
        )
        pick_button.click()
        
        # Small delay to ensure the next pick starts
        time.sleep(1)

    print("Draft completed successfully!")
    # After all picks are made, wait for the "Draft Complete" message
    # Wait a bit before checking for the "Draft Complete" message
    print("Waiting for the draft to complete...")
    time.sleep(5)  # Adjust delay as needed based on how long it takes to show up

    # Wait for the "Draft Complete" message
    draft_complete_message = WebDriverWait(driver, 15).until(
        EC.presence_of_element_located((By.XPATH, "//h2[text()='Draft Complete!']"))
    )
    print("'Draft Complete' message found.")

    # Click "Return to Mock Draft Home" button
    print("Waiting for 'Return to Mock Draft Home' button...")
    return_home_button = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//button[text()='Return to Mock Draft Home']"))
    )
    return_home_button.click()
    print("'Return to Mock Draft Home' button clicked.")

    # Verify navigation back to the mock draft home
    print("Verifying navigation back to mock draft home...")
    enter_draft_button = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "button.mt-8.px-6.py-2.bg-white.text-black.text-lg.font-semibold.rounded.hover\\:bg-gray-200"))
    )
    print("Navigation successful. 'Enter Draft' button is visible.")
except Exception as e:
    print("Error occurred:", e)

finally:
    print("Closing the browser...")
    driver.quit()
    print("Browser closed. Selenium script finished.")