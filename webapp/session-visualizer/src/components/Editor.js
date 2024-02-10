import React, { useEffect } from 'react';
import './Editor.css';
import ObjectViewer from './ObjectViewer.js'; // import the ObjectViewer

const Editor = ({ onClose, selectedIndex, imageList, clientSessionId, onObjectFocus }) => {
  // Function for handling the Escape key press event
  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    // Add an event listener for the Escape key press
    window.addEventListener('keydown', handleKeyDown);
    // Remove event listener on cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []); // Empty dependency array means this effect runs only on mount and unmount

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <ObjectViewer
          imageList={imageList}
          selectedIndex={selectedIndex}
          clientSessionId={clientSessionId}
          onObjectFocus={onObjectFocus}
        />
      </div>
    </div>
  );
};

export default Editor;