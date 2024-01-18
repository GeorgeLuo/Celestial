import React, { useState, useEffect } from "react";
const FileUploadAndDisplay = ({ onUpload, onObjectFocus, selectedIndex, onSelectedIndexChange }) => {
  const [flowData, setFlowData] = useState(null);
  const [selectedBoxIndex, setSelectedBoxIndex] = useState(selectedIndex || 0);
  useEffect(() => {
    setSelectedBoxIndex(selectedIndex);
  }, [selectedIndex]);
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      fetch("/upload", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          setFlowData(data);
          onUpload(data); // Triggered after successful upload
        })
        .catch((error) => {
          console.error("Error uploading the file:", error);
        });
    }
  };

  const handleBoxClick = (index) => {
    setSelectedBoxIndex(index);
    onObjectFocus(index); // Changed from passing boxData to passing index
  };

 // Ensure highlighted textbox stays in sync with the selectedIndex
  // const isSelected = (index) => index === selectedIndex;

  return (
    <div style={{ textAlign: "center" }}>
      <input type="file" onChange={handleFileChange} />
      <div>
        {flowData &&
          flowData.map((data, index) => (
            <pre
              key={index}
              onClick={() => handleBoxClick(index)}
              style={{
                padding: "10px",
                margin: "10px",
                border: selectedBoxIndex === index ? "2px solid blue" : "1px solid #ddd",
                display: "inline-block",
                cursor: "pointer",
                backgroundColor: selectedBoxIndex === index ? "#e6e6e6" : "",
                textAlign: "left"
              }}
            >
              {JSON.stringify(data, null, 2)}
            </pre>
          ))}
      </div>
    </div>
  );
};
export default FileUploadAndDisplay;
