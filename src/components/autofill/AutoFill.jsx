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
      }

      .pico-scope {
      }

      .pico-scope * {

      }
    `));

    // 3. CSS processing helpers
    const scopeCSSText = (css, scope) => {
      const replacements = [
        [/:root\b/g, scope],          // Root selector
        [/html|body/g, scope],        // HTML/body elements
        [/--pico-/g, '--yaoguai-pico-'], // CSS variables
        [/var\(--pico-/g, 'var(--yaoguai-pico-'], // Fix variable references
        [/(\s|,)html|body/g, '$1' + scope], // Selector lists
        // Don't modify @keyframes or media queries
        [/([^@{}]*){/g, (match, p1) => {
          if (p1.includes('@keyframes') || p1.includes('@media')) return match;
          return `${scope} ${p1}{`;
        }]
      ];

      return replacements.reduce(
        (result, [pattern, replacement]) =>
          result.replace(pattern, replacement),
        css
      );
    };

    // Process Pico CSS first to ensure base styles
    const scopedPico = scopeCSSText(picoCss, 'div.pico-scope');

    // Then process App CSS
    const scopedApp = scopeCSSText(appCss, 'div.pico-scope')
      .replace(/(\[data-theme=light\],\s*):root/g, '$1div.pico-scope')
      .replace(/:root:not\(\[data-theme=dark\]\)/g, 'div.pico-scope:not([data-theme=dark])');

    // 4. Assemble styles in order of specificity
    shadowRoot.append(
      container,
      createStyle(scopedPico),
      createStyle(scopedApp)
    );

    // 4. Assemble styles in order
    shadowRoot.append(
      container,
      createStyle(scopedPico),
      createStyle(scopedApp),
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
              <details>
                <summary>Components Preview</summary>
                <details>
                  <summary>Example</summary>
                </details>
                <details>
                  <summary>Button 1</summary>
                  <button>Button</button>
                  <button class="secondary">Secondary</button>
                  <button class="contrast">Contrast</button>
                  <button disabled>Disabled</button>
                  <button class="secondary" disabled>Disabled</button>
                  <button class="contrast" disabled>Disabled</button>
                  <div role="group">
                    <button>Button</button>
                    <button>Button</button>
                    <button>Button</button></div>
                </details>

                <article>I’m a card!</article>

                <details>
                  <summary>Some</summary>
                  <details class="dropdown">
                    <summary>Dropdown</summary>
                    <ul>
                      <li><a href="#">Solid</a></li>
                      <li><a href="#">Liquid</a></li>
                      <li><a href="#">Gas</a></li>
                      <li><a href="#">Plasma</a></li>
                    </ul>
                  </details>
                  <select name="select" aria-label="Select" required>
                    <option selected disabled value="">Select</option>
                    <option>Solid</option>
                    <option>Liquid</option>
                    <option>Gas</option>
                    <option>Plasma</option>false
                  </select>
                  <form>
                    <fieldset role="group">
                      <input name="email" type="email" placeholder="Email" autocomplete="email" />
                      <input name="password" type="password" placeholder="Password" />
                      <input type="submit" value="Log in" />
                    </fieldset>
                  </form>
                </details>

                <details>
                  <summary>loading</summary>
                  <button aria-busy="true" aria-label="Please wait…" />
                  <button aria-busy="true" aria-label="Please wait…" class="secondary" />
                  <button aria-busy="true" aria-label="Please wait…" class="contrast" />
                  <button aria-busy="true" class="outline">Please wait…</button>
                  <button aria-busy="true" class="outline secondary">Please wait…</button>
                  <button aria-busy="true" class="outline contrast">Please wait…</button>
                  <progress />
                  <p>Tooltip on a <a href="#" data-tooltip="Tooltip">link</a></p>
                  <p>Tooltip on <em data-tooltip="Tooltip">inline element</em></p>
                  <p><button data-tooltip="Tooltip">Tooltip on a button</button></p>
                </details>
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