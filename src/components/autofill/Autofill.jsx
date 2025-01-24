import React from 'react';
import * as ReactDOM from 'react-dom/client';
import '../../app.css';

export const FloatingPage = ({ onClose, isPreview = false }) => {
  const containerStyle = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 2147483647,
    backgroundColor: 'white',
    width: '600px',
    maxHeight: 'calc(100vh - 40px)',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  };

  // Add preview-specific styles
  if (isPreview) {
    containerStyle.position = 'relative';
    containerStyle.margin = '20px auto';
    containerStyle.left = 'auto';
    containerStyle.right = 'auto';
  }

  return (
    <div id="yaoguai-floating-container" style={containerStyle}>
      <div className="floating-header">
        <h2>Auto Fill {isPreview && '(Preview Mode)'}</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      <div className="floating-content">
        <p>This is the floating page for auto-filling.</p>
      </div>
    </div>
  );
};

// Content script initialization remains the same for extension mode
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