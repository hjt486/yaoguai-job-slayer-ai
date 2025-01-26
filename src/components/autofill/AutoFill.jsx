import React, { useState, useRef, useEffect } from 'react';
import { SITE_LOGO } from '../common/Constants';
import * as ReactDOM from 'react-dom/client';

// Import CSS as raw strings using Vite's ?raw suffix
import picoCss from '@picocss/pico/css/pico.css?raw';
import appCss from '../../App.css?raw';

// Create a unified mounting function for both DEV and Extension modes
const mountFloatingPage = (onClose, sendResponse = null) => {
  const hostContainer = document.createElement('div');
  hostContainer.id = 'yaoguai-host';
  document.body.appendChild(hostContainer);

  const shadowRoot = hostContainer.attachShadow({ mode: 'open' });

  const injectRootVariables = () => {
    const rootStyles = getComputedStyle(document.documentElement);
    const variables = [...rootStyles]
      .filter(prop => prop.startsWith('--'))
      .map(prop => `${prop}: ${rootStyles.getPropertyValue(prop)};`)
      .join('\n');

    const style = document.createElement('style');
    style.textContent = `:host, :host * { ${variables} }`;
    shadowRoot.appendChild(style);
  };


  // Modify the style injection to have:
  const injectStyles = (cssContent, isHostStyles = false) => {
    const style = document.createElement('style');
    style.textContent = isHostStyles ? `:host { ${cssContent} }` : cssContent;
    shadowRoot.appendChild(style);
  };

  // Modify how Pico CSS is injected
  injectStyles(`
  ${picoCss
      .replace(/:root/g, ':host')
      .replace(/html/g, ':host')
      .replace(/body/g, ':host > div')
    }
  `);
  injectStyles(appCss);

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
        // position: 'absolute',
        // left: position.x + 'px',
        // top: position.y + 'px',
        cursor: isDragging ? 'grabbing' : (isExpanded ? 'default' : 'grab')
      }}
      onMouseDown={handleMouseDown}
    >
      {isExpanded ? (
        <article style={{ margin: 0 }} className='test-class '>
          <header onClick={() => setIsExpanded(false)}>
            <nav>
              <ul>
                <li>{SITE_LOGO()}</li>
              </ul>
              <ul>
                <li>
                  <button hidden={true} className="outline contrast" onClick={onClose}>×</button>
                </li>
              </ul>
            </nav>
          </header>
          <main>
            <details aria-busy="true">
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

export default FloatingPage;