import React, { useState, useRef, useEffect } from 'react';
import { SITE_LOGO } from '../Constants';
import * as ReactDOM from 'react-dom/client';

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
        position: 'fixed', // Add this line
        zIndex: 2147483647, // Add this line
        top: isExpanded ? '20px' : `${position.y}px`,
        left: isExpanded ? 'auto' : `${position.x}px`,
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

// Content script initialization remains the same for extension mode
const initializeContentScript = () => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'openFloatingPage') {
      try {
        // Create isolated container
        const hostContainer = document.createElement('div');
        hostContainer.id = 'yaoguai-host';
        document.body.appendChild(hostContainer);
        
        // Create shadow DOM with closed mode for better isolation
        const shadowRoot = hostContainer.attachShadow({ mode: 'open' }); // Changed to open mode for debugging

        // Add reset styles
        const resetStyles = document.createElement('style');
        resetStyles.textContent = `
          :host {
            all: initial !important;
            display: block !important;
            position: fixed !important;
            z-index: 2147483647 !important;
            font-family: system-ui, -apple-system, sans-serif !important;
          }
          * {
            box-sizing: border-box !important;
          }
        `;
        shadowRoot.appendChild(resetStyles);

        // Add Pico CSS
        const picoStyles = document.createElement('link');
        picoStyles.rel = 'stylesheet';
        picoStyles.href = chrome.runtime.getURL('assets/index.css');
        shadowRoot.appendChild(picoStyles);

        // Create container for React
        const container = document.createElement('div');
        shadowRoot.appendChild(container);

        const root = ReactDOM.createRoot(container);
        root.render(
          <FloatingPage 
            onClose={() => {
              root.unmount();
              hostContainer.remove();
              sendResponse({ success: true });
            }} 
          />
        );
      } catch (error) {
        console.error('Error initializing floating page:', error);
      }
    }
    return true;
  });
};

if (typeof chrome !== 'undefined' && chrome.runtime) {
  console.log('Initializing content script...');
  initializeContentScript();
}

export default FloatingPage;