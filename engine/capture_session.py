import json
import os
import zipfile
from enum import Enum

def unpack_capture_session(capture_session_zip):
    '''Unpack the capture session zip and return an array of screenshot metadata objects'''
    with zipfile.ZipFile(capture_session_zip, 'r') as zip_ref:
        zip_ref.extractall("session_data")
        for file in zip_ref.namelist():
            if file.endswith('.json'):
                with open(os.path.join("session_data", file), 'r') as json_file:
                    flow_data = json.load(json_file)
                    return flow_data

def extract_capture_session(capture_session_zip):
    '''given a directory containing a json file and screenshots generated from a capture session
    convert to constellation format'''

    # unpack capture session
    session_data = unpack_capture_session(capture_session_zip)

    # for each screenshot,
    # if the screenshot is a click event, find the bounding rectangle of the element clicked

    combined_data = []

    for event in session_data['events']:
        event_with_type = event.copy()
        event_with_type['datatype'] = 'event'
        combined_data.append(event_with_type)
    # for each screenshot, add to combined_data with "datatype"
    for screenshot in session_data['screenshots']:
        screenshot_with_type = screenshot.copy()
        screenshot_with_type['datatype'] = 'screenshot'
        combined_data.append(screenshot_with_type)
    # now sort combined_data by time
    combined_data_sorted = sorted(combined_data, key=lambda x: x['time'])

    return(combined_data_sorted)


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

    def current_data(self):
        '''return the current object at index matching iterator_type'''
        if self.data[self.index]['datatype'] == self.iterator_type.value:
            return self.data[self.index]
        return None

    def context(self):
        '''return a list of data objects from the previous item of the same iterator type through 
        to the next item of the same iterator type'''

        previous_index = self._find_previous_index()
        next_index = self._find_next_index()

        context_data = []
        if previous_index is not None:
            context_data.append(self.data[previous_index])

        current_data = self.current_data()
        if current_data is not None:
            context_data.append(current_data)

        if next_index is not None:
            context_data.append(self.data[next_index])

        return context_data


combined_data_sorted = extract_capture_session('testflow.zip')

iterator = SessionCaptureIterator(combined_data_sorted, SessionCaptureIterator.IteratorType.EVENT)

print(iterator.current_data())
print(iterator.next())
print(iterator.next())