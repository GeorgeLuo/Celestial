import React, { useState } from "react";

const FileUploadAndDisplay = ({ onUpload, onObjectClick }) => {
  const [flowData, setFlowData] = useState(null);
  const [selectedBoxIndex, setSelectedBoxIndex] = useState(null);

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
          onUpload(data); // Assuming there is a prop method to handle the upload
        })
        .catch((error) => {
          console.error("Error uploading the file:", error);
        });
    }
  };

  const handleBoxClick = (boxData, index) => {
    console.log("Box clicked:", boxData);
    setSelectedBoxIndex(index);
    onObjectClick(boxData);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <input type="file" onChange={handleFileChange} />
      <div>
        {flowData &&
          flowData.map((data, index) => (
            <pre
              key={index}
              onClick={() => handleBoxClick(data, index)}
              style={{
                padding: "10px",
                margin: "10px",
                border: selectedBoxIndex === index ? "2px solid blue" : "1px solid #ddd",
                display: "inline-block",
                cursor: "pointer",
                backgroundColor: selectedBoxIndex === index ? "#e6e6e6" : "",
                textAlign: "left" // Ensure text is left-aligned inside the <pre> element
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