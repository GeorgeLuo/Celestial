from extractor import extract_page
from selenium import webdriver
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.by import By
import time


width = 1280
height = 720

options = webdriver.ChromeOptions()
options.headless = True
driver = webdriver.Chrome(options=options)
driver.set_window_size(width, height)

page = extract_page("https://google.com", driver=driver, render_dir="./renders")
print(page.elements)

def infer_interface_flows(page):
    return {
  "interface_id": "Google Search",
  "user_flows": [
    {
      "user_flow_id": "Search",
      "steps": [
        {
          "user_input_type": "input_text",
          "data": "*",
          "intent": "Enter search query"
        },
        {
          "user_input_type": "click",
          "x": 1314,
          "y": 651,
          "intent": "Click 'I'm Feeling Lucky'"
        }
      ]
    },
    {
      "user_flow_id": "Sign In",
      "steps": [
        {
          "user_input_type": "click",
          "x": 697,
          "y": 154,
          "intent": "Click 'Sign in to Google'"
        }
      ]
    }
  ]
}

interface_flows = infer_interface_flows(page)

def do_step(driver, step):
    print(step)
    if step["user_input_type"] == "input_text":
        active_element = driver.switch_to.active_element
        active_element.send_keys(step["data"])
    if step["user_input_type"] == "click":
        actions = ActionChains(driver)
        # actions.move_by_offset(step["x"], step["y"]).click().perform()
        
        actions.move_to_element_with_offset(driver.find_element(By.TAG_NAME, 'body'), 10000,720/2)
        print("done")
        # actions.move_by_offset(200, 200).click().perform()
        actions.move_by_offset(step["x"], step["y"]).click().perform()



for flow in interface_flows["user_flows"]:
    if flow["user_flow_id"] == "Search":
        time.sleep(5)
        for step in flow["steps"]:
            do_step(driver, step)
            print(driver.find_element(By.TAG_NAME, 'body').location)
            print(driver.find_element(By.TAG_NAME, 'body').size)
    
        time.sleep(60)

