import React, { useState } from "react";

const FileUploadAndDisplay = ({ onUpload }) => {
  const [flowData, setFlowData] = useState(null);

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

  const handleBoxClick = (boxData) => {
    console.log("Box clicked:", boxData);
    // Implement what should happen when a box is clicked
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <div>
        {flowData &&
          flowData.map((data, index) => (
            <div
              key={index}
              onClick={() => handleBoxClick(data)}
              style={{
                padding: "10px",
                margin: "10px",
                border: "1px solid #ddd",
                display: "inline-block",
                cursor: "pointer",
              }}
            >
              {JSON.stringify(data)}
            </div>
          ))}
      </div>
    </div>
  );
};

export default FileUploadAndDisplay;
