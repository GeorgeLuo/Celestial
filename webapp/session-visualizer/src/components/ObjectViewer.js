import React, { useEffect, useState } from "react";

const ObjectViewer = ({ imageList, onObjectFocus, selectedIndex, clientSessionId }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageSrc, setImageSrc] = useState("");
  const [filterMode, setFilterMode] = useState('screenshot');

  useEffect(() => {
    // Initialize to the first screenshot in the imageList.
    const firstScreenshotIndex = imageList.findIndex(object => object.datatype === 'screenshot');
    if (firstScreenshotIndex !== -1) setCurrentImageIndex(firstScreenshotIndex);
  }, [imageList]);

  useEffect(() => {
    const selectedObject = imageList[selectedIndex];
    if (selectedObject) {
      if (selectedObject.datatype === 'screenshot' || filterMode === 'hybrid') {
        fetchAndDownloadScreenshot(selectedObject.filename);
      } else if (selectedObject.datatype === 'event') {
        // Find the most recent screenshot before the event
        for (let i = selectedIndex - 1; i >= 0; i--) {
          if (imageList[i].datatype === 'screenshot') {
            fetchAndDownloadScreenshot(imageList[i].filename);
            break;
          }
        }
      }
    }
  }, [imageList, selectedIndex, filterMode]);  

  const fetchAndDownloadScreenshot = (filename) => {
    fetch(`/getScreenshot?filename=${encodeURIComponent(filename)}&clientSessionId=${encodeURIComponent(clientSessionId)}`)
      .then((response) => response.blob())
      .then((blob) => {
        const imageUrl = window.URL.createObjectURL(new Blob([blob]));
        setImageSrc(imageUrl);
      })
      .catch((error) => {
        console.error('Error fetching the screenshot:', error);
      });
  };

  const navigateImages = (direction) => {
    let newIndex = currentImageIndex;
    while (true) {
      newIndex += direction;
      if (newIndex < 0 || newIndex >= imageList.length) break; // Out of bounds
      if (filterMode === 'hybrid' || imageList[newIndex].datatype === filterMode) {
        setCurrentImageIndex(newIndex);
        onObjectFocus(newIndex);
        break;
      }
    }
  };

  // Radio button change handler
  const handleModeChange = (event) => {
    setFilterMode(event.target.value);
  };

  return (
    <div>
      {imageList[currentImageIndex] && (
        <>
          <img
            src={imageSrc || imageList[currentImageIndex]}
            alt={`image-${currentImageIndex}`}
            style={{
              width: '50%',
              height: 'auto',
              resize: 'both',
              overflow: 'auto',
              maxWidth: '100%',
              maxHeight: '100%'
            }}
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
