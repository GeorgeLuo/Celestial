from flask import Flask, send_file, send_from_directory, request, redirect, url_for, flash, jsonify
from werkzeug.utils import secure_filename
import os
import zipfile
import json

import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from engine.capture_session import extract_capture_session
from session_context import store_session

app = Flask(__name__, static_folder='session-visualizer/build')
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['ALLOWED_EXTENSIONS'] = {'zip'}
app.secret_key = 'super_secret_key'  # Change this to a random secret key

# Ensure the upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)


def allowed_file(filename):
  return '.' in filename and \
         filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/getScreenshot', methods=['GET'])
def get_screenshot():
  filename = request.args.get('filename')
  clientSessionId = request.args.get('clientSessionId')
  return send_from_directory(os.getcwd(), os.path.join(app.config['UPLOAD_FOLDER'], str(clientSessionId), 'screenshots', filename))


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

    client_session_id, zip_path = store_session(app.config['UPLOAD_FOLDER'], file)

    # Use extract_capture_session to process the .zip file
    combined_data_sorted = extract_capture_session(zip_path)

    # Clean up uploaded zip file

    # TODO: figure out how to store these files
    os.remove(zip_path)

    # Return the combined sorted data instead of just flow_data
    return jsonify({'timeline': combined_data_sorted, 'client_session_id': str(client_session_id)})
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


if __name__ == '__main__':
  app.run(host='0.0.0.0', port=4999, debug=True)
