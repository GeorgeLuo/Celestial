import React, { useEffect, useState } from "react";

const ObjectViewer = ({ imageList, onObjectFocus, selectedIndex }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(selectedIndex || 0);

  useEffect(() => {
    setCurrentImageIndex(selectedIndex);
  }, [selectedIndex]);

  const downloadImage = (imageUrl) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNextImage = () => {
    if (currentImageIndex < imageList.length - 1) {
      const newImageIndex = currentImageIndex + 1;
      setCurrentImageIndex(newImageIndex);
      onObjectFocus(newImageIndex);
    }
  };

  const handlePreviousImage = () => {
    if (currentImageIndex > 0) {
      const newImageIndex = currentImageIndex - 1;
      setCurrentImageIndex(newImageIndex);
      onObjectFocus(newImageIndex);
    }
  };

  return (
    <div>
      {imageList[currentImageIndex] && (
        <>
          <img
            src={imageList[currentImageIndex]}
            alt={`image-${currentImageIndex}`}
          />
          <div>
            <button onClick={handlePreviousImage} disabled={currentImageIndex === 0}>{"<"}</button>
            <button onClick={handleNextImage} disabled={currentImageIndex === imageList.length - 1}>{">"}</button>
            <button onClick={() => downloadImage(imageList[currentImageIndex])}>
              Download Image
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ObjectViewer;