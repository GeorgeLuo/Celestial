from flask import Flask, render_template, request, redirect, url_for
import json

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('upload.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    # Check if a file is uploaded
    if 'sessionFile' in request.files:
        file = request.files['sessionFile']
        if file.filename != '':
            # If the browser allows, secure_filename could be used to sanitize the filename
            session_data = json.load(file)
            # Further processing of session_data
            # ...
            
            # For now let's just redirect or refresh the page
            return redirect(url_for('index'))
    
    # If no file was uploaded or an error occurred, reload the upload page
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)
