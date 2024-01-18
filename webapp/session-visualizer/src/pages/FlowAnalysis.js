import React, { useState } from "react";
import FileUploadAndDisplay from "../components/FileUpload";
import ImageSequenceDownloader from "../components/ImageSequenceDownloader";

const FlowAnalysis = () => {
  const [imageList, setImageList] = useState([]);

  // This function is a placeholder for whatever logic you have to set imageList
  const handleSetImageList = (newImageList) => {
    setImageList(newImageList);
  };

  // Assuming you have some way to update the image list once flowData is obtained
  // You need to connect to the logic that sets flowData when a file is uploaded

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <div style={{ flex: 1 }}>
        <FileUploadAndDisplay onUpload={handleSetImageList} />
      </div>
      <div style={{ flex: 1 }}>
        <ImageSequenceDownloader imageList={imageList} />
      </div>
    </div>
  );
};

export default FlowAnalysis;
