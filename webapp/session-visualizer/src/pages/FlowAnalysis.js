import React, { useState } from "react";
import FileUploadAndDisplay from "../components/FileUpload";
// import ImageSequenceDownloader from "../components/ImageSequenceDownloader";
import ObjectViewer from "../components/ObjectViewer";

const FlowAnalysis = () => {
  const [imageList, setImageList] = useState([]);
  const [focusedObject, setFocusedObject] = useState(null); // Variable to track the focused object

  const handleSetImageList = (newImageList) => {
    setImageList(newImageList);
    // Assuming the first object is the one in focus by default
    setFocusedObject(newImageList[0] || null);
  };

  const handleObjectClick = (object) => {
    // Update focusedObject when an object from FileUpload is clicked
    setFocusedObject(object);
  };

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <div style={{ width: "33.33%", textAlign: "center" }}>
        <FileUploadAndDisplay onUpload={handleSetImageList} onObjectClick={handleObjectClick} />
      </div>
      <div style={{ width: "66.67%", textAlign: "center" }}>
        <ObjectViewer imageList={imageList} />
        {/* Below is a placeholder to show the focused object. Implement as necessary. */}
        {focusedObject && (
          <div>
            <h3>Focused Object:</h3>
            {/* Inline styling for the <pre> tag to maintain JSON formatting */}
            <pre style={{ textAlign: "left", display: "inline-block", textJustify: "auto" }}>
              {JSON.stringify(focusedObject, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlowAnalysis;
