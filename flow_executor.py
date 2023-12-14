from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.by import By

def do_flow(driver, interface_flows, user_flow_id):
    flow_executor = FlowExecutor(driver, interface_flows)
    flow_executor.do_flow(user_flow_id)


class FlowExecutor:
    def __init__(self, driver, interface_flows):
        self.driver = driver
        self.interface_flows = interface_flows
        # Calculate offsets to reposition from the center to the top-left corner
        self.window_width = driver.execute_script('return window.innerWidth')
        self.window_height = driver.execute_script('return window.innerHeight')

    def do_step(self, driver, step):
        if step["user_input_type"] == "input_text":
            active_element = driver.switch_to.active_element
            active_element.send_keys(step["data"])
        elif step["user_input_type"] == "click":
            actions = ActionChains(driver)
            # Calculate offsets to reposition from the center to the top-left corner
            half_width = self.window_width / 2
            half_height = self.window_height / 2
            
            # Start from the center and offset to the top-left corner
            actions.move_to_element_with_offset(driver.find_element(By.TAG_NAME, 'body'), -half_width, -half_height)
            
            # Now move to the specified coordinates from the top-left corner
            actions.move_by_offset(step["x"], step["y"]).click().perform()

    def do_flow(self, user_flow_id):
        for flow in self.interface_flows["user_flows"]:
            if flow["user_flow_id"] == user_flow_id:
                for step in flow["steps"]:
                    self.do_step(self.driver, step)

