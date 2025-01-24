import React from 'react';
import * as ReactDOM from 'react-dom/client';
import './Autofill.css'; // Import the CSS file

(function() {
  const FloatingPage = ({ onClose }) => {
    return (
      <div id="yaoguai-floating-container" className="floating-container">
        <h2>Floating Page</h2>
        <p>This is the floating page for auto-filling.</p>
        <button onClick={onClose}>Close</button>
      </div>
    );
  };

  // Listen for messages from the popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Message received in content script:', message);
    if (message.action === 'openFloatingPage') {
      console.log('Opening floating page...');
      const container = document.createElement('div');
      container.id = 'yaoguai-root';
      document.body.appendChild(container);

      const root = ReactDOM.createRoot(container);
      root.render(
        <FloatingPage 
          onClose={() => {
            root.unmount();
            container.remove();
            sendResponse({ success: true });
          }} 
        />
      );
    }
    return true;
  });
})();