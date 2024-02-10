import React, { useState, useCallback } from "react";

import SessionSelector from "../components/ContentNavigator";
import ObjectViewer from "../components/ObjectViewer";

import Editor from "../components/Editor";

const FlowAnalysis = ({ initialClientSessionId }) => {
  const [clientSessionId, setClientSessionId] = useState(
    initialClientSessionId,
  );
  const [imageList, setImageList] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [isEditorOpen, setEditorOpen] = useState(false);
  const openEditor = () => {
    setEditorOpen(true);
  };
  const closeEditor = () => {
    setEditorOpen(false);
  };

  const startSession = useCallback((newImageList, clientSessionId) => {
    setClientSessionId(clientSessionId);
    setImageList(newImageList);
    setSelectedIndex(0); // Reset selectedIndex to 0 when new session starts
  }, []);

  const handleObjectFocus = useCallback((index) => {
    setSelectedIndex(index);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "row", height: "100vh" }}>
      <div style={{ width: "33.33%", textAlign: "center", overflowY: "auto" }}>
        <SessionSelector
          clientSessionId={clientSessionId} // Pass clientSessionId as a prop to SessionSelector
          onUpload={startSession}
          onObjectFocus={handleObjectFocus}
          selectedIndex={selectedIndex}
        />
      </div>
      <div style={{ width: "66.67%", textAlign: "center" }}>
        <ObjectViewer
          imageList={imageList}
          onObjectFocus={handleObjectFocus}
          selectedIndex={selectedIndex}
          clientSessionId={clientSessionId}
        />
        {imageList[selectedIndex] && (
          <div>
            <h3>Focused Object:</h3>
            <pre
              style={{
                textAlign: "left",
                display: "inline-block",
                textJustify: "auto",
              }}
            >
              {JSON.stringify(imageList[selectedIndex], null, 2)}
            </pre>
          </div>

        )}
      </div>
      <button
        onClick={openEditor}
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          zIndex: 1050, // Ensuring that this button is above other elements like the modal
        }}
      >
        Focus View
      </button>
      {isEditorOpen && (
        <Editor
          onClose={closeEditor}
          selectedIndex={selectedIndex}
          imageList={imageList}
          clientSessionId={clientSessionId}
        >
        </Editor>
      )}
    </div>
  );
};

export default FlowAnalysis;
