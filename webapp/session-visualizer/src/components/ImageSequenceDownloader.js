import React, { useState } from "react";

const ImageSequenceDownloader = ({ imageList }) => {
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
    const newIndex = (currentImageIndex + 1) % imageList.length;
    downloadImage(imageList[newIndex]);
    setCurrentImageIndex(newIndex);
  };

  const handlePreviousImage = () => {
    const newIndex =
      (currentImageIndex - 1 + imageList.length) % imageList.length;
    downloadImage(imageList[newIndex]);
    setCurrentImageIndex(newIndex);
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

export default ImageSequenceDownloader;
