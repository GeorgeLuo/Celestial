import os


class Constellation:
  '''Captures interface state as mappings of elements in coordinate space'''

  def __init__(self, width, height):
    self.width = width
    self.height = height
    self.elements = []

  def add_element(self, x, y, hyperlink, content):
    element = {'x': x, 'y': y, 'hyperlink': hyperlink, 'content': content}
    self.elements.append(element)

  def add_elements(self, elements):
    self.elements.extend(elements)

  def generate_html(self):
    html_elements = []
    for element in self.elements:
      element_style = f"position: absolute; left: {element['x']}px; top: {element['y']}px;"
      # Corrected by changing the quotes around the keys
      html_element = f'<a href="{element["hyperlink"]}" style="{element_style}">{element["content"]}</a>'
      html_elements.append(html_element)

    frame_styles = f"width: {self.width}px; height: {self.height}px; position: relative;"
    frame_html = f'<div style="{frame_styles}">' + "".join(
        html_elements) + '</div>'

    return f'<!DOCTYPE html><html><head><title>Web Page</title></head><body>{frame_html}</body></html>'

  def save_to_file(self, file_path):
    # Ensure the file_path points to a file, not a directory
    if os.path.isdir(file_path):
      raise IsADirectoryError(f"The file path {file_path} is a directory.")

    # Create the directory if it doesn't exist
    directory = os.path.dirname(file_path)
    if not os.path.exists(directory):
      os.makedirs(directory)

    # Save the HTML content to the file
    html_content = self.generate_html()
    with open(file_path, 'w') as file:
      file.write(html_content)
