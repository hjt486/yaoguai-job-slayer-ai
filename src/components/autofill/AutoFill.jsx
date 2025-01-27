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

    // 1. Theme-aware container setup
    container = document.createElement('div');
    container.className = 'pico-scope';

    // Theme synchronization
    const syncTheme = () => {
      const mainTheme = document.documentElement.getAttribute('data-theme') || '';
      container.setAttribute('data-theme', mainTheme);
    };
    syncTheme();
    new MutationObserver(syncTheme).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    // 2. Style helpers
    const createStyle = css => {
      const style = document.createElement('style');
      style.textContent = css;
      return style;
    };

    // 3. Base styles with CSS variables
    shadowRoot.appendChild(createStyle(`
  :host {
    position: fixed !important;
    top: 20px !important;
    right: 20px !important;
    z-index: 2147483647 !important;
    contain: content !important;
    isolation: isolate !important;
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

    // 4. CSS Processing
    const processPicoCSS = (css) => {
      return css
        // Preserve element selectors while scoping
        .replace(/([^}])progress/g, '$1.pico-scope progress')
        .replace(/([^}])\[aria-busy/g, '$1.pico-scope [aria-busy')
        // Add shadow root scope to keyframe animations
        .replace(/@keyframes (\w+)/g, (match, name) =>
          `@keyframes pico-scope-${name}`
        )
        .replace(/(animation: ?)(\w+)/g, (match, prefix, name) =>
          `${prefix}pico-scope-${name}`
        )
        // Then apply existing replacements
        .replace(/:root(?![^:])/g, '.pico-scope')
        .replace(/html|body/g, '.pico-scope')
        .replace(/--pico-/g, '--yaoguai-pico-')
        .replace(/var\(--pico-/g, 'var(--yaoguai-pico-');
    };

    const processAppCSS = (css) => {
      return css
        // Handle aria-busy animations
        .replace(/@keyframes (\w+)/g, (match, name) =>
          `@keyframes pico-scope-${name}`
        )
        .replace(/(animation: ?)(\w+)/g, (match, prefix, name) =>
          `${prefix}pico-scope-${name}`
        )
        // Existing replacements
        .replace(/(\[data-theme=light\],\s*):root/g, '$1.pico-scope')
        .replace(/:root:not\(\[data-theme=dark\]\)/g, '.pico-scope:not([data-theme=dark])')
        .replace(/@media\s+\(prefers-color-scheme:\s*dark\)\s*{\s*:root:not\(\[data-theme\]\)/g,
          '@media (prefers-color-scheme: dark) { .pico-scope:not([data-theme])')
        .replace(/([^{]*{)/g, '.pico-scope $1')
        .replace(/\.pico-scope (html|body)/g, '.pico-scope')
        .replace(/--pico-/g, '--yaoguai-pico-')
        .replace(/var\(--pico-/g, 'var(--yaoguai-pico-')
        .replace(/\.pico-scope \.pico-scope/g, '.pico-scope');
    };

    const componentFixes = `
      /* Progress bar fixes */
      .pico-scope progress {
        height: 0.5rem !important;
        border-radius: 0 !important;
        overflow: hidden !important;
      }

      .pico-scope progress::-webkit-progress-bar {
        background-color: var(--yaoguai-pico-background-color) !important;
        border: 1px solid var(--yaoguai-pico-border-color) !important;
      }

      .pico-scope progress::-webkit-progress-value {
        background-color: var(--yaoguai-pico-primary) !important;
        transition: width 0.5s ease !important;
      }

      /* Loading spinner fixes */
      .pico-scope [aria-busy="true"]::after {
        content: " " !important;
        display: inline-block !important;
        width: 1rem !important;
        height: 1rem !important;
        border: 2px solid currentColor !important;
        border-radius: 50% !important;
        border-right-color: transparent !important;
        animation: pico-scope-spinner 0.75s linear infinite !important;
        margin-left: 0.5rem !important;
        vertical-align: text-bottom !important;
      }

      @keyframes pico-scope-spinner {
        to { transform: rotate(360deg); }
      }
    `;

    // 5. Apply processed CSS
    const picoStyles = processPicoCSS(picoCss);
    const appStyles = processAppCSS(appCss);

    // 6. Container-specific overrides (should come last)
    const overrides = `
    .floating-container {
      background: var(--yaoguai-pico-background-color) !important;
      border-radius: 8px !important;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important;
      padding: 1rem !important;
    }

    .floating-button {
      width: 40px !important;
      height: 40px !important;
      padding: 8px !important;
      border-radius: 50% !important;
    }

    article {
      margin: 0 !important;
      padding: 1rem !important;
    }
  `;

    // 7. Inject styles in correct order
    shadowRoot.append(
      container,
      createStyle(picoStyles),
      createStyle(componentFixes), // Add component fixes
      createStyle(appStyles),
      createStyle(overrides)
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