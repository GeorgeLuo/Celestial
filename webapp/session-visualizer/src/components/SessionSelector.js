import React, { useState, useEffect } from "react";
const SessionSelector = ({ onUpload, onObjectFocus, selectedIndex }) => {

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
          setFlowData(data.timeline);
          onUpload(data.timeline, data.client_session_id); // Triggered after successful upload
        })
        .catch((error) => {
          console.error("Error uploading the file:", error);
        });
    }
  };

  useEffect(() => {
    // Handler to detect key press and navigate through the session
    const handleKeyDown = (event) => {
      if (event.key === "ArrowDown") {
        setSelectedBoxIndex((prevIndex) => {
          const nextIndex = prevIndex + 1 >= flowData.length ? prevIndex : prevIndex + 1;
          onObjectFocus(nextIndex); // Move focus to the next session box
          return nextIndex;
        });
      } else if (event.key === "ArrowUp") {
        setSelectedBoxIndex((prevIndex) => {
          const nextIndex = prevIndex - 1 < 0 ? prevIndex : prevIndex - 1;
          onObjectFocus(nextIndex); // Move focus to the previous session box
          return nextIndex;
        });
      }
    };
    // Add keydown event listener
    document.addEventListener("keydown", handleKeyDown);
    // Remove event listener on cleanup
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [flowData, onObjectFocus]);

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
export default SessionSelector;
