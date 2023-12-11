from selenium import webdriver


class Extractor:
  """Interface to extract elements from a source"""

  def __init__(self):
    self.driver = webdriver.Chrome()

  def get_visible_elements_by_xml(self):
    """get top-level visible elements by crawling through xml source"""

  def get_visible_elements_by_screenshot(self):
    """get top-level visible elements by image processing"""
