import React from 'react';
import './Editor.css';
import ObjectViewer from './ObjectViewer.js'; // import the ObjectViewer

const Editor = ({ onClose, selectedIndex, imageList, clientSessionId, onImageUpdate }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          &times;
        </button>

        <ObjectViewer
          imageList={imageList}
          selectedIndex={selectedIndex}
          isEditable={false} // Pass the isEditable prop as true
          onEdit={onImageUpdate} // Pass a callback function to handle edits
          clientSessionId={clientSessionId}
        />
      </div>
    </div>
  );
};

export default Editor;