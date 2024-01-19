from werkzeug.utils import secure_filename
import uuid
import os

def store_session(upload_folder, file):
    filename = secure_filename(file.filename)
    client_session_id = uuid.uuid1()

    os.makedirs(os.path.join(upload_folder, str(client_session_id)), exist_ok=True)
    
    zip_path = build_path(upload_folder, filename, client_session_id)
    file.save(zip_path)
    return (client_session_id, zip_path)

def build_path(upload_folder, filename, client_session_id):
    zip_path = os.path.join(upload_folder, str(client_session_id), filename)
    return zip_path

