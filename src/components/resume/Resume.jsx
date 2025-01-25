import React, { useState, useEffect } from 'react';
import { DEFAULT_PROFILE_STRUCTURE, LABELS, TEXTAREA_FIELDS, DATE_TIME_FIELDS, DATE_FIELDS, NOT_EDITABLE_FIELDS } from '../Constants';
import { showFloatingPage } from '../autofill/AutoFill';
import { authService } from '../../services/authService';
import { formatDateTime, formatDate, getCurrentISOString } from '../common/dateUtils';

const ResumeSection = ({ title, data, isEditing, onEdit }) => {
  const shouldUseTextarea = (key, value) => {
    return TEXTAREA_FIELDS.some(field => key.toLowerCase().includes(field)) ||
      (typeof value === 'string' && value.length > 100);
  };

  const getFormattedDate = (key, value) => {
    if (!value) return '';
    if (DATE_TIME_FIELDS.includes(key)) {
      return formatDateTime(value);
    }
    if (DATE_FIELDS.includes(key)) {
      return formatDate(value);
    }
    return value;
  };

  const renderInput = (key, value) => {
    if (NOT_EDITABLE_FIELDS.includes(key)) {
      return <small style={{ whiteSpace: shouldUseTextarea(key, value) ? 'pre-wrap' : 'normal' }}>
        {getFormattedDate(key, value)}
      </small>;
    }

    if (shouldUseTextarea(key, value)) {
      return (
        <textarea
          value={value || ''}
          onChange={(e) => onEdit({ [key]: e.target.value })}
          style={{
            width: '100%',
            minHeight: '2.5em',
            height: 'auto',
            overflow: 'hidden',
            resize: 'none'
          }}
          ref={(element) => {
            if (element) {
              element.style.height = 'auto';
              element.style.height = `${element.scrollHeight}px`;
            }
          }}
        />
      );
    }
    return <input
      type="text"
      value={value || ''}
      onChange={(e) => onEdit({ [key]: e.target.value })}
    />;
  };

  const renderContent = () => {
    if (Array.isArray(data)) {
      // Special handling for skills array
      if (title === LABELS.sections.skills) {
        return (
          <div className="skills-grid">
            {data.map((skill, index) => (
              <div key={index} className="skill-item">
                {isEditing ? (
                  renderInput('skill', skill)
                ) : (
                  <span style={{
                    display: 'inline-block',
                    margin: '0.2em 0.5em 0.2em 0',
                    padding: '0.2em 0.5em',
                    backgroundColor: 'var(--secondary-hover)',
                    borderRadius: '4px'
                  }}>{skill}</span>
                )}
              </div>
            ))}
          </div>
        );
      }

      // Original array handling for other sections
      // Update in array handling
      return data.map((item, index) => (
        <div key={index} className="section-item">
          {Object.entries(item).map(([key, value]) => (
            <div key={key} className="field-item">
              <strong>{LABELS.fields[key] || key}: </strong>
              {isEditing ? (
                renderInput(key, value)
              ) : (
                <span style={{ whiteSpace: shouldUseTextarea(key, value) ? 'pre-wrap' : 'normal' }}>
                  {getFormattedDate(key, value)}
                </span>
              )}
            </div>
          ))}
        </div>
      ));

      // Update in object handling for nested objects
      {
        Object.entries(value).map(([subKey, subValue]) => (
          <div key={subKey} className="field-item">
            <strong>{LABELS.fields[subKey] || subKey}: </strong>
            {isEditing ? (
              renderInput(subKey, subValue)
            ) : (
              <span style={{ whiteSpace: shouldUseTextarea(subKey, subValue) ? 'pre-wrap' : 'normal' }}>
                {subValue}
              </span>
            )}
          </div>
        ))
      }
    } else if (typeof data === 'object') {
      return Object.entries(data).map(([key, value]) => {
        if (typeof value === 'object') {
          return (
            <div key={key} className="subsection">
              <h4>{LABELS.fields[key] || key}</h4>
              {Object.entries(value).map(([subKey, subValue]) => (
                <div key={subKey} className="field-item">
                  <strong>{LABELS.fields[subKey] || subKey}: </strong>
                  {isEditing ? (
                    renderInput(subKey, subValue)
                  ) : (
                    <span style={{ whiteSpace: shouldUseTextarea(subKey, subValue) ? 'pre-wrap' : 'normal' }}>
                      {getFormattedDate(subKey, subValue)}
                    </span>
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
              renderInput(key, value)
            ) : (
              <span style={{ whiteSpace: shouldUseTextarea(key, value) ? 'pre-wrap' : 'normal' }}>
                {getFormattedDate(key, value)}
              </span>
            )}
          </div>
        );
      });
    } else {
      return isEditing ? (
        <textarea
          value={data}
          style={{
            width: '100%',
            minHeight: title === LABELS.sections.coverLetter ? '400px' : '100px',
            height: 'auto',
            overflow: 'hidden',
            resize: 'none'
          }}
          ref={(element) => {
            if (element) {
              element.style.height = 'auto';
              element.style.height = `${element.scrollHeight}px`;
            }
          }}
          onChange={(e) => {
            const element = e.target;
            element.style.height = 'auto';
            element.style.height = `${element.scrollHeight}px`;
          }}
        />
      ) : (
        <p style={{ whiteSpace: 'pre-wrap' }}>{data}</p>
      );
    }
  };

  return (
    <section className="resume-section">
      <div className="section-header">
        <h3>{title}</h3>
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

  // Update effect to load saved profile and listen for changes
  useEffect(() => {
    // Load initial profile
    const loadCurrentProfile = () => {
      const savedProfile = localStorage.getItem('currentProfile');
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      } else {
        const currentUser = authService.getCurrentUser();
        const storedProfiles = JSON.parse(localStorage.getItem('userProfiles') || '{}');
        const userProfiles = storedProfiles[currentUser.id] || {};
        const defaultProfile = userProfiles['1'];
        if (defaultProfile) {
          setProfile(defaultProfile);
        }
      }
    };

    // Load initial profile
    loadCurrentProfile();

    // Listen for profile changes
    const handleProfileChange = (e) => {
      setProfile(e.detail.profile);
    };

    window.addEventListener('profileLoaded', handleProfileChange);
    window.addEventListener('storage', loadCurrentProfile);

    return () => {
      window.removeEventListener('profileLoaded', handleProfileChange);
      window.removeEventListener('storage', loadCurrentProfile);
    };
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

  const handleSectionEdit = (section, updates) => {
    setProfile(prevProfile => {
      const currentSection = prevProfile[section];
      
      // Handle array sections (like skills)
      if (Array.isArray(currentSection)) {
        if (updates.index !== undefined) {
          const newArray = [...currentSection];
          newArray[updates.index] = updates.value;
          return {
            ...prevProfile,
            [section]: newArray
          };
        }
      }
      
      // Handle nested objects (like work experience)
      if (typeof currentSection === 'object' && !Array.isArray(currentSection)) {
        return {
          ...prevProfile,
          [section]: {
            ...currentSection,
            ...updates
          }
        };
      }
      
      // Handle primitive values
      return {
        ...prevProfile,
        [section]: updates
      };
    });
  };

  const handleSave = () => {
    console.log('Saving profile:', profile);  // Debug log
    const updatedProfile = {
      ...profile,
      metadata: {
        ...profile.metadata,
        lastModified: getCurrentISOString()
      }
    };

    // Save to localStorage with correct ID
    const currentUser = authService.getCurrentUser();
    const storedProfiles = JSON.parse(localStorage.getItem('userProfiles') || '{}');
    storedProfiles[currentUser.id] = storedProfiles[currentUser.id] || {};
    storedProfiles[currentUser.id][profile.id] = updatedProfile;
    
    console.log('Updated storage:', storedProfiles);  // Debug log
    localStorage.setItem('userProfiles', JSON.stringify(storedProfiles));
    localStorage.setItem('currentProfile', JSON.stringify(updatedProfile));

    window.dispatchEvent(new CustomEvent('profileUpdated', { 
      detail: { profile: updatedProfile }
    }));

    setIsEditing(false);
  };

  return (
    <article className={isEditing ? 'resume-edit' : 'resume-display'}>
      <div className='grid'>
        <button onClick={handleAutoFill}>
          {typeof chrome === 'undefined' ? 'Toggle Auto Fill' : 'Auto Fill'}
        </button>
      </div>
      <div className='grid'>
        <button onClick={() => isEditing ? handleSave() : setIsEditing(true)}>
          {isEditing ? 'Save' : 'Edit'}
        </button>
      </div>
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