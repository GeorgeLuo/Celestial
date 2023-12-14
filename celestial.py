from extractor import extract_page
from inferrencer import infer_interface_flows
from flow_executor import do_flow
from selenium import webdriver



width = 1280
height = 720

options = webdriver.ChromeOptions()
options.headless = True
driver = webdriver.Chrome(options=options)
driver.set_window_size(width, height)

user_flow_id = "Access Gmail"

page = extract_page("https://google.com", driver=driver, render_dir="./renders", granularity=10)
interface_flows = infer_interface_flows(page)
do_flow(driver, interface_flows, user_flow_id)