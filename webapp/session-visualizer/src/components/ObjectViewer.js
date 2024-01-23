import React, { useEffect, useState, useCallback } from "react";

const ObjectViewer = ({ imageList, onObjectFocus, selectedIndex, clientSessionId }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(selectedIndex);
  const [imageSrc, setImageSrc] = useState("");
  const [filterMode, setFilterMode] = useState('screenshot');

  const fetchAndDownloadScreenshot = useCallback((filename) => {
    fetch(`/getScreenshot?filename=${encodeURIComponent(filename)}&clientSessionId=${encodeURIComponent(clientSessionId)}`)
      .then((response) => response.blob())
      .then((blob) => {
        const imageUrl = window.URL.createObjectURL(new Blob([blob]));
        setImageSrc(imageUrl);
      })
      .catch((error) => {
        console.error('Error fetching the screenshot:', error);
        setImageSrc("");
      });
  }, [clientSessionId]);

  const navigateImages = useCallback((direction) => {
    let newIndex = currentImageIndex;

    while (true) {
      newIndex += direction;
      if (newIndex < 0 || newIndex >= imageList.length) return;

      const newImageDataType = imageList[newIndex]?.datatype;
      if (filterMode === 'event' && newImageDataType === 'event') {
        break;
      } else if (filterMode === 'screenshot' && newImageDataType === 'screenshot') {
        break;
      } else if (filterMode === 'hybrid') {
        break;
      }
    }

    setCurrentImageIndex(newIndex);
    const newImage = imageList[newIndex];
    if (newImage?.datatype === 'screenshot') {
      const filename = newImage?.filename;
      if (filename) {
        fetchAndDownloadScreenshot(filename);
      }
    }
    onObjectFocus(newIndex);
  }, [currentImageIndex, imageList, filterMode, onObjectFocus, fetchAndDownloadScreenshot]);

  useEffect(() => {
    if (imageList[currentImageIndex]) {
      if (imageList[currentImageIndex].datatype === 'screenshot') {
        fetchAndDownloadScreenshot(imageList[currentImageIndex].filename);
      }
    }
  }, [currentImageIndex, imageList, fetchAndDownloadScreenshot]);

  useEffect(() => {
    const selectedObject = imageList[selectedIndex];
    if (selectedObject) {
      setCurrentImageIndex(selectedIndex);
      if (selectedObject.datatype === 'screenshot') {
        fetchAndDownloadScreenshot(selectedObject.filename);
      } else {
        // If the selected object is not a screenshot, find the most recent one
        let recentScreenshotIndex = selectedIndex;
        while (recentScreenshotIndex >= 0 && imageList[recentScreenshotIndex].datatype !== 'screenshot') {
          recentScreenshotIndex -= 1;
        }
        if (recentScreenshotIndex >= 0) {
          const recentScreenshot = imageList[recentScreenshotIndex];
          fetchAndDownloadScreenshot(recentScreenshot.filename);
        } else {
          setImageSrc("");
        }
      }
    }
  }, [imageList, selectedIndex, fetchAndDownloadScreenshot]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.keyCode === 37) {
        navigateImages(-1);
      } else if (event.keyCode === 39) {
        navigateImages(1);
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [navigateImages]);

  const handleModeChange = (event) => {
    setFilterMode(event.target.value);
  };

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
            src={imageSrc || imageList[currentImageIndex].src}
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