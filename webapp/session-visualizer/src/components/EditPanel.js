import React, { useEffect, useState } from "react";
import "./EditPanel.css"; // Importing the CSS file for styles

const EditPanel = ({ selectedObject, onSelectedObjectChange }) => {
  const [editFields, setEditFields] = useState(selectedObject);

  useEffect(() => {
    setEditFields(selectedObject);
  }, [selectedObject]);

  const handleInputChange = (key, value) => {
    const updatedFields = { ...editFields, [key]: value };
    setEditFields(updatedFields);
  };

  useEffect(() => {
    onSelectedObjectChange(editFields);
  }, [editFields]);

  const renderEditFields = (object) => {
    return Object.entries(object).map(([key, value]) => (
      <div key={key} className="edit-field">
        <label className="edit-label">{key}</label> {/* Applying class for the label */}
        <input
          type="text"
          value={value}
          onChange={(e) => handleInputChange(key, e.target.value)}
          className="edit-input" // Applying class for the input
        />
      </div>
    ));
  };

  return (
    <div className="edit-panel">
      {editFields && renderEditFields(editFields)}
    </div>
  );
};

export default EditPanel;