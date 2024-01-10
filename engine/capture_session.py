def unpack_capture_session(capture_session_zip):
    return None

def extract_capture_session(capture_session_zip):
    '''given a directory containing a json file and screenshots generated from a capture session
    convert to constellation format'''

    # unpack capture session

    session_data = unpack_capture_session(capture_session_zip)

    # for each screenshot,
    # if screenshot is a click event, find bounding rectangle of element clicked

    pass
