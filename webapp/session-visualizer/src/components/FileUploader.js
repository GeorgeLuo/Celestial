import React, { useState } from 'react';

const FileUploader = ({ onFileSelect, onCaptureSessionSelection }) => {
    const [captureSessionId, setCaptureSessionId] = useState('SearchDemo');

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        onFileSelect(file);
    };

    const handleCaptureSessionIdChange = (event) => {
        setCaptureSessionId(event.target.value);
    };

    const handleLoadCaptureSessionClick = () => {
        onCaptureSessionSelection(captureSessionId);
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
        <div>
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
            <div>
                <input
                    type="text"
                    value={captureSessionId}
                    onChange={handleCaptureSessionIdChange}
                />
                <button onClick={handleLoadCaptureSessionClick}>Load By Capture Id</button>
            </div>
        </div>
    );
};

export default FileUploader;
