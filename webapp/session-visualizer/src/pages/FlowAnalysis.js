import React, { useState, useCallback } from "react";

import SessionSelector from "../components/SessionSelector";
import ObjectViewer from "../components/ObjectViewer";

const FlowAnalysis = () => {
  const [clientSessionId, setClientSessionId] = useState("");
  const [imageList, setImageList] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const startSession = useCallback((newImageList, clientSessionId) => {
    setClientSessionId(clientSessionId);
    setImageList(newImageList);
  }, []);

  const handleObjectFocus = useCallback((index) => {
    setSelectedIndex(index);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <div style={{ width: "33.33%", textAlign: "center" }}>
        <SessionSelector onUpload={startSession} onObjectFocus={handleObjectFocus} selectedIndex={selectedIndex} />
      </div>
      <div style={{ width: "66.67%", textAlign: "center" }}>
        <ObjectViewer imageList={imageList} onObjectFocus={handleObjectFocus} selectedIndex={selectedIndex} clientSessionId={clientSessionId}/>
        {imageList[selectedIndex] && (
          <div>
            <h3>Focused Object:</h3>
            <pre style={{ textAlign: "left", display: "inline-block", textJustify: "auto" }}>
              {JSON.stringify(imageList[selectedIndex], null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlowAnalysis;
