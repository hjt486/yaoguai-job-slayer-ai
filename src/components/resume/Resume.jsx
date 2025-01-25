import React, { useState, useEffect } from 'react';
import { DEFAULT_PROFILE_STRUCTURE, LABELS } from '../Constants';
import { FloatingPage, showFloatingPage } from '../autofill/AutoFill';
import { authService } from '../../services/authService';

const ResumeSection = ({ title, data, isEditing }) => {
  const renderContent = () => {
    if (Array.isArray(data)) {
      // Special handling for skills array
      if (title === LABELS.sections.skills) {
        return (
          <div className="skills-grid">
            {data.map((skill, index) => (
              <div key={index} className="skill-item">
                {isEditing ? (
                  <input type="text" value={skill} />
                ) : (
                  <span>{skill}</span>
                )}
              </div>
            ))}
          </div>
        );
      }
      
      // Original array handling for other sections
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
  const [floatingInstance, setFloatingInstance] = useState(null);

  // Add effect to load saved profile
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    const storedProfiles = JSON.parse(localStorage.getItem('userProfiles') || '{}');
    const userProfiles = storedProfiles[currentUser.id] || {};
    const defaultProfile = userProfiles['1'];

    if (defaultProfile) {
      setProfile(defaultProfile);
    }
  }, []);

  const handleAutoFill = async () => {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      try {
        console.log('[YaoguaiAI] Getting active tab...');
        const [tab] = await chrome.tabs.query({ 
          active: true, 
          currentWindow: true 
        });

        if (!tab) {
          console.error('[YaoguaiAI] No active tab found');
          return;
        }

        // First, try to inject the content script
        console.log('[YaoguaiAI] Injecting content script...');
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          });
          console.log('[YaoguaiAI] Content script injected successfully');
        } catch (err) {
          console.log('[YaoguaiAI] Content script already exists or injection failed:', err);
        }

        // Wait a moment for the content script to initialize
        await new Promise(resolve => setTimeout(resolve, 100));

        // Now try to send the message
        console.log('[YaoguaiAI] Sending message to tab:', tab.id);
        const response = await chrome.tabs.sendMessage(tab.id, { 
          action: 'openFloatingPage',
          source: 'popup'
        });
        console.log('[YaoguaiAI] Response received:', response);
        window.close();
      } catch (error) {
        console.error('[YaoguaiAI] Error in handleAutoFill:', error);
      }
    } else {
      // DEV mode: toggle floating page with proper Shadow DOM
      if (!floatingInstance) {
        console.log('Mounting floating page in DEV mode');
        const instance = showFloatingPage(() => {
          setFloatingInstance(null);
        });
        setFloatingInstance(instance);
      } else {
        console.log('Unmounting floating page in DEV mode');
        floatingInstance.remove();
        setFloatingInstance(null);
      }
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
    </article>
  );
};

export default Resume;