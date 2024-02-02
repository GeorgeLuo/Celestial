import React from "react";
import "./App.css";
import FlowAnalysis from "./pages/FlowAnalysis"; // Make sure the path is correct
import { useLocation } from "react-router-dom"; // Make sure to install 'react-router-dom' if not already installed

function App() {
  // Function to parse query parameters
  const useQuery = () => new URLSearchParams(useLocation().search);

  // Access query params using useQuery
  let query = useQuery();
  let clientSessionId = query.get("captureSessionId");

  return (
    <div className="App">
      {/* Pass clientSessionId as a prop to FlowAnalysis */}
      <FlowAnalysis initialClientSessionId={clientSessionId} />
    </div>
  );
}

export default App;
