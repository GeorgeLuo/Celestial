from typing import List
from constellation import Constellation
from extractor import Extractor


def aggregate_visible_elements(visible_elements_by_xml,
                               visible_elements_by_screenshot):
  """
  Aggregates the visible elements by screenshot and XML.
  """
  visible_elements = []
  for xml_element in visible_elements_by_xml:
    xml_element_id = xml_element.get('id')
    xml_element_name = xml_element.get('name')
    xml_element_xpath = xml_element.get('xpath')
    xml_element_class = xml_element.get('class')
    xml_element_text = xml_element.get('text')
    # Assuming there is a method to get the screenshot representation
    xml_element_screenshot = xml_element.get_screenshot_representation()
    visible_elements.append({
      'id': xml_element_id,
      'name': xml_element_name,
      'xpath': xml_element_xpath,
      'class': xml_element_class,
      'text': xml_element_text,
      'screenshot': xml_element_screenshot
    })

def generate_constellation(width, height, url) -> Constellation:
  """navigate to url, wait for elements to stabilize, 
  generate a constellation representation of the webpage"""

  extractor = Extractor(url)
  visible_elements_by_xml = extractor.get_visible_elements_by_xml()
  visible_elements_by_screenshot = extractor.get_visible_elements_by_screenshot(
  )

  constellation_elements = aggregate_visible_elements(
      visible_elements_by_xml, visible_elements_by_screenshot)

  page = Constellation(width, height)
  page.add_elements(constellation_elements)

  return page
