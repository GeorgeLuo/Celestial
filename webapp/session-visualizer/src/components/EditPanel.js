import React, { useEffect, useState } from "react";

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
                <label>{key}</label>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => handleInputChange(key, e.target.value)}
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