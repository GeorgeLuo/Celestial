import React, { useState } from 'react';

function FileUpload() {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      alert('Please select a file to upload');
      return;
    }
    
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        alert('File successfully uploaded');
      } else {
        alert('File upload failed');
      }
    } catch (error) {
      alert('Error while uploading file');
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <input type="file" accept='.zip' onChange={handleFileChange} />
      <button type="submit">Upload</button>
    </form>
  );
}

export default FileUpload;
