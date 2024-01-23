import React, { useRef, useState } from 'react';

const FileUploader = ({ onFileSelect, onCaptureSessionSelection }) => {
    const [captureSessionId, setCaptureSessionId] = useState('SearchDemo');
    const fileInputRef = useRef(null); // Step 1: Create a ref for the file input

    const handleFileInputChange = (event) => {
        const files = event.target.files; // This will be a FileList of all selected files
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
        const files = event.dataTransfer.files; // This may contain one or more dropped files
        Array.from(files).forEach(file => onFileSelect(file));
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    // Step 2: Trigger a click event on the hidden file input when the drag and drop area is clicked
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
                onClick={handleUploaderClick} // Step 3: Make the drag and drop area clickable
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
                style={{ display: "none" }} // Step 4: Hide the file input element
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
