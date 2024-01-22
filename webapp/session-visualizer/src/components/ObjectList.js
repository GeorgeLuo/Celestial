import React, { useRef, useEffect } from "react";

const ObjectList = ({ flowData, selectedBoxIndex, onBoxClick }) => {
  const eventRefs = useRef([]);

  useEffect(() => {
    if (eventRefs.current[selectedBoxIndex]) {
      eventRefs.current[selectedBoxIndex].scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  }, [selectedBoxIndex, flowData]);

  return (
    <div>
      {flowData.map((data, index) => (
        <pre
          key={index}
          ref={(el) => (eventRefs.current[index] = el)}
          onClick={() => onBoxClick(index)}
          style={{
            padding: "10px",
            margin: "10px",
            border: selectedBoxIndex === index ? "2px solid blue" : "1px solid #ddd",
            display: "inline-block",
            cursor: "pointer",
            backgroundColor: selectedBoxIndex === index ? "#e6e6e6" : "",
            textAlign: "left"
          }}
        >
          {JSON.stringify(data, null, 2)}
        </pre>
      ))}
    </div>
  );
};

export default ObjectList;
