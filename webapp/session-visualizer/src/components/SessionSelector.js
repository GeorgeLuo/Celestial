import React, { useState, useEffect, useRef } from "react";

const SessionSelector = ({ onUpload, onObjectFocus, selectedIndex }) => {
  const [flowData, setFlowData] = useState(null);
  const [selectedBoxIndex, setSelectedBoxIndex] = useState(selectedIndex || 0);
  const eventRefs = useRef([]);

  useEffect(() => {
    setSelectedBoxIndex(selectedIndex);
  }, [selectedIndex]);
  useEffect(() => {
    if (eventRefs.current[selectedBoxIndex]) {
      eventRefs.current[selectedBoxIndex].scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  }, [selectedBoxIndex]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    processFile(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    processFile(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const processFile = (file) => {
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
          onUpload(data.timeline, data.client_session_id);
        })
        .catch((error) => {
          console.error("Error uploading the file:", error);
        });
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowDown") {
        setSelectedBoxIndex((prevIndex) => {
          const nextIndex = prevIndex + 1 >= flowData.length ? prevIndex : prevIndex + 1;
          onObjectFocus(nextIndex);
          return nextIndex;
        });
      } else if (event.key === "ArrowUp") {
        setSelectedBoxIndex((prevIndex) => {
          const nextIndex = prevIndex - 1 < 0 ? prevIndex : prevIndex - 1;
          onObjectFocus(nextIndex);
          return nextIndex;
        });
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [flowData, onObjectFocus]);

  const handleBoxClick = (index) => {
    setSelectedBoxIndex(index);
    onObjectFocus(index);
  };

  return (
    <div style={{ textAlign: "center" }}>
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
        {flowData &&
          flowData.map((data, index) => (
            <pre
              key={index}
              ref={el => eventRefs.current[index] = el}
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