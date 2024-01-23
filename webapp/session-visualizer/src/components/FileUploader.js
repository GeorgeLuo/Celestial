import React, { useRef, useState } from 'react';

const FileUploader = ({ onFileSelect, onCaptureSessionSelection }) => {
    const [captureSessionId, setCaptureSessionId] = useState('EmailDemo');
    const fileInputRef = useRef(null);

    const handleFileInputChange = (event) => {
        const files = event.target.files;
        Array.from(files).forEach(file => onFileSelect(file));
    };

    const handleCaptureSessionIdChange = (event) => {
        setCaptureSessionId(event.target.value);
    };

    const handleLoadCaptureSessionClick = () => {
        onCaptureSessionSelection(captureSessionId);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const files = event.dataTransfer.files;
        Array.from(files).forEach(file => onFileSelect(file));
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const handleUploaderClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div>
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={handleUploaderClick}
                style={{
                    border: "2px dashed #ccc",
                    padding: "20px",
                    margin: "20px",
                    cursor: "pointer"
                }}
            >
                Drag and drop a file here or click to upload
            </div>
            <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileInputChange}
                style={{ display: "none" }}
            />
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
