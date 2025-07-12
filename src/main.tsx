import { createRoot } from 'react-dom/client';
import React from 'react';
import App from './App.tsx';
import './index.css';

// Debug logging
console.log('[DEBUG] main.tsx: Starting application initialization');

// Check if React is loaded
console.log('[DEBUG] React version:', React.version);

// Find root element
const rootElement = document.getElementById('root');
console.log('[DEBUG] Root element:', rootElement);

if (!rootElement) {
  const errorMsg = 'main.tsx: Failed to find the root element with id "root"';
  console.error(errorMsg);
  // Create a visible error message if root element is missing
  document.body.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      padding: 20px;
      background: #ffebee;
      color: #c62828;
      font-family: sans-serif;
      z-index: 9999;
    ">
      <h2>Application Error</h2>
      <p>${errorMsg}</p>
      <p>Please check if your index.html contains a div with id="root"</p>
    </div>
  `;
} else {
  console.log('[DEBUG] Found root element, creating React root...');
  
  try {
    const root = createRoot(rootElement);
    console.log('[DEBUG] React root created, rendering App component...');
    
    // Add a small delay to ensure all styles are loaded
    setTimeout(() => {
      try {
        root.render(
          <React.StrictMode>
            <App />
          </React.StrictMode>
        );
        console.log('[DEBUG] App component rendered successfully');
      } catch (renderError) {
        console.error('[ERROR] Error during render:', renderError);
        rootElement.innerHTML = `
          <div style="
            padding: 20px;
            background: #fff3e0;
            border-left: 5px solid #ff9800;
            margin: 20px;
            font-family: sans-serif;
          ">
            <h2>Render Error</h2>
            <pre>${renderError instanceof Error ? renderError.stack : String(renderError)}</pre>
          </div>
        `;
      }
    }, 100);
  } catch (rootError) {
    console.error('[ERROR] Failed to create root:', rootError);
    document.body.innerHTML = `
      <div style="
        padding: 20px;
        background: #ffebee;
        color: #c62828;
        font-family: sans-serif;
      ">
        <h2>Fatal Error</h2>
        <p>Failed to initialize the application:</p>
        <pre>${rootError instanceof Error ? rootError.stack : String(rootError)}</pre>
      </div>
    `;
  }
}

// Log when the script has finished executing
console.log('[DEBUG] main.tsx: Script execution complete');
