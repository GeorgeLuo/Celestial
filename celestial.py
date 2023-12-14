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

page = extract_page("https://google.com", driver=driver, render_dir="./renders", granularity=10)

def infer_interface_flows(page):
    return {
  "interface_id": "Google Search",
  "user_flows": [
    {
      "user_flow_id": "Search for information",
      "steps": [
        {
          "user_input_type": "input_text",
          "data": "*",
          "intent": "Enter search query"
        },
        {
          "user_input_type": "click",
          "x": 657,
          "y": 325,
          "intent": "Click on 'Feeling Lucky' button"
        },
        {
          "user_input_type": "click",
          "x": 517,
          "y": 325,
          "intent": "Click on 'Google Search' button"
        }
      ]
    },
    {
      "user_flow_id": "Sign in to Google",
      "steps": [
        {
          "user_input_type": "click",
          "x": 348,
          "y": 77,
          "intent": "Click on 'Sign in to Google' button"
        }
      ]
    },
    {
      "user_flow_id": "Access Gmail",
      "steps": [
        {
          "user_input_type": "click",
          "x": 1004,
          "y": 25,
          "intent": "Click on 'Gmail images' button"
        }
      ]
    },
    {
      "user_flow_id": "Sign in",
      "steps": [
        {
          "user_input_type": "click",
          "x": 1167,
          "y": 13,
          "intent": "Click on 'Sign in' button"
        }
      ]
    }
  ]
}

interface_flows = infer_interface_flows(page)

# Calculate offsets to reposition from the center to the top-left corner
window_width = driver.execute_script('return window.innerWidth')
window_height = driver.execute_script('return window.innerHeight')

def do_step(driver, step):
  if step["user_input_type"] == "input_text":
    active_element = driver.switch_to.active_element
    active_element.send_keys(step["data"])
  elif step["user_input_type"] == "click":
    actions = ActionChains(driver)
    # Calculate offsets to reposition from the center to the top-left corner
    half_width = window_width / 2
    half_height = window_height / 2
    
    # Start from the center and offset to the top-left corner
    actions.move_to_element_with_offset(driver.find_element(By.TAG_NAME, 'body'), -half_width, -half_height)
    
    # Now move to the specified coordinates from the top-left corner
    actions.move_by_offset(step["x"], step["y"]).click().perform()

for flow in interface_flows["user_flows"]:
    if flow["user_flow_id"] == "Access Gmail":
        for step in flow["steps"]:
            do_step(driver, step)
