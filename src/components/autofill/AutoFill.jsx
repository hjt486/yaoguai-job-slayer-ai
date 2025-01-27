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

    // 1. Create theme-aware container
    container = document.createElement('div');
    container.className = 'pico-scope';

    // Theme synchronization with main document
    const syncTheme = () => {
      container.setAttribute('data-theme',
        document.documentElement.getAttribute('data-theme') || ''
      );
    };
    syncTheme(); // Initial sync

    // Watch for theme changes
    new MutationObserver(syncTheme).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    // 2. Shadow DOM styling setup
    const createStyle = css => {
      const style = document.createElement('style');
      style.textContent = css;
      return style;
    };

    // Base reset and container styles
    shadowRoot.appendChild(createStyle(`
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
    --yaoguai-pico-background-color: var(--pico-background-color, #fff);
    --yaoguai-pico-color: var(--pico-color, inherit);
  }

  .pico-scope {
    all: initial;
    display: block;
    font-family: inherit;
    line-height: 1.5;
    color: var(--yaoguai-pico-color);
    background-color: var(--yaoguai-pico-background-color);
  }

  .pico-scope * {
    box-sizing: border-box;
    font-family: inherit;
    line-height: inherit;
  }
`));

    // 3. CSS processing helpers
    const scopeCSSText = (css, scope) => {
      const replacements = [
        [/:root\b/g, scope],          // Root selector
        [/html|body/g, scope],        // HTML/body elements
        [/--pico-/g, '--yaoguai-pico-'], // CSS variables
        [/(\s|,)html|body/g, '$1' + scope], // Selector lists
        [/([^{}]*){/g, `${scope} $1{`] // General scoping
      ];

      return replacements.reduce(
        (result, [pattern, replacement]) =>
          result.replace(pattern, replacement),
        css
      );
    };

    // Process Pico CSS
    const scopedPico = scopeCSSText(picoCss, 'div.pico-scope');

    // Process App CSS with additional theming
    const scopedApp = scopeCSSText(appCss, 'div.pico-scope')
      .replace(/(\[data-theme=light\],\s*):root/g, '$1div.pico-scope')
      .replace(/:root:not\(\[data-theme=dark\]\)/g, 'div.pico-scope:not([data-theme=dark])')
      .replace(/@media\s+\(prefers-color-scheme:\s*dark\)\s*{\s*:root:not\(\[data-theme\]\)/g,
        '@media (prefers-color-scheme: dark) { div.pico-scope:not([data-theme])');

    // Container-specific overrides
    const containerOverrides = `
  .floating-container {
    background: var(--yaoguai-pico-background-color) !important;
    border-radius: 8px !important;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important;
    padding: 1rem !important;
  }

  .floating-container.expanded {
    width: 300px !important;
    min-height: 200px !important;
  }

  .floating-button {
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

  article {
    margin: 0 !important;
    padding: 1rem !important;
  }
`;

    // 4. Assemble styles in order
    shadowRoot.append(
      container,
      createStyle(scopedPico),
      createStyle(scopedApp),
      createStyle(containerOverrides)
    );
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