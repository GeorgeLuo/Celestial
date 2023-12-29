from selenium import webdriver
from lxml import etree
import os
import pytesseract

import cv2
import numpy as np

from constellation import Constellation


def extract_page(url,
                 driver=None,
                 output_html="main.html",
                 render_dir="./capture",
                 width=1280,
                 height=720,
                 granularity=20) -> Constellation:
  """given a webdriver, parse a screenshot from a browser of provided width and height 
  and output a recreation of the website as a Constellation render"""

  extractor = Extractor(width, height, driver=driver)
  extractor.navigate(url)
  xml_elements = extractor.get_visible_elements_by_xml()
  screenshot_elements = extractor.get_visible_elements_by_screenshot(
      assets_output_path=os.path.join(render_dir, "assets"),
      granularity=granularity)

  page = Constellation(width, height)
  for element in screenshot_elements:
    page.add_element(element['x'], element['y'], element['metadata'],
                     element['image'], '')

  # Save the HTML to a file named 'output.html'
  page.save_to_html_file(os.path.join(render_dir, output_html))
  return page


def extract_text_from_image(image):
  # Use pytesseract to do OCR on the image
  return pytesseract.image_to_string(image)


def extract_contextual_metadata_from_image(image):
  """extract meaningful information from image"""

  text = extract_text_from_image(image)
  return {'text': text}


def extract_subimage_from_image(image, boundary, buffer_pixels=3):
  """return a subimage from within the image based on parameters defined in boundary"""

  x = boundary['x']
  y = boundary['y']
  w = boundary['w']
  h = boundary['h']

  # Add an extra pixel to the width and height
  # TODO: tune these values
  return image[y - buffer_pixels:y + h + buffer_pixels,
               x - buffer_pixels:x + w + buffer_pixels]


def standard_deviation_of_image(image):
  """Calculate the standard deviation of the grayscale image."""
  try:
    # Ensure image is in the expected format, e.g., not None or empty
    if image is None or image.size == 0:
      return None

    # Convert the image to grayscale
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Calculate the standard deviation
    sigma = np.std(gray_image)
    return sigma
  except Exception as e:
    # If there's any error, print it and return None
    print(f"Error in standard_deviation_of_image: {e}")
    return None


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
    # Adjust granularity rejection threshold as needed
    if w * h < granularity:
      continue
    boundaries.append({'x': x, 'y': y, 'w': w, 'h': h})
  return boundaries


def print_dimensions(image):
  print(f'image dimensions: {image.shape[1]}x{image.shape[0]}')


def generate_unique_filename(metadata, unique_image_seed=[0]):
  """generate a unique filename from metadata"""

  if 'text' in metadata and metadata['text'] != '':
    return f'textual_graphic_{text_to_id(metadata["text"])}.png'
  else:
    filename = f'graphic_{unique_image_seed[0]}.png'
    unique_image_seed[0] += 1
    return filename


def parse_image_boundaries(assets_output_path,
                           granularity,
                           image,
                           unique_image_seed=[0],
                           std_dev_threshold=3,
                           buffer_pixels=3):
  element_boundaries = find_atomic_element_boundaries(image, granularity)

  visible_elements = []

  for boundary in element_boundaries:
    # subimage is too small for consideration
    if boundary['w'] * boundary['h'] < granularity:
      continue

    subimage = extract_subimage_from_image(image, boundary, buffer_pixels)

    # TODO : tune this value

    std_dev = standard_deviation_of_image(subimage)
    if std_dev is not None and standard_deviation_of_image(
        subimage) < std_dev_threshold:
      continue

    metadata = extract_contextual_metadata_from_image(subimage)

    boundary['metadata'] = metadata
    filename = generate_unique_filename(metadata, unique_image_seed)

    boundary['image'] = os.path.join(assets_output_path, filename)
    write_image_to_file(subimage,
                        assets_output_path=assets_output_path,
                        filename=filename)
    visible_elements.append(boundary)

  return visible_elements


class Extractor:
  """Interface to extract elements from a source"""

  def __init__(self, width, height, driver=None):

    self.width = width
    self.height = height

    if driver is not None:
      self.driver = driver
    else:
      options = webdriver.ChromeOptions()
      options.headless = True
      self.driver = webdriver.Chrome(options=options)
      self.driver.set_window_size(width, height)

    self.default_image_count = [0]

  def navigate(self, url):
    """Navigate to a URL"""
    self.driver.get(url)

    # Get the window size and DPR after navigation
    self.css_width = self.driver.execute_script("return window.innerWidth;")
    self.css_height = self.driver.execute_script("return window.innerHeight;")
    dpr = self.driver.execute_script("return window.devicePixelRatio;")
    self.actual_width = self.css_width * dpr
    self.actual_height = self.css_height * dpr

    print(f"Window size set to: {self.driver.get_window_size()}")
    print(f"CSS Window size: {self.css_width}x{self.css_height}, DPR: {dpr}")
    print(
        f"Actual screenshot size might be: {self.actual_width}x{self.actual_height}"
    )

  def set_render_path(self, render_path):
    self.render_path = render_path

  def screenshot(self):
    """Take a screenshot of the current page""" ""
    screenshot_png = self.driver.get_screenshot_as_png()
    image = np.frombuffer(screenshot_png, np.uint8)
    image = cv2.imdecode(image, cv2.IMREAD_COLOR)

    return image

  def screenshot_and_rescale(self, write_file=None):
    """Take a screenshot of the current page and then rescale it to the desired dimensions."""
    # Take the raw screenshot
    image = self.screenshot()

    # Calculate the new size, intended to be the actual dimensions of the screenshot
    new_size = (self.css_width, self.css_height
                )  # This now does not divide by the dpr
    print("Resizing screenshot to match css dimensions", new_size)

    # Resize the image to the new size
    resized_image = cv2.resize(image, new_size, interpolation=cv2.INTER_AREA)
    # Write the resized image to a file

    if write_file is not None:
      cv2.imwrite(write_file, resized_image)

    return resized_image

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

  def get_visible_elements_by_screenshot(self,
                                         assets_output_path='./site/assets',
                                         granularity=20,
                                         screenshot_file=None):
    """Get interactive elements that are visible by screenshot parsing strategy."""

    if not os.path.exists(assets_output_path):
      os.makedirs(assets_output_path)

    if screenshot_file is None:
      screenshot_file = self.screenshot_and_rescale()

    return parse_image_boundaries(assets_output_path, granularity,
                                  screenshot_file)

  def close_driver(self):
    self.driver.quit()