import getopt
import sys

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.firefox.options import Options
import time

def click_and_refresh(argv):
    global proof
    arg_username = ""
    arg_password = ""
    arg_help = "{0} -u <username> -p <password>".format(argv[0])

    try:
        opts, args = getopt.getopt(argv[1:], "hu:p:", ["help", "username=", "password="])
    except getopt.GetoptError:
        print(arg_help)
        sys.exit(2)

    for opt, arg in opts:
        if opt in ("-h", "--help"):
            print(arg_help)  # print the help message
            sys.exit(2)
        elif opt in ("-u", "--username"):
            arg_username = arg
        elif opt in ("-p", "--password"):
            arg_password = arg

    options = Options()
    options.headless = True  # Enable headless mode

    driver = webdriver.Firefox(options=options)
    try:
        driver.get("https://www.zikinf.com/")
        time.sleep(1)
        driver.find_element(By.ID, "ZKMMConnexion").send_keys(Keys.ENTER)
        time.sleep(1)
        driver.find_element(By.ID, "input_username").send_keys(arg_username)
        time.sleep(1)
        driver.find_element(By.ID, "input_password").send_keys(arg_password)
        time.sleep(1)
        driver.find_element(By.NAME, "login").click()
        time.sleep(1)
        driver.get("https://www.zikinf.com/compte/annonces")
        time.sleep(1)
        proof = driver.find_element(By.CLASS_NAME, "a__hColor").get_attribute("href")
        time.sleep(1)
        refresh = driver.find_element(By.CLASS_NAME, "bt_update")
        if refresh:
            refresh.click()
        print(proof)

    finally:
        driver.quit()  # Use quit() instead of close() to properly close the browser

if __name__ == "__main__":
    click_and_refresh(sys.argv)