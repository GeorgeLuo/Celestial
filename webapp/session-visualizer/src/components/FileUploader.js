import React from 'react';

const FileUploader = ({ onFileSelect }) => {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    onFileSelect(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    onFileSelect(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };
  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{
        border: "2px dashed #ccc",
        padding: "20px",
        margin: "20px",
        cursor: "pointer"
      }}
    >
      Drag and drop a session file here or click to upload
      <input
        type="file"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default FileUploader;
