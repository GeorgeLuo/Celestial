import React, { useEffect, useState } from "react";

const ObjectViewer = ({ imageList, onObjectFocus, selectedIndex, clientSessionId }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageSrc, setImageSrc] = useState("");
  const [filterMode, setFilterMode] = useState('screenshot');

  useEffect(() => {
    const firstScreenshotIndex = imageList.findIndex(object => object.datatype === 'screenshot');
    if (firstScreenshotIndex !== -1) setCurrentImageIndex(firstScreenshotIndex);
  }, [imageList]);

  useEffect(() => {
    const selectedObject = imageList[selectedIndex];
    if (selectedObject) {
      if (selectedObject.datatype === 'screenshot' || filterMode === 'hybrid') {
        fetchAndDownloadScreenshot(selectedObject.filename);
      } else if (selectedObject.datatype === 'event') {
        let screenshotFound = false;
        // Find the most recent screenshot before the event
        for (let i = selectedIndex - 1; i >= 0; i--) {
          if (imageList[i].datatype === 'screenshot') {
            fetchAndDownloadScreenshot(imageList[i].filename);
            screenshotFound = true;
            break;
          }
        }
        // If no screenshot is found before the event, keep the image source as it was
      }
    }
  }, [imageList, selectedIndex, filterMode]);
  
  const fetchAndDownloadScreenshot = (filename) => {
    fetch(`/getScreenshot?filename=${encodeURIComponent(filename)}&clientSessionId=${encodeURIComponent(clientSessionId)}`)
      .then((response) => response.blob())
      .then((blob) => {
        const imageUrl = window.URL.createObjectURL(new Blob([blob]));
        setImageSrc(imageUrl);  // Set loaded image source here
      })
      .catch((error) => {
        console.error('Error fetching the screenshot:', error);
        setImageSrc("");  // Set to empty if there's an error
      });
  };

  const navigateImages = (direction) => {
    let newIndex = currentImageIndex;
    while (true) {
      newIndex += direction;
      if (newIndex < 0 || newIndex >= imageList.length) break;
      if (filterMode === 'hybrid' || imageList[newIndex].datatype === filterMode) {
        setCurrentImageIndex(newIndex);
        onObjectFocus(newIndex);
        break;
      }
    }
  };

  const handleModeChange = (event) => {
    setFilterMode(event.target.value);
  };

  // Add the CSS transition here
  const imageStyle = {
    width: '50%',
    height: 'auto',
    resize: 'both',
    overflow: 'auto',
    maxWidth: '100%',
    maxHeight: '100%',
    opacity: imageSrc ? 1 : 0,
    transition: 'opacity 0.5s ease-in-out'
  };

  return (
    <div>
      {imageList[currentImageIndex] && (
        <>
          <img
            src={imageSrc || imageList[currentImageIndex]}
            alt={`image-${currentImageIndex}`}
            style={imageStyle}
          />
          <div>
            <button onClick={() => navigateImages(-1)} disabled={currentImageIndex === 0}>{"<"}</button>
            <button onClick={() => navigateImages(1)} disabled={currentImageIndex === imageList.length - 1}>{">"}</button>
            <label>
              <input
                type="radio"
                value="screenshot"
                name="mode"
                checked={filterMode === 'screenshot'}
                onChange={handleModeChange}
              />
              Screenshot
            </label>
            <label>
              <input
                type="radio"
                value="event"
                name="mode"
                checked={filterMode === 'event'}
                onChange={handleModeChange}
              />
              Event
            </label>
            <label>
              <input
                type="radio"
                value="hybrid"
                name="mode"
                checked={filterMode === 'hybrid'}
                onChange={handleModeChange}
              />
              Hybrid
            </label>
          </div>
        </>
      )}
    </div>
  );
};

export default ObjectViewer;