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
import { showFloatingPage } from '../autofill/Autofill';
import { authService } from '../../services/authService';
import { formatDateTime, formatDate, getCurrentISOString } from '../common/dateUtils';
import { generatePDF, downloadStoredPDF } from '../common/pdfUtils';
import { LoadingButton } from '../common/LoadingButton';
import moment from 'moment';

// Update ResumeSection component
const ResumeSection = ({ title, data, section, profile, onEdit, onSave }) => {
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
    if (key === 'resumeName') {
      const resumeKey = `resume_${profile.id}`;
      const storedResume = JSON.parse(localStorage.getItem(resumeKey));
      if (storedResume) {
        return (
          <a href="#" onClick={(e) => {
            e.preventDefault();
            handleDownloadLoadedResume(profile.id);
          }}
            style={{ textDecoration: 'underline' }}
          >
            {value || storedResume.name}
          </a>
        );
      }
      return <small>{value || 'No resume uploaded'}</small>;
    }
    if (DATE_TIME_FIELDS.includes(key)) {
      return formatDateTime(value);
    }
    if (DATE_FIELDS.includes(key)) {
      return formatDate(value);
    }
    return value;
  };

  // Update download handler
  const handleDownloadLoadedResume = (profileId) => {
    const resumeKey = `resume_${profileId}`;
    const storedResume = JSON.parse(localStorage.getItem(resumeKey));
    if (!storedResume) {
      console.error('No resume file found for this profile');
      return;
    }

    const link = document.createElement('a');
    link.href = storedResume.content;
    link.download = storedResume.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  // Update field label references in renderContent
  const renderContent = () => {
    if (Array.isArray(data)) {
      if (section === 'skills') {  // Changed from comparing title
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
                  <strong>{LABELS.sections[section]?.fields[key] || key}: </strong>
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
              Add {LABELS.sections[section].name}
            </button>
          )}
        </>
      );
    } else if (typeof data === 'object' && data !== null) {
      return Object.entries(data).map(([key, value]) => (
        <div key={key} className="field-item">
          <strong>{LABELS.sections[section]?.fields[key] || key}: </strong>
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
        <h3>{LABELS.sections[section].name}</h3>
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
  const [profile, setProfile] = useState(null);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [coverLetterGenerated, setCoverLetterGenerated] = useState(false);
  const [editingSections, setEditingSections] = useState(new Set());
  const [floatingInstance, setFloatingInstance] = useState(null);
  const previewRef = useRef(null);

  // Combined useEffect for profile loading and PDF status
  useEffect(() => {
    // In the loadCurrentProfile function within useEffect
    const loadCurrentProfile = () => {
      const currentUser = authService.getCurrentUser();
      const savedProfile = localStorage.getItem('currentProfile');

      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        const storedProfiles = JSON.parse(localStorage.getItem('userProfiles') || '{}');

        // Check if the currentUser exists and the profile belongs to them
        if (!currentUser || !storedProfiles[currentUser.id]?.[parsedProfile.id]) {
          localStorage.removeItem('currentProfile');
          setProfile(null);
          setPdfGenerated(false);
          setCoverLetterGenerated(false);
          return;
        }

        setProfile(parsedProfile);
        // Check PDF statuses
        const pdfData = localStorage.getItem(`generatedPDF_${parsedProfile.id}`);
        const coverLetterData = localStorage.getItem(`generatedPDF_${parsedProfile.id}_coverLetter`);
        setPdfGenerated(!!pdfData);
        setCoverLetterGenerated(!!coverLetterData);
      } else {
        setProfile(null);
        setPdfGenerated(false);
        setCoverLetterGenerated(false);
      }
    };

    loadCurrentProfile();

    const handleProfileChange = (e) => {
      const newProfile = e.detail.profile;
      setProfile(newProfile);

      if (newProfile) {
        const pdfData = localStorage.getItem(`generatedPDF_${newProfile.id}`);
        const coverLetterData = localStorage.getItem(`generatedPDF_${newProfile.id}_coverLetter`);
        setPdfGenerated(!!pdfData);
        setCoverLetterGenerated(!!coverLetterData);
      }
    };

    // Add event listener for authentication changes
    const handleAuthChange = () => {
      loadCurrentProfile();
    };

    window.addEventListener('profileLoaded', handleProfileChange);
    window.addEventListener('storage', loadCurrentProfile);
    authService.subscribe(handleAuthChange); // Assuming authService provides a subscribe method

    return () => {
      window.removeEventListener('profileLoaded', handleProfileChange);
      window.removeEventListener('storage', loadCurrentProfile);
      authService.unsubscribe(handleAuthChange);
    };
  }, []);

  // Preview effect - keep only this one, remove the duplicate at the bottom
  useEffect(() => {
    if (previewRef.current && profile) {
      previewRef.current.innerHTML = showResumePreview();
    }
  }, [profile]);

  if (!profile) {
    return (
      <article style={{ textAlign: 'center', padding: '2rem' }}>
        <h3>Please create a profile</h3>
      </article>
    );
  }

  const handleAutofill = async () => {
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

        // Try to check if content script is already running
        try {
          const isAlive = await chrome.tabs.sendMessage(tab.id, { action: 'ping' });
          if (!isAlive) {
            throw new Error('Content script not responding');
          }
        } catch (err) {
          // Only inject if the content script isn't already there
          console.log('[YaoguaiAI] Injecting content script...');
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          });
        }

        // Send message to open floating page
        console.log('[YaoguaiAI] Sending message to tab:', tab.id);
        await chrome.tabs.sendMessage(tab.id, {
          action: 'openFloatingPage',
          source: 'popup'
        });
        window.close();
      } catch (error) {
        console.error('[YaoguaiAI] Error in handleAutofill:', error);
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

  const handleGeneratePDF = async () => {
    setPdfGenerated(false);
    const fileName = `${profile.personal?.fullName || 'Resume'}_${profile.metadata?.targetRole || ''}_${profile.metadata?.targetCompany || ''}_${moment().local().format('YYYY-MM-DD_HH_mm_ss')}_resume`.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');

    const success = await generatePDF(profile, fileName, profile.id, false);
    setPdfGenerated(success);
    return success;
  };

  const handleDownloadPDF = (e) => {
    e.preventDefault();
    downloadStoredPDF(profile.id);
  };

  const handleGenerateCoverLetter = async () => {
    setCoverLetterGenerated(false);
    const fileName = `${profile.personal?.fullName || 'Cover_Letter'}_${profile.metadata?.targetRole || ''}_${profile.metadata?.targetCompany || ''}_${moment().local().format('YYYY-MM-DD_HH_mm_ss')}_cover_letter`.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');

    const success = await generatePDF(profile, fileName, profile.id, true);
    if (success) {
      localStorage.setItem(`coverLetterFileName_${profile.id}`, fileName);
      localStorage.setItem(`generatedPDF_${profile.id}_coverLetter`, 'true');
      setCoverLetterGenerated(true);
    }
    return success;
  };

  const handleDownloadCoverLetter = (e) => {
    e.preventDefault();
    downloadStoredPDF(profile.id, true);
  };

  // Update the buttons grid to include preview button
  return (
    <article className="resume-display">
      <div className='grid'>
        <button onClick={handleAutofill}>
          {typeof chrome === 'undefined' ? 'Toggle Auto Fill' : 'Auto Fill'}
        </button>
      </div>
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

      <div className='grid-vertical'>
        <div className='grid-vertical'>
          <LoadingButton
            onClick={handleGenerateCoverLetter}
            className="primary-button"
            loadingText="Generating Cover Letter..."
          >
            Generate PDF Cover Letter
          </LoadingButton>

          {coverLetterGenerated && (
            <>
              <small className="text-center text-muted">
                {localStorage.getItem(`coverLetterFileName_${profile.id}`)}
              </small>
              <a
                href="#"
                onClick={handleDownloadCoverLetter}
                className="download-link"
              >
                Download PDF Cover Letter
              </a>
            </>
          )}
        </div>
      </div>
      {Object.entries(LABELS.sections).map(([section, label]) => (
        <ResumeSection
          key={section}
          section={section}
          title={label}
          data={profile[section]}
          profile={profile}
          onEdit={handleSectionEdit}
          onSave={handleSectionSave}
        />
      ))}
    </article>
  );
};

export default Resume;