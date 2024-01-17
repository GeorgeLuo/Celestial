import React, { useState } from "react";

const FileUploadAndDisplay = () => {
  const [flowData, setFlowData] = useState(null);

  // Replace the handleFileChange function with the following
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      fetch("/upload", {
        // Adjust the URL if needed to match your server endpoint
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          setFlowData(data);
        })
        .catch((error) => {
          console.error("Error uploading the file:", error);
        });
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      {flowData && (
        <div>
          <h3>Flow JSON:</h3>
          <pre>{JSON.stringify(flowData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default FileUploadAndDisplay;
