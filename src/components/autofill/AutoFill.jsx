import React, { useState, useRef, useEffect } from 'react';
import { SITE_LOGO, LABELS, APPLICATION_ONLY_SECTIONS } from '../common/Constants';
import { ResumeSection } from '../resume/Resume';
import * as ReactDOM from 'react-dom/client';
import { authService } from '../../services/authService';
import { getCurrentISOString } from '../common/dateUtils';
import { storageService } from '../../services/storageService';
import { aiService } from '../common/aiService';
import { FIELD_PATTERNS, VALUE_MAPPINGS } from './fieldPatterns';
import { PLATFORM_PATTERNS, PLATFORM_VALUE_MAPPINGS } from './platformPatterns';
import { handleFileUpload, getPlatformSelectors } from './platformHandlers';

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
        const parsedProfile = JSON.parse(savedProfile);
        console.log('[YaoguaiAI] Current profile loaded:', parsedProfile);
        setProfile(parsedProfile);
      }
    };

    const handleProfileUpdate = (e) => {
      console.log('[YaoguaiAI] Profile updated:', e.detail.profile);
      setProfile(e.detail.profile);
    };

    const handleStorageChange = (e) => {
      if (e.key === 'currentProfile' || e.key?.startsWith('userProfiles')) {
        console.log('[YaoguaiAI] Storage changed, reloading profile...');
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

  const [autoFillStatus, setAutoFillStatus] = useState(null);
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  const detectPlatform = () => {
    const url = window.location.href;
    const html = document.documentElement.innerHTML;

    for (const [platform, { patterns }] of Object.entries(PLATFORM_PATTERNS)) {
      const matchedPattern = patterns.find(pattern =>
        url.includes(pattern) || html.includes(pattern)
      );

      if (matchedPattern) {
        return platform;
      }
    }
    return null;
  };

  const detectFieldType = (input) => {
      if (!input || !(input instanceof Element)) {
        return null;
      }
  
      const platform = detectPlatform();
      if (!platform || !PLATFORM_PATTERNS[platform]) {
        return null;
      }
  
      console.log("\n[YaoguaiAI] ========== Field Detection Start ==========");
      
      const dataAutomationId = input.getAttribute('data-automation-id')?.toLowerCase();
      const name = input.name?.toLowerCase();
      const id = input.id?.toLowerCase();
      const ariaLabel = input.getAttribute('aria-label')?.toLowerCase();
  
      console.log('[YaoguaiAI] Field Detection:', {
        platform,
        'data-automation-id': dataAutomationId,
        name,
        id,
        'aria-label': ariaLabel,
        type: input.type,
        tagName: input.tagName
      });
  
      const fields = PLATFORM_PATTERNS[platform].fields;
      for (const [fieldType, config] of Object.entries(fields)) {
        // Check all possible identifiers
        const matchFound = config.selectors.some(selector => {
          const selectorLower = selector.toLowerCase();
          return (
            (dataAutomationId && dataAutomationId === selectorLower) ||
            (name && name === selectorLower) ||
            (id && id === selectorLower) ||
            (ariaLabel && ariaLabel === selectorLower)
          );
        });
  
        if (matchFound) {
          console.log('[YaoguaiAI] ✅ Match found:', {
            fieldType,
            element: input.tagName,
            type: input.type
          });
          console.log("[YaoguaiAI] ========== Field Detection End ==========")
          return { type: fieldType, platform };
        }
      }
  
      console.log('[YaoguaiAI] ❌ No match found');
      console.log("[YaoguaiAI] ========== Field Detection End ==========")
      return null;
  };

  const getValueMapping = (type, value, platform) => {
    // Check platform-specific mappings first
    if (platform && PLATFORM_VALUE_MAPPINGS[type]?.[platform]) {
      const platformMappings = PLATFORM_VALUE_MAPPINGS[type][platform];
      for (const [mappedValue, patterns] of Object.entries(platformMappings)) {
        if (patterns.includes(value.toLowerCase())) {
          return mappedValue;
        }
      }
    }

    // Fall back to generic mappings
    if (VALUE_MAPPINGS[type]) {
      for (const [mappedValue, patterns] of Object.entries(VALUE_MAPPINGS[type])) {
        if (patterns.includes(value.toLowerCase())) {
          return mappedValue;
        }
      }
    }
    return value;
  };

  const highlightField = (input, success = true) => {
    if (!input || !(input instanceof HTMLElement)) {
      console.log('[YaoguaiAI] Cannot highlight invalid input:', input);
      return;
    }

    try {
      const style = window.getComputedStyle(input);
      const originalBackground = style.backgroundColor;
      input.style.backgroundColor = success ? '#e6ffe6' : '#ffe6e6';
      setTimeout(() => {
        if (input.isConnected) {  // Check if element is still in DOM
          input.style.backgroundColor = originalBackground;
        }
      }, 1000);
    } catch (error) {
      console.error('[YaoguaiAI] Error highlighting field:', error);
    }
  };

  // Update fillField to use highlighting
  const fillField = async (input, value, fieldType, platform) => {
    try {
        const maxRetries = 3;
        let attempt = 0;

        while (attempt < maxRetries) {
            try {
                console.log('[YaoguaiAI] Attempting to fill field:', {
                    type: fieldType,
                    platform: platform,
                    attempt: attempt + 1,
                    inputType: input.type,
                    value: value
                });

                // Ensure the field is editable
                if (!input.isConnected || input.disabled || input.readOnly) {
                    throw new Error('Field is not fillable');
                }

                await new Promise(resolve => setTimeout(resolve, 100)); // Delay to prevent rapid fills

                // Special handling for file inputs
                if (input.type === 'file') {
                    console.log('[YaoguaiAI] Handling file upload for platform:', platform);
                    try {
                        await handleFileUpload(input, profile, platform);
                        console.log('[YaoguaiAI] File upload successful');
                    } catch (fileError) {
                        console.error('[YaoguaiAI] File upload failed:', fileError);
                        throw new Error(`Resume upload failed: ${fileError.message}`);
                    }
                    return;
                }

                // Special handling for select elements
                if (input.tagName === 'SELECT') {
                    const options = Array.from(input.options);
                    const mappedValue = getValueMapping(fieldType, value, platform);

                    let matchingOption = options.find(opt =>
                        opt.value.toLowerCase() === mappedValue.toLowerCase() ||
                        opt.text.toLowerCase().includes(mappedValue.toLowerCase())
                    );

                    if (!matchingOption) {
                        throw new Error(`No matching option found for value: ${mappedValue}`);
                    }

                    input.value = matchingOption.value;
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                    return;
                }

                // Standard input fields (text, email, phone, etc.)
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                    window.HTMLInputElement.prototype, "value"
                ).set;
                
                if (nativeInputValueSetter) {
                    nativeInputValueSetter.call(input, value);
                } else {
                    input.value = value;
                }

                // **Ensure React detects the change**
                const event = new Event('input', { bubbles: true });
                input.dispatchEvent(event);

                // Additional handling for React's internal state tracker
                const tracker = input._valueTracker;
                if (tracker) {
                    tracker.setValue(value);
                }

                return; // Successfully filled, exit loop
            } catch (error) {
                attempt++;
                if (attempt === maxRetries) {
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, 500)); // Retry delay
            }
        }
    } catch (error) {
        console.error('Field fill error:', error);
        highlightField(input, false);
        throw error;
    }
};


  const [fillProgress, setFillProgress] = useState({ current: 0, total: 0 });

  const [skippedFields, setSkippedFields] = useState([]);

  const isFieldVisible = (element) => {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    return !(rect.width === 0 ||
      rect.height === 0 ||
      style.visibility === 'hidden' ||
      style.display === 'none' ||
      style.opacity === '0');
  };

  // Update handleAutoFill to track skipped fields
  const handleAutoFill = async (targetInputs = null) => {
    setSkippedFields([]);
    if (!profile) {
      console.log('[YaoguaiAI] No profile found, aborting autofill');
      return;
    }

    setIsAutoFilling(true);
    setAutoFillStatus('Scanning page...');
    let filledCount = 0;

    try {
      const platform = detectPlatform();
      console.log('[YaoguaiAI] Platform detected:', platform);

      let inputs;
      if (targetInputs) {
        // Improved logging for targetInputs
        console.log('[YaoguaiAI] Target inputs:', {
          value: targetInputs,
          isArray: Array.isArray(targetInputs),
          count: Array.isArray(targetInputs) ? targetInputs.length : 1
        });
        inputs = Array.isArray(targetInputs) ? targetInputs : [targetInputs];
      } else {
        const selectors = getPlatformSelectors(platform).join(',');
        const allInputs = document.querySelectorAll(selectors);
        console.log('[YaoguaiAI] All inputs found:', allInputs?.length);

        inputs = Array.from(allInputs || [])
          .filter(input => input instanceof HTMLElement && isFieldVisible(input));
        console.log('[YaoguaiAI] Visible inputs:', inputs.length);
      }

      // Additional validation with logging
      inputs = inputs.filter(input => {
        const isValid = input instanceof HTMLElement &&
          input.tagName &&
          ['INPUT', 'SELECT', 'TEXTAREA'].includes(input.tagName);
        if (!isValid) {
          console.log('[YaoguaiAI] Skipping invalid input:', input);
        }
        return isValid;
      });

      console.log('[YaoguaiAI] Valid inputs to process:', inputs.length);

      setFillProgress({ current: 0, total: inputs.length });

      const getProfileValue = (profile, path) => {
        return path.split('.').reduce((obj, key) => obj?.[key], profile);
      };

      for (const input of inputs) {
        try {
          console.log("[YaoguaiAI] ========== Field Detection Start ==========")
          const match = detectFieldType(input);
          if (match) {
            const { type, platform } = match;  // Make sure we get both type and platform
            let value;

            // Get field mapping for current platform
            const fieldMapping = platform && PLATFORM_PATTERNS[platform]?.fields[type];

            if (fieldMapping?.profilePath) {
              // Use direct profile path mapping
              value = getProfileValue(profile, fieldMapping.profilePath);
              console.log('[YaoguaiAI] Using profile path:', {
                type,
                path: fieldMapping.profilePath,
                value
              });
            } else {
              // Fallback for unmapped fields
              for (const section of Object.keys(profile)) {
                if (profile[section]?.[type]) {
                  value = profile[section][type];
                  console.log('[YaoguaiAI] Using fallback value:', {
                    type,
                    section,
                    value
                  });
                  break;
                }
              }
            }

            if (value) {
              const mappedValue = getValueMapping(type, value, platform);
              await fillField(input, mappedValue, type, platform);
              filledCount++;
              highlightField(input, true);
            }
          }
        } catch (error) {
          console.error('Field fill error:', error);
          highlightField(input, false);
          setSkippedFields(prev => [...prev, { input, error: error.message }]);
        } finally {
          const newProgress = { current: fillProgress.current + 1, total: fillProgress.total };
          setFillProgress(newProgress);
          setAutoFillStatus(`Processed ${newProgress.current} of ${newProgress.total} fields...`);
        }
      }

      const skipCount = skippedFields.length;
      setAutoFillStatus(
        `Completed: ${filledCount} fields filled${skipCount ? `, ${skipCount} skipped` : ''}`
      );
      setTimeout(() => setAutoFillStatus(null), 3000);
    } catch (error) {
      console.error('Auto-fill error:', error);
      setAutoFillStatus('Error: ' + error.message);
    } finally {
      setIsAutoFilling(false);
    }
  };

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
              <div className="grid">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleAutoFill(null);  // Pass null instead of the event object
                  }}
                  disabled={isAutoFilling}
                  className={isAutoFilling ? 'outline' : ''}
                >
                  {isAutoFilling ? 'Auto-filling...' : 'Auto Fill'}
                </button>
                {autoFillStatus && (
                  <div className="text-center">
                    <small>{autoFillStatus}</small>
                    {fillProgress.total > 0 && (
                      <progress value={fillProgress.current} max={fillProgress.total}></progress>
                    )}
                  </div>
                )}
                {skippedFields.length > 0 && (
                  <div className="grid">
                    <small>Fields skipped: {skippedFields.length}</small>
                    <button
                      onClick={() => handleAutoFill(skippedFields.map(f => f.input))}
                      className="outline"
                      disabled={isAutoFilling}
                    >
                      Retry Failed Fields
                    </button>
                  </div>
                )}
              </div>
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