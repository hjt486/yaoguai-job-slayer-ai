import React, { useState, useRef, useEffect } from 'react';
import { SITE_LOGO } from '../common/Constants';
import * as ReactDOM from 'react-dom/client';

// Import CSS as raw strings using Vite's ?raw suffix
import picoCss from '@picocss/pico/css/pico.css?raw';
import appCss from '../../App.css?raw';

export const FloatingPage = ({ onClose }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 60, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (!isExpanded) {
      e.preventDefault();
      setIsDragging(true);
      dragOffset.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      };
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      e.preventDefault();
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div
      id="yaoguai-floating-container"
      className={`floating-container ${isExpanded ? 'expanded' : 'collapsed'} tight-layout`}
      style={{
        cursor: isDragging ? 'grabbing' : (isExpanded ? 'default' : 'grab')
      }}
      onMouseDown={handleMouseDown}
    >
      {isExpanded ? (
        <article style={{ margin: 0 }}>
          <header onClick={() => setIsExpanded(false)}>
            <nav>
              <ul>
                <li>{SITE_LOGO()}</li>
              </ul>
              <ul>
                <li>
                  <button hidden='true' className="outline contrast" onClick={onClose}>×</button>
                </li>
              </ul>
            </nav>
          </header>
          <main>
            <details>
              <summary>Auto Fill Options</summary>
              <p>This is the floating page for auto-filling.</p>
            </details>
          </main>
        </article>
      ) : (
        <button
          className="contrast floating-button"
          onClick={() => setIsExpanded(true)}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          ⚡
        </button>
      )}
    </div>
  );
};

// Create a unified mounting function for both DEV and Extension modes
const mountFloatingPage = (onClose, sendResponse = null) => {
  const hostContainer = document.createElement('div');
  hostContainer.id = 'yaoguai-host';
  document.body.appendChild(hostContainer);

  const shadowRoot = hostContainer.attachShadow({ mode: 'open' });

  // 1. Create proper style elements
  const injectStyles = (cssContent) => {
    const style = document.createElement('style');
    style.textContent = cssContent;
    shadowRoot.appendChild(style);
  };

  // 2. Inject styles in correct order
  injectStyles(`
    :host {
      all: initial !important;
      contain: content !important;
      display: block !important;
      position: fixed !important;
      top: 20px !important;
      right: 20px !important;
      z-index: 2147483647 !important;
      isolation: isolate !important;
      font-family: system-ui, sans-serif !important;
      width: fit-content !important;
      height: fit-content !important;
      transform: none !important; /* Add this line */
      margin: 0 !important;
      padding: 0 !important;
    }
  `);

  injectStyles(picoCss);  // Imported Pico CSS
  injectStyles(appCss);   // Imported App CSS

  // 3. Create React container
  const container = document.createElement('div');
  shadowRoot.appendChild(container);

  // 4. Render React component
  const root = ReactDOM.createRoot(container);
  root.render(
    <FloatingPage
      onClose={() => {
        root.unmount();
        hostContainer.remove();
        if (sendResponse) sendResponse({ success: true });
        if (onClose) onClose();
      }}
    />
  );

  return hostContainer;
};

// Export for DEV mode
export const showFloatingPage = (onClose) => {
  return mountFloatingPage(onClose);
};

// Use for Extension mode
const initializeContentScript = () => {
  console.log('[YaoguaiAI] Content script initializing...');
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[YaoguaiAI] Message received in content script:', message);
    console.log('[YaoguaiAI] Sender:', sender);
    
    if (message && message.action === 'openFloatingPage') {
      console.log('[YaoguaiAI] Attempting to mount floating page...');
      try {
        const container = mountFloatingPage(null, sendResponse);
        console.log('[YaoguaiAI] Floating page mounted successfully', container);
        sendResponse({ success: true });
      } catch (error) {
        console.error('[YaoguaiAI] Error mounting floating page:', error);
        sendResponse({ success: false, error: error.message });
      }
    } else {
      console.log('[YaoguaiAI] Received message with unknown action:', message);
    }
    return true;
  });

  console.log('[YaoguaiAI] Content script initialized and listening for messages');
};

if (typeof chrome !== 'undefined' && chrome.runtime) {
  console.log('[YaoguaiAI] Chrome extension environment detected');
  initializeContentScript();
}

export default FloatingPage;