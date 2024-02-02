import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Import BrowserRouter from react-router-dom
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Wrap the App component with BrowserRouter */}
    <BrowserRouter> 
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
