from selenium import webdriver
from selenium.webdriver.common.by import By
from lxml import etree
import os

import cv2
import numpy as np

from constellation import Constellation

def extract_page(url, output_html="main.html", render_dir="./capture", width=1280, height=720):
  extractor = Extractor(width, height)
  extractor.navigate(url)
  xml_elements = extractor.get_visible_elements_by_xml()
  screenshot_elements = extractor.get_visible_elements_by_screenshot(assets_output_path=os.path.join(render_dir, "assets"))

  # Example usage
  page = Constellation(width, height)
  for element in screenshot_elements:
    page.add_element(element['x'], element['y'], element['image'], '')

  # Save the HTML to a file named 'output.html'
  page.save_to_html_file(os.path.join(render_dir, output_html))



def find_atomic_elements(image, assets_path, granularity=20):
  # Convert the image to grayscale
  gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
  # Apply GaussianBlur to reduce noise and improve contour detection
  blurred = cv2.GaussianBlur(gray, (5, 5), 0)

  # Use adaptive thresholding to get a binary image
  binary = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                 cv2.THRESH_BINARY_INV, 11, 2)

  # Define a rectangular kernel for morphological operations
  kernel = cv2.getStructuringElement(cv2.MORPH_RECT,
                                     (granularity, granularity))

  # Close operation to join text characters into a single line
  closed = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)

  # Find contours
  contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL,
                                 cv2.CHAIN_APPROX_SIMPLE)

  atomic_elements = []
  # Make sure the assets directory exists
  if not os.path.exists(assets_path):
    os.makedirs(assets_path)

  # Iterate over contours
  for i, contour in enumerate(contours):
    # Create a bounding rect for each contour
    x, y, w, h = cv2.boundingRect(contour)

    # Adjust granularity rejection threshold as needed
    if w * h < granularity:
      continue

    # Extract the text block's image from the screenshot
    element_image = image[y:y + h, x:x + w]

    # Save the extracted element image
    element_image_path = os.path.join(assets_path, f'text_element_{i}.png')
    cv2.imwrite(element_image_path, element_image)

    # Represent atomic elements as dictionaries
    atomic_elements.append({
        'x': x,
        'y': y,
        'width': w,
        'height': h,
        'image': element_image_path
    })

  return atomic_elements


class Extractor:
  """Interface to extract elements from a source"""

  def __init__(self, width, height):
    options = webdriver.ChromeOptions()
    options.headless = True
    self.driver = webdriver.Chrome(options=options)
    self.driver.set_window_size(width, height)

  def navigate(self, url):
    """Navigate to a URL"""
    self.driver.get(url)

  def set_render_path(self, render_path):
    self.render_path = render_path

  def screenshot(self):
    """Take a screenshot of the current page""" ""
    screenshot_png = self.driver.get_screenshot_as_png()
    image = np.frombuffer(screenshot_png, np.uint8)
    image = cv2.imdecode(image, cv2.IMREAD_COLOR)
    return image

  def get_visible_elements_by_xml(self):
    """Get interactive elements that are visible by xml parsing strategy."""
    visible_elements = []
    interactive_elements_js = '''
      var allElements = document.querySelectorAll('a, button, input, select, textarea, [onclick], img, [role="button"], [role="link"]');
      return Array.prototype.filter.call(allElements, function(element){
          var style = window.getComputedStyle(element);
          return style.display !== 'none' && style.visibility !== 'hidden' && element.offsetWidth > 0 && element.offsetHeight > 0;
      }).map(function(element) {
          return element.outerHTML;
      });
      '''
    elements_html = self.driver.execute_script(interactive_elements_js)
    for html in elements_html:
      element_tree = etree.HTML(html)
      if element_tree is not None:
        element_dict = {
            'tag':
            element_tree.tag,
            'text':
            element_tree.text or etree.tostring(
                element_tree, method="text", encoding='unicode').strip(),
            'attributes':
            element_tree.attrib
        }
        visible_elements.append(element_dict)
    return visible_elements

  def get_visible_elements_by_screenshot(self, assets_output_path='./site/assets'):
    """Get interactive elements that are visible by screenshot parsing strategy."""
    screenshot = self.screenshot()
    visible_elements = find_atomic_elements(screenshot, assets_path=assets_output_path)

    return visible_elements

  def close_driver(self):
    self.driver.quit()

extract_page("https://www.google.com/", render_dir="./renders")