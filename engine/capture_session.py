import json
import os
import zipfile
from enum import Enum


def unpack_capture_session(capture_session_zip):
  '''Unpack the capture session zip and return an array of screenshot metadata objects'''
  with zipfile.ZipFile(capture_session_zip, 'r') as zip_ref:
    extract_dir = os.path.dirname(capture_session_zip)
    print(extract_dir)
    zip_ref.extractall(extract_dir)
    for file in zip_ref.namelist():
      if file.endswith('.json'):
        with open(os.path.join(extract_dir, file), 'r') as json_file:
          flow_data = json.load(json_file)
          return flow_data


def extract_capture_session(capture_session_zip):
  '''given a directory containing a json file and screenshots generated from a capture session
    convert to constellation format'''

  # unpack capture session
  session_data = unpack_capture_session(capture_session_zip)

  return combine_data_sorted(session_data)


def combine_data_sorted(flow_data):
  combined_data = []

  for event in flow_data['events']:
    event_with_type = event.copy()
    event_with_type['datatype'] = 'event'
    combined_data.append(event_with_type)
  # for each screenshot, add to combined_data with "datatype"
  for screenshot in flow_data['screenshots']:
    screenshot_with_type = screenshot.copy()
    screenshot_with_type['datatype'] = 'screenshot'
    combined_data.append(screenshot_with_type)
  # now sort combined_data by time
  combined_data_sorted = sorted(combined_data, key=lambda x: x['time'])

  return (combined_data_sorted)


def read_combined_data_from_capture_session(capture_session_json):
  with open(capture_session_json, 'r') as file:
    data = json.load(file)
  return combine_data_sorted(data)


class SessionCaptureIterator:
  '''iterator to step through session capture'''

  class IteratorType(Enum):
    SCREENSHOT = 'screenshot'
    EVENT = 'event'

  def __init__(self, capture_session, iterator_type=IteratorType.SCREENSHOT):
    self.data = capture_session
    self.index = 0
    self.iterator_type = iterator_type
    self._set_index_to_first_of_type()

  def _set_index_to_first_of_type(self):
    for i, item in enumerate(self.data):
      if item['datatype'] == self.iterator_type.value:
        self.index = i
        break

  def _find_next_index(self):
    for i in range(self.index + 1, len(self.data)):
      if self.data[i]['datatype'] == self.iterator_type.value:
        return i
    return None

  def _find_previous_index(self):
    for i in range(self.index - 1, -1, -1):
      if self.data[i]['datatype'] == self.iterator_type.value:
        return i
    return None

  def next(self):
    '''step forward and return item of the defined iterator_type'''
    next_index = self._find_next_index()
    if next_index is not None:
      self.index = next_index
      return self.data[next_index]
    return None

  def back(self):
    '''step backwards and return item of the defined iterator_type'''
    previous_index = self._find_previous_index()
    if previous_index is not None:
      self.index = previous_index
      return self.data[previous_index]
    return None

  def peek_left(self):
    previous_index = self._find_previous_index()
    if previous_index is not None:
      return self.data[previous_index]
    return None

  def peek_right(self):
    next_index = self._find_next_index()
    if next_index is not None:
      return self.data[next_index]
    return None

  def current_data(self):
    '''return the current object at index matching iterator_type'''
    if self.data[self.index]['datatype'] == self.iterator_type.value:
      return self.data[self.index]
    return None

  def context(self, include_all_types=False):
    '''return a list of data objects from the previous item of the same iterator type through 
            to the next item of the same iterator type. If include_all_types is True, include all data objects 
            in range, regardless of type.'''
    previous_index = self._find_previous_index()
    next_index = self._find_next_index()

    context_data = []
    # Define the start of the context, which should be the first object or after the previous object of matching type
    start_index = 0 if previous_index is None else previous_index + 1
    # Define the end of the context, which should include the next object of matching type if possible
    end_index = len(self.data) if next_index is None else next_index + 1
    # Get the objects in the defined range
    for i in range(start_index, end_index):
      if include_all_types or self.data[i][
          'datatype'] == self.iterator_type.value:
        context_data.append(self.data[i])
    return context_data


# combined_data_sorted = extract_capture_session('testflow.zip')

# iterator = SessionCaptureIterator(combined_data_sorted, SessionCaptureIterator.IteratorType.EVENT)

# print(iterator.current_data())
# print(iterator.context(False))
