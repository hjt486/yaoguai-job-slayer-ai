import React, { useState, useEffect, useRef } from 'react';
import {
  DEFAULT_PROFILE_STRUCTURE,
  LABELS,
  TEXTAREA_FIELDS,
  DATE_TIME_FIELDS,
  DATE_FIELDS,
  NOT_EDITABLE_FIELDS,
  ARRAY_SECTIONS
} from '../common/Constants';
import { showFloatingPage } from '../autofill/AutoFill';
import { authService } from '../../services/authService';
import { formatDateTime, formatDate, getCurrentISOString } from '../common/dateUtils';
import { generatePDF, downloadStoredPDF } from '../common/pdfUtils';
import { LoadingButton } from '../common/LoadingButton';
import moment from 'moment';

const ResumeSection = ({ title, data, section, onEdit, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState(null);

  const handleEdit = () => {
    setOriginalData(JSON.parse(JSON.stringify(data))); // Deep copy of current data
    setIsEditing(true);
  };

  const handleCancel = () => {
    onEdit(section, { action: 'restore', value: originalData });
    setIsEditing(false);
  };

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
      return <small className={shouldUseTextarea(key, value) ? 'pre-wrap' : 'normal-wrap'}>
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
          className="auto-resize-textarea"
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
                  <div className="skill-edit-container">
                    <input
                      type="text"
                      value={skill || ''}
                      onChange={(e) => onEdit(section, {
                        key: 'skill',
                        value: e.target.value,
                        index
                      })}
                    />
                    <button
                      className="button-small delete-button"
                      onClick={() => onEdit(section, { action: 'delete', index })}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <span>{skill}</span>
                )}
              </div>
            ))}
            {isEditing && (
              <button
                className="button-small add-button"
                onClick={() => onEdit(section, { action: 'add' })}
              >
                Add Skill
              </button>
            )}
          </div>
        );
      }

      return (
        <>
          {data.map((item, index) => (
            <div key={index} className="section-item">
              {isEditing && (
                <button
                  className="button-small delete-button section-delete"
                  onClick={() => onEdit(section, { action: 'delete', index })}
                >
                  ×
                </button>
              )}
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
          ))}
          {isEditing && ARRAY_SECTIONS.includes(section) && (
            <button
              className="button-small add-button"
              onClick={() => onEdit(section, { action: 'add' })}
            >
              Add {title}
            </button>
          )}
        </>
      );
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
          onChange={(e) => onEdit(section, {
            value: e.target.value,
            key: section
          })}
          className={title === LABELS.sections.coverLetter ? 'cover-letter-textarea' : 'normal-textarea'}
          ref={(element) => {
            if (element) {
              element.style.height = 'auto';
              element.style.height = `${element.scrollHeight}px`;
            }
          }}
        />
      ) : (
        <p className="pre-wrap">{data}</p>
      );
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    onSave();
  };

  return (
    <section className="resume-section">
      <div className="section-header">
        <h3>{title}</h3>
        {!isEditing && (
          <button
            className="outline button-small"
            onClick={handleEdit}
          >
            {LABELS.actions.edit}
          </button>
        )}
      </div>
      <div className="section-content">
        {renderContent()}
      </div>
      {isEditing && (
        <div className="section-footer">
          <div role="group">
            <button
              className="button-full button-small"
              onClick={handleSave}
            >
              {LABELS.actions.save}
            </button>
            <button
              className="button-small outline"
              onClick={handleCancel}
            >
              {LABELS.actions.cancel}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

const Resume = () => {
  const [profile, setProfile] = useState(DEFAULT_PROFILE_STRUCTURE);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  // Add new state to track current profile's PDF status
  useEffect(() => {
    // Check if current profile has generated PDF
    const profileId = profile.id;
    const pdfData = localStorage.getItem(`generatedPDF_${profileId}`);
    setPdfGenerated(!!pdfData);
  }, [profile]);

  const [editingSections, setEditingSections] = useState(new Set());
  const [floatingInstance, setFloatingInstance] = useState(null);
  const previewRef = useRef(null);

  // Remove duplicate declarations
  // const [floatingInstance, setFloatingInstance] = useState(null);
  // const previewRef = useRef(null);

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
      if (updates.action === 'restore') {
        return {
          ...prevProfile,
          [section]: updates.value
        };
      }

      const currentValue = prevProfile[section];

      if (Array.isArray(currentValue)) {
        if (section === 'skills') {
          const newSkills = [...currentValue];
          if (updates.action === 'delete') {
            newSkills.splice(updates.index, 1);
          } else if (updates.action === 'add') {
            newSkills.push('');
          } else if (updates.key === 'skill') {
            newSkills[updates.index] = updates.value;
          }
          return {
            ...prevProfile,
            [section]: newSkills
          };
        }

        // Handle array sections (education, experience, achievements, projects)
        const newArray = [...currentValue];

        if (updates.action === 'delete') {
          newArray.splice(updates.index, 1);
        } else if (updates.action === 'add') {
          const defaultItem = DEFAULT_PROFILE_STRUCTURE[section][0];
          newArray.push({ ...defaultItem });
        } else if (updates.key) {
          newArray[updates.index] = {
            ...newArray[updates.index],
            [updates.key]: updates.value
          };
        }

        return {
          ...prevProfile,
          [section]: newArray
        };
      } else if (typeof currentValue === 'object' && currentValue !== null) {
        // Handle object sections (like personal information)
        return {
          ...prevProfile,
          [section]: {
            ...currentValue,
            [updates.key]: updates.value
          }
        };
      } else {
        // Handle primitive values
        return {
          ...prevProfile,
          [section]: updates.value || currentValue
        };
      }
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

  const handlePreviewResume = async () => {
    try {
      await generatePDF(profile);
      if (previewRef.current) {
        previewRef.current.innerHTML = showResumePreview();
      }
    } catch (error) {
      console.error('Error generating preview:', error);
    }
  };

  const handleGeneratePDF = async () => {
    setPdfGenerated(false);
    const fileName = `${profile.personal?.fullName || 'Resume'}_${profile.metadata?.targetRole || ''}_${profile.metadata?.targetCompany || ''}_${moment().local().format('YYYY-MM-DD_HH_mm_ss')}.pdf`.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');

    const success = await generatePDF(profile, fileName, profile.id);
    setPdfGenerated(success);
    return success;
  };

  const handleDownloadPDF = (e) => {
    e.preventDefault();
    downloadStoredPDF(profile.id); // Pass profile.id to downloadStoredPDF
  };

  // Add useEffect to load preview on mount and profile changes
  useEffect(() => {
    if (previewRef.current) {
      previewRef.current.innerHTML = showResumePreview();
    }
  }, [profile]);

  // Update the buttons grid to include preview button
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
      <div className='grid-vertical'>
        <LoadingButton
          onClick={handleGeneratePDF}
          className="primary-button"
          loadingText="Generating PDF..."
        >
          Generate PDF Resume
        </LoadingButton>

        {pdfGenerated && (
          <>
            <small className="text-center text-muted">
              {localStorage.getItem(`pdfFileName_${profile.id}`) || 'resume.pdf'}
            </small>
            <a
              href="#"
              onClick={handleDownloadPDF}
              className="download-link"
            >
              Download PDF Resume
            </a>
          </>
        )}
      </div>

      <div className='grid'>
        <button>Download PDF Cover Letter</button>
      </div>
    </article>
  );
};

export default Resume;