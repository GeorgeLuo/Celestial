from flask import Flask, render_template, send_from_directory, request, redirect, flash, jsonify
import os

import sys
from api.elements.elements import get_elements
from api.intent.intent import get_intent
from api.userflow.userflow import get_userflow
from database import get_flow, write_flow

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from engine.capture_session import extract_capture_session, read_combined_data_from_capture_session, combine_data_sorted, unpack_capture_session

from session_context import store_session

app = Flask(__name__, static_folder='session-visualizer/build')
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['ALLOWED_EXTENSIONS'] = {'zip'}
app.secret_key = 'super_secret_key'

# Ensure the upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)


def allowed_file(filename):
  return '.' in filename and \
         filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']


@app.route('/fetchCaptureSession', methods=['GET'])
def fetch_capture_session():
  capture_session_id = request.args.get('captureSessionId', '')
  if capture_session_id == 'EmailDemo':
    flow_file_path = os.path.join(app.config['UPLOAD_FOLDER'],
                                 'demos/EmailDemo/EmailDemo.zip')

    # Use extract_capture_session to process the .zip file
    combined_data_sorted = extract_capture_session(flow_file_path)

    # Return the combined sorted data instead of just flow_data
    return jsonify({
        'timeline': combined_data_sorted,
        'client_session_id': 'EmailDemo'
    })
  else:
    # flow_file_path = os.path.join(app.config['UPLOAD_FOLDER'],
    #                              capture_session_id, 'flow.json')

    # combined_data_sorted = read_combined_data_from_capture_session(
    #     flow_file_path)
    
    combined_data_sorted = combine_data_sorted(get_flow(capture_session_id))

    return jsonify({
        'timeline': combined_data_sorted,
        'client_session_id': capture_session_id
    })


@app.route('/getScreenshot', methods=['GET'])
def get_screenshot():
  filename = request.args.get('filename')
  clientSessionId = request.args.get('clientSessionId')
  if (clientSessionId == 'EmailDemo'):
    return send_from_directory(
        os.getcwd(),
        os.path.join(app.config['UPLOAD_FOLDER'], 'demos/EmailDemo',
                     'screenshots', filename))
  return send_from_directory(
      os.getcwd(),
      os.path.join(app.config['UPLOAD_FOLDER'], str(clientSessionId),
                   'screenshots', filename))


@app.route('/upload', methods=['POST'])
def upload_file():
  if 'file' not in request.files:
    flash('No file part')
    return redirect(request.url)
  file = request.files['file']
  if file.filename == '':
    flash('No selected file')
    return redirect(request.url)
  if file and allowed_file(file.filename):

    # unpacks the file and stores it in the uploads folder
    client_session_id, zip_path = store_session(app.config['UPLOAD_FOLDER'],
                                                file)

    capture_flow = unpack_capture_session(zip_path)
    combined_data_sorted = combine_data_sorted(capture_flow)

    write_flow(client_session_id, capture_flow)

    # TODO: figure out how to store these files
    os.remove(zip_path)

    mimodex_url = 'http://localhost:4999/?captureSessionId=' + client_session_id

    return jsonify({
        'url': mimodex_url,
        'timeline': combined_data_sorted,
        'client_session_id': str(client_session_id)
    })
  else:
    flash('Invalid file type')
    return redirect(request.url)


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
  if path != "" and os.path.exists(app.static_folder + '/' + path):
    return send_from_directory(app.static_folder, path)
  else:
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/api/model/intent', methods=['GET', 'POST'])
def intent():
  image_data = request.files.get('image') if 'image' in request.files else None
  xpath = request.form.get('xpath')
  userflow = request.form.get('userflow')

  return jsonify(
      get_intent(image_data=image_data, xpath=xpath, userflow=userflow))


@app.route('/api/model/userflow', methods=['GET', 'POST'])
def userflow():
  image_data = request.files.get('image') if 'image' in request.files else None
  xpath = request.form.get('xpath')
  userflow = request.form.get('userflow')

  return jsonify(
      get_userflow(image_data=image_data, xpath=xpath, userflow=userflow))


@app.route('/api/model/elements', methods=['GET', 'POST'])
def elements():
  image_data = request.files.get('image') if 'image' in request.files else None
  xpath = request.form.get('xpath')
  userflow = request.form.get('userflow')
  return jsonify(
      get_elements(image_data=image_data, xpath=xpath, userflow=userflow))


if __name__ == '__main__':
  app.run(host='0.0.0.0', port=4999, debug=True)
