from selenium import webdriver
from selenium.webdriver.common.by import By
from lxml import etree
import os
import pytesseract

import cv2
import numpy as np

from constellation import Constellation


def extract_page(url,
                 output_html="main.html",
                 render_dir="./capture",
                 width=1280,
                 height=720, granularity=20) -> Constellation:
  extractor = Extractor(width, height)
  extractor.navigate(url)
  xml_elements = extractor.get_visible_elements_by_xml()
  screenshot_elements = extractor.get_visible_elements_by_screenshot(
      assets_output_path=os.path.join(render_dir, "assets"), granularity=granularity)

  page = Constellation(width, height)
  for element in screenshot_elements:
    page.add_element(element['x'], element['y'], element['metadata'], element['image'], '')

  # Save the HTML to a file named 'output.html'
  page.save_to_html_file(os.path.join(render_dir, output_html))
  return page


def extract_text_from_image(image):
  # Use pytesseract to do OCR on the image
  return pytesseract.image_to_string(image)


def extract_contextual_metadata_from_boundary(image, boundary, granularity=20):
    """given full image, the bounds of an element in the image and granularity extract meaningful information"""

    x = boundary['x']
    y = boundary['y']
    w = boundary['w']
    h = boundary['h']
  
    # Adjust granularity rejection threshold as needed
    if w * h < granularity:
      return None

    # Extract the text block's image from the screenshot
    element_image = image[y:y + h, x:x + w]

    text = extract_text_from_image(element_image)
    return {'text': text}

def extract_contextual_metadata_from_image(image):
    """extract meaningful information from image"""

    text = extract_text_from_image(image)
    return {'text': text}


def extract_subimage_from_image(image, boundary):
    """return a subimage from within the image based on parameters defined in boundary"""

    x = boundary['x']
    y = boundary['y']
    w = boundary['w']
    h = boundary['h']

    return image[y:y + h, x:x + w]

def text_to_id(text):
  """Convert text to a string where contiguous white spaces are turned into an 
  underscore and non-alphanumeric characters are discarded"""

  return ''.join('_' if c.isspace() else c for c in text
                 if c.isalnum() or c.isspace()).replace(' ', '')


def write_image_to_file(atomic_element, assets_output_path, filename):
  """Save the image to file utility"""

  element_image_path = os.path.join(assets_output_path, filename)
  if not cv2.imwrite(element_image_path, atomic_element):
    print(f"Failed to save element image to {element_image_path}")


def find_atomic_element_boundaries(image, granularity=20):
  """get boundaries of elements within the image"""

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
  boundaries = []
  for contour in contours:
    x, y, w, h = cv2.boundingRect(contour)
    boundaries.append({'x': x, 'y': y, 'w': w, 'h': h})
  return boundaries

class Extractor:
  """Interface to extract elements from a source"""

  def __init__(self, width, height):
    options = webdriver.ChromeOptions()
    options.headless = True
    self.driver = webdriver.Chrome(options=options)
    self.driver.set_window_size(width, height)
    self.default_image_count = 0
    self.unique_filename_count = {}

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
  
  def generate_unique_filename(self, metadata):
    """generate a unique filename from metadata"""

    if 'text' in metadata and metadata['text'] != '':
      return f'textual_graphic_{text_to_id(metadata["text"])}.png'
    else:
      filename = f'graphic_{self.default_image_count}.png'
      self.default_image_count = self.default_image_count + 1
      return filename

  def get_visible_elements_by_screenshot(self,
                                         assets_output_path='./site/assets', granularity=20):
    """Get interactive elements that are visible by screenshot parsing strategy."""

    if not os.path.exists(assets_output_path):
      os.makedirs(assets_output_path)

    visible_elements = []

    screenshot = self.screenshot()

    element_boundaries = find_atomic_element_boundaries(screenshot, granularity)
    for boundary in element_boundaries:

      # subimage is too small for consideration
      if boundary['w'] * boundary['h'] < granularity:
        continue

      subimage = extract_subimage_from_image(screenshot, boundary)
      metadata = extract_contextual_metadata_from_image(subimage)

      boundary['metadata'] = metadata
      filename = self.generate_unique_filename(metadata)
      boundary['image'] = os.path.join(assets_output_path, filename)
      write_image_to_file(subimage, assets_output_path=assets_output_path, filename=filename)
      visible_elements.append(boundary)

    return visible_elements

  def close_driver(self):
    self.driver.quit()