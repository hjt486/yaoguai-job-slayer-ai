import React, { useState, useRef, useEffect } from 'react';
import { SITE_LOGO } from '../common/Constants';
import * as ReactDOM from 'react-dom/client';

// Import CSS as raw strings using Vite's ?raw suffix
import picoCss from '@picocss/pico/css/pico.css?raw';
import appCss from '../../App.css?raw';

// Create a unified mounting function for both DEV and Extension modes
const mountFloatingPage = (onClose, sendResponse = null) => {
  const isExtension = () => {
    return typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
  };

  // Cleanup existing instance
  document.getElementById('yaoguai-host')?.remove();

  const hostContainer = document.createElement('div');
  hostContainer.id = 'yaoguai-host';
  document.body.appendChild(hostContainer);

  let container;

  // In the mountFloatingPage function's extension block:
  if (true) {
    const shadowRoot = hostContainer.attachShadow({ mode: 'open' });

    // 1. Create container element first
    container = document.createElement('div');
    container.className = 'pico-scope';

    // Copy theme from main document
    const updateTheme = () => {
      const mainTheme = document.documentElement.getAttribute('data-theme');
      container.setAttribute('data-theme', mainTheme || '');
    };
    updateTheme(); // Initial set

    // Observe theme changes in main document
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    shadowRoot.appendChild(container);

    // 2. Add CSS reset with proper inheritance
    shadowRoot.appendChild(
      Object.assign(document.createElement('style'), {
        textContent: `
        :host {
          position: fixed !important;
          top: 20px !important;
          right: 20px !important;
          z-index: 2147483647 !important;
          contain: content !important;
          isolation: isolate !important;
          width: fit-content !important;
          height: fit-content !important;
          color-scheme: light dark;
          --yaoguai-pico-background-color: var(--pico-background-color, #ffffff);
          --yaoguai-pico-color: var(--pico-color, inherit);
        }

        div.pico-scope {
          all: initial; /* Reset all properties */
          display: block;
          font-family: inherit;
          /* Explicitly inherit variables from host */
          color: var(--yaoguai-pico-color, inherit);
          background-color: var(--yaoguai-pico-background-color, #ffffff);
          /* Inherit font settings */
          font-family: inherit;
          line-height: 1.5;
        }

        div.pico-scope * {
          box-sizing: border-box;
          font-family: inherit;
          line-height: inherit;
        }
      `
      })
    );

    // 3. Modify Pico CSS with proper scoping
    const modifiedPico = picoCss
      .replace(/:root\b/g, 'div.pico-scope')
      .replace(/html|body/g, 'div.pico-scope')
      .replace(/--pico-/g, '--yaoguai-pico-')
      .replace(/var\(--pico-/g, 'var(--yaoguai-pico-')
      .replace(/:root\b/g, 'div.pico-scope')
      .replace(/html|body/g, 'div.pico-scope')
      .replace(/--pico-/g, '--yaoguai-pico-')
      .replace(/var\(--pico-/g, 'var(--yaoguai-pico-');

    // 4. Properly scope App.css with more specific selectors
    const scopedAppCss = appCss
      // Create shadow DOM versions of the theme declarations
      .replace(/(\[data-theme=light\],\s*):root/g, '$1div.pico-scope')
      .replace(/:root:not\(\[data-theme=dark\]\)/g, 'div.pico-scope:not([data-theme=dark])')
      .replace(/@media\s+\(prefers-color-scheme:\s*dark\)\s*{\s*:root:not\(\[data-theme\]\)/g,
        '@media (prefers-color-scheme: dark) { div.pico-scope:not([data-theme])')
      .replace(/\[data-theme=dark\]/g, 'div.pico-scope[data-theme=dark]')
      // Then handle regular scoping
      .replace(/html|body/g, 'div.pico-scope')
      // Keep original :root declarations for popup
      .replace(/(\n\/\*.*?\*\/)/g, '$1\n/* Shadow DOM override */')
      // Variable replacements only for shadow DOM
      .replace(/--pico-/g, '--yaoguai-pico-')
      .replace(/var\(--pico-/g, 'var(--yaoguai-pico-')
      // Handle theme selectors first
      .replace(/(\[data-theme=light\],\s*):root/g, '$1div.pico-scope')
      .replace(/:root:not\(\[data-theme=dark\]\)/g, 'div.pico-scope:not([data-theme=dark])')
      .replace(/@media\s+\(prefers-color-scheme:\s*dark\)\s*{\s*:root:not\(\[data-theme\]\)/g,
        '@media (prefers-color-scheme: dark) { div.pico-scope:not([data-theme])')
      .replace(/\[data-theme=dark\]/g, 'div.pico-scope[data-theme=dark]')
      // Then handle regular scoping
      .replace(/html|body/g, 'div.pico-scope')
      .replace(/\.([\w-]+)/g, '.pico-scope .$1')
      .replace(/#([\w-]+)/g, '.pico-scope #$1')
      .replace(/([^@{}\s,])([^{},]*){/g, '.pico-scope $1$2{')
      .replace(/\.pico-scope \.pico-scope/g, '.pico-scope')
      // Variable replacements
      .replace(/--pico-/g, '--yaoguai-pico-')
      .replace(/var\(--pico-/g, 'var(--yaoguai-pico-')
      // First handle root variables and selectors
      .replace(/:root\b/g, 'div.pico-scope') // Add this line
      .replace(/html|body/g, 'div.pico-scope') // Existing line
      // Then handle other scoping
      .replace(/\.([\w-]+)/g, '.pico-scope .$1')
      .replace(/#([\w-]+)/g, '.pico-scope #$1')
      // Handle class selectors
      .replace(/\.([\w-]+)/g, '.pico-scope .$1')
      // Handle ID selectors
      .replace(/#([\w-]+)/g, '.pico-scope #$1')
      // Handle element selectors but skip @media and keyframes
      .replace(/([^@{}\s,])([^{},]*){/g, '.pico-scope $1$2{')
      // Fix double scoping
      .replace(/\.pico-scope \.pico-scope/g, '.pico-scope')
      // Handle media queries
      .replace(/@media/g, '@media')
      // Replace Pico variables
      .replace(/--pico-/g, '--yaoguai-pico-')
      .replace(/var\(--pico-/g, 'var(--yaoguai-pico-');

    // Add floating container specific styles
    const containerStyles = `
      .pico-scope .floating-container {
        background: var(--yaoguai-pico-background-color, #ffffff) !important;
        border-radius: 8px !important;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important;
        padding: 1rem !important;
      }

      .pico-scope .floating-container.expanded {
        width: 300px !important;
        min-height: 200px !important;
      }

      .pico-scope .floating-button {
        width: 40px !important;
        height: 40px !important;
        padding: 8px !important;
        border-radius: 50% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        background: white !important;
        border: 1px solid #ddd !important;
      }

      .pico-scope article {
        margin: 0 !important;
        padding: 1rem !important;
      }
    `;

    // 5. Create style elements with proper order
    const styles = [
      modifiedPico,
      scopedAppCss,
      containerStyles
    ];

    styles.forEach(css => {
      shadowRoot.appendChild(
        Object.assign(document.createElement('style'), { textContent: css })
      );
    });
  } else {
    // DEV mode styling
    document.head.appendChild(
      Object.assign(document.createElement('style'), {
        textContent: `
          ${picoCss}
          ${appCss}
          #yaoguai-host { 
            position: fixed !important;
            top: 20px !important;
            right: 20px !important;
            z-index: 2147483647 !important;
            contain: content !important;
          }`
      })
    );
    container = hostContainer;
  }

  const root = ReactDOM.createRoot(container);
  root.render(
    <FloatingPage
      onClose={() => {
        root.unmount();
        hostContainer.remove();
        sendResponse?.({ success: true });
        onClose?.();
      }}
    />
  );

  return hostContainer;
};


// Export for DEV mode
export const showFloatingPage = (onClose) => {
  return mountFloatingPage(onClose);
};

// In the initializeContentScript function
const initializeContentScript = () => {
  console.log('[YaoguaiAI] Content script initializing...');

  // Add ping handler
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'ping') {
      sendResponse({ alive: true });
      return true;
    }

    if (message.action === 'openFloatingPage') {
      console.log('[YaoguaiAI] Attempting to mount floating page...');
      try {
        const container = mountFloatingPage(null, sendResponse);
        console.log('[YaoguaiAI] Floating page mounted successfully', container);
        sendResponse({ success: true });
      } catch (error) {
        console.error('[YaoguaiAI] Error mounting floating page:', error);
        sendResponse({ success: false, error: error.message });
      }
    }
    return true;
  });
};

if (typeof chrome !== 'undefined' && chrome.runtime) {
  console.log('[YaoguaiAI] Chrome extension environment detected');
  initializeContentScript();
}

export const FloatingPage = ({ onClose }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (!isExpanded) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      dragOffset.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      };
    }
  };

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsExpanded(prev => !prev);
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
    <div className="pico-scope"
    >
      <div
        id="yaoguai-floating-container"
        className={`floating-container ${isExpanded ? 'expanded' : 'collapsed'} tight-layout`}
        style={{
          cursor: isDragging ? 'grabbing' : (isExpanded ? 'default' : 'grab'),
        }}
        onMouseDown={handleMouseDown}
      >
        {isExpanded ? (
          <article style={{ margin: 0 }} className='test-class'>
            <header>
              <nav>
                <ul>
                  <li>{SITE_LOGO()}</li>
                </ul>
                <ul>
                  <li>
                    <button className="outline contrast" onClick={handleClick}>×</button>
                  </li>
                </ul>
              </nav>
            </header>
            <main>
              <fieldset>
                <textarea
                  name="bio"
                  placeholder="Write a professional short bio..."
                  aria-label="Professional short bio"
                >
                </textarea>
                <label>
                  Brightness
                  <input type="range" />
                </label>

                <label>
                  <input name="terms" type="checkbox" role="switch" />
                  I agree to the Terms
                </label>
                <label>
                  <input name="opt-in" type="checkbox" role="switch" checked />
                  Receive news and offers
                </label>
              </fieldset>
              <progress />
              <details aria-busy="true">
                <summary>Auto Fill Options</summary>
                <p>This is the floating page for auto-filling.</p>
              </details>
            </main>
          </article>
        ) : (
          <button
            className="floating-button outline"
            onClick={handleClick}
            style={{
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
          >{SITE_LOGO()}</button>
        )}
      </div>
    </div>
  );
};

export default FloatingPage;