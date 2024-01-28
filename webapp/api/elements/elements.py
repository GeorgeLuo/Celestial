import sys
from os.path import abspath, dirname, join

current_dir = dirname(abspath(__file__))
project_root = dirname(dirname(dirname(current_dir)))

engine_path = join(project_root, 'engine')

if engine_path not in sys.path:
  sys.path.insert(0, engine_path)

from extractor import parse_image_boundaries

def get_elements(image_data=None, xpath=None, userflow=None):
  return parse_image_boundaries(image_data)
