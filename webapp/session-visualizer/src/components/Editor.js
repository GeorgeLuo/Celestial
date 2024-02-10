import React, { useEffect, useState } from "react";
import "./Editor.css";
import ObjectViewer from "./ObjectViewer.js";

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

const Editor = ({
    onClose,
    selectedIndex,
    imageList,
    clientSessionId,
    onObjectFocus,
}) => {
    const [selectedObject, setSelectedObject] = useState(imageList[selectedIndex]);

    const handleSelectedObjectChange = (updatedObject) => {
        setSelectedObject(updatedObject);
    };

    const handleKeyDown = (event) => {
        if (event.key === "Escape") {
            onClose();
        }
    };

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    useEffect(() => {
        setSelectedObject(imageList[selectedIndex]);
    }, [selectedIndex, imageList]);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="object-viewer">
                    <ObjectViewer
                        imageList={imageList}
                        selectedIndex={selectedIndex}
                        clientSessionId={clientSessionId}
                        onObjectFocus={onObjectFocus}
                        imageWidth="75%"
                    />
                </div>
                <div className="edit-panel">
                    <EditPanel
                        selectedObject={selectedObject}
                        onSelectedObjectChange={handleSelectedObjectChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default Editor;