import React, { useState, useRef, useEffect } from 'react';
import * as ReactDOM from 'react-dom/client';

export const FloatingPage = ({ onClose }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 60, y: 20 });
  const dragRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (!isExpanded) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  return (
    <div 
      id="yaoguai-floating-container" 
      className={`floating-container ${isExpanded ? 'expanded' : 'collapsed'}`}
      style={{
        top: isExpanded ? '20px' : `${position.y}px`,
        left: isExpanded ? 'auto' : `${position.x}px`,
        cursor: isDragging ? 'grabbing' : (isExpanded ? 'default' : 'grab')
      }}
      onMouseDown={handleMouseDown}
      ref={dragRef}
    >
      {isExpanded ? (
        <article style={{ margin: 0 }}>
          <header onClick={() => setIsExpanded(false)}>
            <nav>
              <ul>
                <li><h3>Auto Fill</h3></li>
              </ul>
              <ul>
                <li>
                  <button className="outline contrast" onClick={onClose}>×</button>
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