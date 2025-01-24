import React from 'react';
import * as ReactDOM from 'react-dom/client';
import '../../app.css';

export const FloatingPage = ({ onClose }) => {
  return (
    <div id="yaoguai-floating-container" className="floating-container" style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 2147483647,
      backgroundColor: 'white'
    }}>
      <div className="floating-header">
        <h2>Auto Fill</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      <div className="floating-content">
        <p>This is the floating page for auto-filling.</p>
      </div>
    </div>
  );
};

// Content script initialization
const initializeContentScript = () => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Message received in content script:', message);
    if (message.action === 'openFloatingPage') {
      console.log('Opening floating page...');
      const container = document.createElement('div');
      container.id = 'yaoguai-root';
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.right = '0';
      container.style.zIndex = '2147483647';
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
};

if (typeof chrome !== 'undefined' && chrome.runtime) {
  console.log('Initializing content script...');
  initializeContentScript();
}

export default FloatingPage;