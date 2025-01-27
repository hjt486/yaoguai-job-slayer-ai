import React, { useState, useRef, useEffect } from 'react';
import { SITE_LOGO, LABELS, APPLICATION_ONLY_SECTIONS } from '../common/Constants';
import { ResumeSection } from '../resume/Resume';
import * as ReactDOM from 'react-dom/client';
import { authService } from '../../services/authService';
import { getCurrentISOString } from '../common/dateUtils';
import { storageService } from '../../services/storageService';

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
  // if (isExtension()) {
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
        top: 0 !important;
        right: 0 !important;
        z-index: 2147483647 !important;
        contain: content !important;
        isolation: isolate !important;
        width: fit-content !important;
        height: fit-content !important;
        background: transparent !important;
        transform: translate(-20px, 20px);
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
    // DEV mode styling, NOT USED
    document.head.appendChild(
      Object.assign(document.createElement('style'), {
        textContent: `
          ${picoCss}
          ${appCss}
          #yaoguai-host { 
            position: fixed !important;
            top: 0 !important;
            right: 0 !important;
            z-index: 2147483647 !important;
            contain: content !important;
            isolation: isolate !important;
            width: fit-content !important;
            height: fit-content !important;
            transform: translate(-20px, 20px);
            background: white !important;
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

  let floatingPageInstance = null;

  // Add ping handler
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'ping') {
      sendResponse({ alive: true });
      return true;
    }

    if (message.action === 'toggleFloatingPage') {
      if (floatingPageInstance) {
        floatingPageInstance.remove();
        floatingPageInstance = null;
        sendResponse({ success: true });
      } else {
        try {
          floatingPageInstance = mountFloatingPage(null, sendResponse);
          sendResponse({ success: true });
        } catch (error) {
          console.error('[YaoguaiAI] Error mounting floating page:', error);
          sendResponse({ success: false, error: error.message });
        }
      }
      return true;
    }

    if (message.action === 'openFloatingPage') {
      console.log('[YaoguaiAI] Attempting to mount floating page...');
      try {
        floatingPageInstance = mountFloatingPage(null, sendResponse);
        console.log('[YaoguaiAI] Floating page mounted successfully', floatingPageInstance);
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
  const [profile, setProfile] = useState(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const wasDragging = useRef(false);
  const hasMoved = useRef(false);

  // Add profile loading effect
  useEffect(() => {
    const loadCurrentProfile = () => {
      const savedProfile = storageService.get('currentProfile');
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
    };

    const handleProfileUpdate = (e) => {
      setProfile(e.detail.profile);
    };

    const handleStorageChange = (e) => {
      if (e.key === 'currentProfile' || e.key?.startsWith('userProfiles')) {
        loadCurrentProfile();
      }
    };

    loadCurrentProfile();
    storageService.addChangeListener(handleStorageChange);
    window.addEventListener('profileUpdated', handleProfileUpdate);
    window.addEventListener('profileLoaded', handleProfileUpdate);

    return () => {
      storageService.removeChangeListener(handleStorageChange);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      window.removeEventListener('profileLoaded', handleProfileUpdate);
    };
  }, []);

  const handleSectionEdit = (section, updates) => {
    setProfile(prevProfile => {
      // ... copy the handleSectionEdit function from Resume.jsx ...
    });
  };

  const handleSectionSave = () => {
    const updatedProfile = {
      ...profile,
      metadata: {
        ...profile.metadata,
        lastModified: getCurrentISOString()
      }
    };

    const currentUser = authService.getCurrentUser();
    const storedProfiles = JSON.parse(storageService.get('userProfiles') || '{}');
    storedProfiles[currentUser.id] = storedProfiles[currentUser.id] || {};
    storedProfiles[currentUser.id][profile.id] = updatedProfile;

    storageService.set('userProfiles', JSON.stringify(storedProfiles));
    storageService.set('currentProfile', JSON.stringify(updatedProfile));

    window.dispatchEvent(new CustomEvent('profileUpdated', {
      detail: { profile: updatedProfile }
    }));
  };

  const handleMouseDown = (e) => {
    // Allow dragging on both collapsed state and header
    if (!isExpanded || e.target.closest('header')) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      hasMoved.current = false;
      dragOffset.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      };
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      e.preventDefault();
      hasMoved.current = true; // Mark actual movement
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y
      });
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      // Only mark as dragging if there was actual movement
      wasDragging.current = hasMoved.current;
      setIsDragging(false);
    }
  };

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only toggle if no dragging occurred
    if (!wasDragging.current) {
      setIsExpanded(prev => !prev);
    }
    // Reset dragging flag
    wasDragging.current = false;
  };

  // Remove the second useEffect and update the first one
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      // Update host element position
      const updateHostPosition = () => {
        const host = document.getElementById('yaoguai-host');
        if (host) {
          host.style.transform = `translate(${position.x - 20}px, ${position.y + 20}px)`;
        }
      };
      updateHostPosition();

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, position]);

  return (
    <div className="pico-scope">
      <div
        id="yaoguai-floating-container"
        className={`floating-container ${isExpanded ? 'expanded' : 'collapsed'} tight-layout`}
        style={{ cursor: isDragging ? 'grabbing' : (isExpanded ? 'default' : 'grab') }}
        onMouseDown={handleMouseDown}
      >
        {isExpanded ? (
          <article style={{ margin: 0 }} className='test-class tight-layout'>
            <header style={{ cursor: 'grab' }}>
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
            <main style={{ maxHeight: '80vh', overflowY: 'auto' }}>
              {profile ? (
                <>
                  {Object.entries(LABELS.sections)
                    // Remove the filter that excludes APPLICATION_ONLY_SECTIONS
                    .map(([section, label]) => (
                      <ResumeSection
                        key={section}
                        section={section}
                        title={label}
                        data={profile[section]}
                        profile={profile}
                        onEdit={handleSectionEdit}
                        onSave={handleSectionSave}
                        hideEdit={true}
                      />
                    ))}
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <h3>Please create a profile</h3>
                </div>
              )}
            </main>
          </article>
        ) : (
          <button
            className="floating-button outline"
            onClick={handleClick}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >{SITE_LOGO()}</button>
        )}
      </div>
    </div>
  );
};

export default FloatingPage;