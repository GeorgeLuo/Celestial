from flask import Flask, send_from_directory, request, redirect, url_for, flash
from werkzeug.utils import secure_filename
import os
import zipfile
import json

app = Flask(__name__, static_folder='session-console/build')
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['ALLOWED_EXTENSIONS'] = {'zip'}
app.secret_key = 'super_secret_key'  # Change this to a random secret key

# Ensure the upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

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
        filename = secure_filename(file.filename)
        zip_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(zip_path)

        # Extract the zip file
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(app.config['UPLOAD_FOLDER'])

            # Assuming there's only one JSON file in the zip
            for file in zip_ref.namelist():
                if file.endswith('.json'):
                    with open(os.path.join(app.config['UPLOAD_FOLDER'], file), 'r') as json_file:
                        # Here, you can process the JSON file as you need
                        capture_session = json.load(json_file)
                        # For this example, you might want to print it or process it further
                        print(capture_session)

        # Here you might want to redirect or send back some success response
        return redirect(url_for('serve', path=''))
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