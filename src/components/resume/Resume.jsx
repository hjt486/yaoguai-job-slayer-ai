import React, { useState, useEffect, useRef } from 'react';
import { DEFAULT_PROFILE_STRUCTURE, LABELS, TEXTAREA_FIELDS, DATE_TIME_FIELDS, DATE_FIELDS, NOT_EDITABLE_FIELDS } from '../Constants';
import { showFloatingPage } from '../autofill/AutoFill';
import { authService } from '../../services/authService';
import { formatDateTime, formatDate, getCurrentISOString } from '../common/dateUtils';
import { generatePDF } from '../common/pdfUtils';
import { showResumePreview } from '../common/pdfUtils';

const ResumeSection = ({ title, data, section, onEdit, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);

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

  const renderInput = (key, value, index) => {
    if (NOT_EDITABLE_FIELDS.includes(key)) {
      return <small style={{ whiteSpace: shouldUseTextarea(key, value) ? 'pre-wrap' : 'normal' }}>
        {getFormattedDate(key, value)}
      </small>;
    }

    if (shouldUseTextarea(key, value)) {
      return (
        <textarea
          value={value || ''}
          onChange={(e) => onEdit(section, {
            key,
            value: e.target.value,
            index
          })}
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
      onChange={(e) => onEdit(section, {
        key,
        value: e.target.value,
        index
      })}
    />;
  };

  const renderContent = () => {
    if (Array.isArray(data)) {
      if (title === LABELS.sections.skills) {
        return (
          <div className="skills-grid">
            {data.map((skill, index) => (
              <div key={index} className="skill-item">
                {isEditing ? (
                  <input
                    type="text"
                    value={skill || ''}
                    onChange={(e) => onEdit({
                      key: 'skill',
                      value: e.target.value,
                      index
                    })}
                  />
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

      return data.map((item, index) => (
        <div key={index} className="section-item">
          {Object.entries(item).map(([key, value]) => (
            <div key={key} className="field-item">
              <strong>{LABELS.fields[key] || key}: </strong>
              {isEditing ? (
                renderInput(key, value, index)
              ) : (
                <span style={{ whiteSpace: shouldUseTextarea(key, value) ? 'pre-wrap' : 'normal' }}>
                  {getFormattedDate(key, value)}
                </span>
              )}
            </div>
          ))}
        </div>
      ));
    } else if (typeof data === 'object' && data !== null) {
      return Object.entries(data).map(([key, value]) => (
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
      ));
    } else {
      return isEditing ? (
        <textarea
          value={data || ''}
          onChange={(e) => onEdit({
            value: e.target.value
          })}
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
        />
      ) : (
        <p style={{ whiteSpace: 'pre-wrap' }}>{data}</p>
      );
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    onSave();
  };

  return (
    <section className="resume-section">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>{title}</h3>
        <button 
          className="outline secondary button-small"
          onClick={isEditing ? handleSave : handleEdit}
        >
          {isEditing ? LABELS.actions.save : LABELS.actions.edit}
        </button>
      </div>
      <div className="section-content">
        {renderContent()}
      </div>
    </section>
  );
};

const Resume = () => {
  const [profile, setProfile] = useState(DEFAULT_PROFILE_STRUCTURE);
  const [editingSections, setEditingSections] = useState(new Set());
  
  // Remove the global isEditing state
  // const [isEditing, setIsEditing] = useState(false);

  const [floatingInstance, setFloatingInstance] = useState(null);
  const previewRef = useRef(null);

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
      // console.log('Editing section:', updates, 'for section:', section); // Debug log
    
      setProfile(prevProfile => {
        const currentValue = prevProfile[section];
  
        // Handle array sections (skills, education, experience)
        if (Array.isArray(currentValue)) {
          if (section === 'skills') {
            const newSkills = [...currentValue];
            if (updates && updates.key === 'skill') {
              newSkills[updates.index] = updates.value;
            }
            return {
              ...prevProfile,
              [section]: newSkills
            };
          }
  
          // Handle other array sections (education, experience)
          const newArray = [...currentValue];
          if (updates && updates.index !== undefined && updates.key) {
            newArray[updates.index] = {
              ...newArray[updates.index],
              [updates.key]: updates.value
            };
          }
          return {
            ...prevProfile,
            [section]: newArray
          };
        }
  
        // Handle object sections (personal, metadata)
        if (typeof currentValue === 'object' && currentValue !== null) {
          return {
            ...prevProfile,
            [section]: {
              ...currentValue,
              [updates.key]: updates.value
            }
          };
        }
  
        // Handle primitive values (coverLetter)
        return {
          ...prevProfile,
          [section]: updates.value || currentValue
        };
      });
    };

  const handleSectionSave = () => {
    // Save to localStorage
    const updatedProfile = {
      ...profile,
      metadata: {
        ...profile.metadata,
        lastModified: getCurrentISOString()
      }
    };

    const currentUser = authService.getCurrentUser();
    const storedProfiles = JSON.parse(localStorage.getItem('userProfiles') || '{}');
    storedProfiles[currentUser.id] = storedProfiles[currentUser.id] || {};
    storedProfiles[currentUser.id][profile.id] = updatedProfile;

    localStorage.setItem('userProfiles', JSON.stringify(storedProfiles));
    localStorage.setItem('currentProfile', JSON.stringify(updatedProfile));

    window.dispatchEvent(new CustomEvent('profileUpdated', {
      detail: { profile: updatedProfile }
    }));
  };

  const handleDownloadPDF = () => {
    try {
      console.log('Starting PDF generation with profile:', profile);
      const doc = generatePDF(profile, 'resume');
      console.log('PDF generation result:', doc);
      
      if (!doc) {
        console.error('PDF generation failed - no document returned');
        return;
      }
      
      console.log('Saving PDF...');
      doc.save(`${profile.personal?.name || 'resume'}.pdf`);
      console.log('PDF saved successfully');
    } catch (error) {
      console.error('Error generating PDF:', error.message);
      console.error('Error stack:', error.stack);
    }
  };

  return (
    <article className="resume-display">
      <div className='grid'>
        <button onClick={handleAutoFill}>
          {typeof chrome === 'undefined' ? 'Toggle Auto Fill' : 'Auto Fill'}
        </button>
      </div>
      {Object.entries(LABELS.sections).map(([section, label]) => (
        <ResumeSection
          key={section}
          section={section}
          title={label}
          data={profile[section]}
          onEdit={handleSectionEdit}
          onSave={handleSectionSave}
        />
      ))}
      <div className='grid'>
        <button onClick={handleDownloadPDF}>Download PDF Resume</button>
      </div>
      <div className='grid'>
        <button>Download PDF Cover Letter</button>
      </div>

      <div ref={previewRef} className="resume-preview-container" style={{
        width: '100%',
        overflow: 'auto',
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: '#f5f5f5'
      }} />
    </article>
  );
};

export default Resume;