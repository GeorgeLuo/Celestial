import React, { useState, useEffect } from "react";
import FileUploader from "./FileUploader";
import ObjectList from "./ObjectList";

const SessionSelector = ({ onUpload, onObjectFocus, selectedIndex }) => {
  const [flowData, setFlowData] = useState(null);
  const [selectedBoxIndex, setSelectedBoxIndex] = useState(selectedIndex || 0);

  useEffect(() => {
    setSelectedBoxIndex(selectedIndex);
  }, [selectedIndex]);

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

  const fetchCaptureSession = (captureSessionId) => {
    fetch(`/fetchCaptureSession?captureSessionId=${encodeURIComponent(captureSessionId)}`)
      .then(response => response.json())
      .then(data => {
        setFlowData(data.timeline);
        onUpload(data.timeline, data.client_session_id);
      })
      .catch(error => {
        console.error('Error fetching the demo:', error);
      });
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
    <div style={{ position: "sticky", top: 0, textAlign: "center" }}>
      <FileUploader onFileSelect={processFile} onCaptureSessionSelection={fetchCaptureSession} />
      <div style={{ overflowY: "auto", height: "calc(100vh - 100px)" }}> {/* Adjust the height according to your needs */}
        {flowData && (
          <ObjectList
            flowData={flowData}
            selectedBoxIndex={selectedBoxIndex}
            onBoxClick={handleBoxClick}
          />
        )}
      </div>
    </div>
  );
};

export default SessionSelector;
