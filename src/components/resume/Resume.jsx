import React, { useState } from 'react';
import { DEFAULT_PROFILE_STRUCTURE, LABELS } from '../Constants';
import { FloatingPage } from '../autofill/AutoFill';

const ResumeSection = ({ title, data, isEditing }) => {
  const renderContent = () => {
    if (Array.isArray(data)) {
      return data.map((item, index) => (
        <div key={index} className="section-item">
          {Object.entries(item).map(([key, value]) => (
            <div key={key} className="field-item">
              <strong>{LABELS.fields[key] || key}: </strong>
              {isEditing ? (
                <input type="text" value={value} />
              ) : (
                <span>{value}</span>
              )}
            </div>
          ))}
        </div>
      ));
    } else if (typeof data === 'object') {
      return Object.entries(data).map(([key, value]) => {
        if (typeof value === 'object') {
          return (
            <div key={key} className="subsection">
              <h3>{LABELS.fields[key] || key}</h3>
              {Object.entries(value).map(([subKey, subValue]) => (
                <div key={subKey} className="field-item">
                  <strong>{LABELS.fields[subKey] || subKey}: </strong>
                  {isEditing ? (
                    <input type="text" value={subValue} />
                  ) : (
                    <span>{subValue}</span>
                  )}
                </div>
              ))}
            </div>
          );
        }
        return (
          <div key={key} className="field-item">
            <strong>{LABELS.fields[key] || key}: </strong>
            {isEditing ? (
              <input type="text" value={value} />
            ) : (
              <span>{value}</span>
            )}
          </div>
        );
      });
    } else {
      return isEditing ? (
        <textarea value={data} />
      ) : (
        <p>{data}</p>
      );
    }
  };

  return (
    <section className="resume-section">
      <div className="section-header">
        <h2>{title}</h2>
      </div>
      <div className="section-content">
        {renderContent()}
      </div>
    </section>
  );
};

const Resume = () => {
  const [profile, setProfile] = useState(DEFAULT_PROFILE_STRUCTURE);
  const [isEditing, setIsEditing] = useState(false);
  const [showFloating, setShowFloating] = useState(false);

  const handleSectionEdit = (section, data) => {
    setProfile(prev => ({
      ...prev,
      [section]: data
    }));
  };

  const handleAutoFill = async () => {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      // Original Chrome extension code
      try {
        console.log('Attempting to send message to content script...');
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
        if (!tab) {
          console.error('No active tab found');
          return;
        }

        if (!tab.url || tab.url.startsWith('chrome://')) {
          console.error('Cannot inject content script into chrome:// pages');
          alert('Please navigate to a webpage before using this feature');
          return;
        }

        // First, inject the content script
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          });
          console.log('Content script injected successfully');
        } catch (injectionError) {
          console.error('Error injecting content script:', injectionError);
          return;
        }

        // Then send the message
        await chrome.tabs.sendMessage(tab.id, { action: 'openFloatingPage' });
        console.log('Message sent successfully');
        window.close();
      } catch (error) {
        console.error('Error sending message:', error);
      }
    } else {
      // Dev mode: toggle floating page
      setShowFloating(!showFloating);
    }
  };

  return (
    <article>
      <div className='grid'>
        <button onClick={handleAutoFill}>
          {typeof chrome === 'undefined' ? 'Toggle Auto Fill' : 'Auto Fill'}
        </button>
      </div>
      <div className='grid'><button onClick={() => setIsEditing(!isEditing)}>
        {isEditing ? 'Save' : 'Edit'}
      </button></div>
      {Object.entries(LABELS.sections).map(([section, label]) => (
        <ResumeSection
          key={section}
          title={label}
          data={profile[section]}
          isEditing={isEditing}
          onEdit={(data) => handleSectionEdit(section, data)}
        />
      ))}
      <div className='grid'><button>Download PDF Resume</button></div>
      <div className='grid'><button>Download PDF Cover Letter</button></div>
      {showFloating && (
        <FloatingPage onClose={() => setShowFloating(false)} />
      )}
    </article>
  );
};

export default Resume;