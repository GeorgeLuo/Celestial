import React from "react";
import './Editor.css'

const Editor = ({ onClose, children }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* The close button should be correctly rendered within the modal content */}
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        {/* Here you can add additional modal content or structure as needed */}
        {children}
      </div>
    </div>
  );
};

export default Editor;