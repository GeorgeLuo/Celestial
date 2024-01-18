import React, { useState } from "react";

const ObjectViewer = ({ imageList, onPreviousNext, selectedIndex }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const downloadImage = (imageUrl) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNextImage = () => {
    onPreviousNext(true); // Pass true for the next image
  };
  const handlePreviousImage = () => {
    onPreviousNext(false); // Pass false for the previous image
  };

  return (
    <div>
      <img
        src={imageList[currentImageIndex]}
        alt={`image-${currentImageIndex}`}
      />
      <button onClick={handlePreviousImage}>{"<"}</button>
      <button onClick={handleNextImage}>{">"}</button>
    </div>
  );
};

export default ObjectViewer;
