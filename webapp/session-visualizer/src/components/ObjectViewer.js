import React, { useEffect, useState, useCallback } from "react";

const ObjectViewer = ({
  imageList,
  onObjectFocus,
  selectedIndex,
  clientSessionId,
  isEditable = false,
  onEdit
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(selectedIndex);
  const [imageSrc, setImageSrc] = useState("");
  const [filterMode, setFilterMode] = useState("screenshot");

  const handleInputChange = (event, index) => {
    if (isEditable && onEdit) {
      onEdit(event.target.value, index);
    }
  };

  const fetchAndDownloadScreenshot = useCallback(
    (filename) => {
      fetch(
        `/getScreenshot?filename=${encodeURIComponent(
          filename,
        )}&clientSessionId=${encodeURIComponent(clientSessionId)}`,
      )
        .then((response) => response.blob())
        .then((blob) => {
          const imageUrl = window.URL.createObjectURL(new Blob([blob]));
          setImageSrc(imageUrl);
        })
        .catch((error) => {
          console.error("Error fetching the screenshot:", error);
          setImageSrc("");
        });
    },
    [clientSessionId],
  );

  const resetFocusObject = useCallback(
    (direction) => {
      let newIndex = selectedIndex;

      while (true) {
        newIndex += direction;
        if (newIndex < 0 || newIndex >= imageList.length) return;

        const newImageDataType = imageList[newIndex]?.datatype;
        if (filterMode === "event" && newImageDataType === "event") {
          break;
        } else if (
          filterMode === "screenshot" &&
          newImageDataType === "screenshot"
        ) {
          break;
        } else if (filterMode === "hybrid") {
          break;
        }
      }

      setCurrentImageIndex(newIndex);
      onObjectFocus(newIndex);
    },
    [currentImageIndex, imageList, filterMode],
  );

  const findRelevantImage = useCallback(
    (selectedIndex) => {
      const selectedObject = imageList[selectedIndex];
      if (selectedObject) {
        setCurrentImageIndex(selectedIndex);
        if (selectedObject.datatype === "screenshot") {
          fetchAndDownloadScreenshot(selectedObject.filename);
        } else {
          // If the selected object is not a screenshot, find the most recent one
          let recentScreenshotIndex = selectedIndex;
          while (
            recentScreenshotIndex >= 0 &&
            imageList[recentScreenshotIndex].datatype !== "screenshot"
          ) {
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
    },
    [imageList, selectedIndex],
  );

  useEffect(() => {
    findRelevantImage(selectedIndex);
  }, [findRelevantImage]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.keyCode === 37) {
        resetFocusObject(-1);
      } else if (event.keyCode === 39) {
        resetFocusObject(1);
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [resetFocusObject]);

  const handleModeChange = (event) => {
    setFilterMode(event.target.value);
  };

  const imageStyle = {
    width: "50%",
    height: "auto",
    resize: "both",
    overflow: "auto",
    maxWidth: "100%",
    maxHeight: "100%",
    opacity: imageSrc ? 1 : 0,
    transition: "opacity 0.5s ease-in-out",
  };

  return (
    <div style={{ position: "relative" }}>
      {imageList[currentImageIndex] && (
        <>
          <img
            src={imageSrc || imageList[currentImageIndex].src}
            alt={`image-${currentImageIndex}`}
            style={imageStyle}
          />
          {isEditable ? (
            // If in edit mode, render text fields for editing
            imageList.map((image, index) => (
              <input
                key={index}
                type="text"
                value={image.src}
                onChange={(event) => handleInputChange(event, index)}
              />
            ))
          ) : (
            // In view mode, just display the image sources as text
            <p>{imageList[currentImageIndex].src}</p>
          )}
          <div>
            <button
              onClick={() => resetFocusObject(-1)}
              disabled={currentImageIndex === 0}
            >
              {"<"}
            </button>
            <button
              onClick={() => resetFocusObject(1)}
              disabled={currentImageIndex === imageList.length - 1}
            >
              {">"}
            </button>
            <label>
              <input
                type="radio"
                value="screenshot"
                name="mode"
                checked={filterMode === "screenshot"}
                onChange={handleModeChange}
              />
              Screenshot
            </label>
            <label>
              <input
                type="radio"
                value="event"
                name="mode"
                checked={filterMode === "event"}
                onChange={handleModeChange}
              />
              Event
            </label>
            <label>
              <input
                type="radio"
                value="hybrid"
                name="mode"
                checked={filterMode === "hybrid"}
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
