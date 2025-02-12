import React, { useState, useEffect, useRef } from 'react';
import {
  DEFAULT_PROFILE_STRUCTURE,
  LABELS,
  TEXTAREA_FIELDS,
  DATE_TIME_FIELDS,
  DATE_FIELDS,
  NOT_EDITABLE_FIELDS,
  ARRAY_SECTIONS,
  BOOLEAN_FIELDS,
  APPLICATION_ONLY_SECTIONS
} from '../common/Constants';
import { showFloatingPage } from '../autofill/AutoFill';
import { authService } from '../../services/authService';
import { formatDateTime, formatDate, getCurrentISOString } from '../common/dateUtils';
import { generatePDF, downloadStoredPDF } from '../common/pdfUtils';
import { LoadingButton } from '../common/LoadingButton';
import moment from 'moment';
import { storageService } from '../../services/storageService';

// Update ResumeSection component
export const ResumeSection = ({ title, data, section, profile, onEdit, onSave, hideEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState(null);

  const handleEdit = () => {
    // Initialize empty section if it doesn't exist
    const currentData = data || (
      ARRAY_SECTIONS.includes(section) 
        ? [] 
        : (DEFAULT_PROFILE_STRUCTURE[section] || {})
    );
    setOriginalData(JSON.parse(JSON.stringify(currentData)));
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
    if (key === 'jobDescription') {
      const words = value?.split(' ') || [];
      const truncatedText = words.slice(0, 50).join(' ') + (words.length > 100 ? ' ...' : '');
      return <small className="pre-wrap">{truncatedText}</small>;

    }
    if (key === 'resumeName') {
      const resumeKey = `resume_${profile.id}`;
      const storedResume = JSON.parse(storageService.get(resumeKey));
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
    const storedResume = JSON.parse(storageService.get(resumeKey));
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


    if (BOOLEAN_FIELDS.includes(key)) {
      return (
        <select
          value={value || ''}
          onChange={(e) => onEdit(section, {
            key,
            value: e.target.value,
            index
          })}
        >
          <option value="">Select...</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      );
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
    const handleCopy = (value, event) => {
      if (!isEditing && value) {
        // Get the formatted text that's displayed
        const formattedValue = event.currentTarget.textContent;
        navigator.clipboard.writeText(formattedValue);

        const target = event.currentTarget;
        const originalTooltip = target.getAttribute('data-tooltip');

        target.setAttribute('data-tooltip', 'Copied!');
        setTimeout(() => {
          target.setAttribute('data-tooltip', originalTooltip || 'Click to copy');
        }, 1000);
      }
    };

    // Update click handlers to pass the event
    if (Array.isArray(data)) {
      if (section === 'skills') {
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
                  <span
                    onClick={(e) => handleCopy(skill, e)}
                    style={{ cursor: 'pointer' }}
                    data-tooltip="Click to copy"
                  >
                    {skill}
                  </span>
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
                    // In the renderContent function, update the span elements
                    <span
                      onClick={(e) => handleCopy(value, e)}
                      style={{
                        whiteSpace: shouldUseTextarea(key, value) ? 'pre-wrap' : 'normal',
                        cursor: 'pointer',
                        textDecoration: 'none'  // Add this line
                      }}
                      data-tooltip="Click to copy"
                    >
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
            <span
              onClick={(e) => handleCopy(value, e)}  // Add event parameter here
              style={{
                whiteSpace: shouldUseTextarea(key, value) ? 'pre-wrap' : 'normal',
                cursor: 'pointer'
              }}
            >
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
        <p
          className="pre-wrap"
          onClick={(e) => handleCopy(data, e)}
          style={{ cursor: 'pointer' }}
          data-tooltip="Click to copy"
        >
          {data}
        </p>
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
        {!isEditing && !hideEdit && (
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
    const loadCurrentProfile = () => {
      const savedProfile = storageService.get('currentProfile');

      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setProfile(parsedProfile);

        // Check PDF statuses
        const resumePDF = storageService.get(`resumePDF_${parsedProfile.id}`);
        const coverLetterPDF = storageService.get(`coverLetter_${parsedProfile.id}`);

        setPdfGenerated(!!resumePDF);
        setCoverLetterGenerated(!!coverLetterPDF);
      } else {
        setProfile(null);
        setPdfGenerated(false);
        setCoverLetterGenerated(false);
      }
    };

    const handleProfileChange = (e) => {
      const newProfile = e.detail.profile;
      setProfile(newProfile);

      if (newProfile) {
        const resumePDF = storageService.get(`resumePDF_${newProfile.id}`);
        const coverLetterPDF = storageService.get(`coverLetter_${newProfile.id}`);

        setPdfGenerated(!!resumePDF);
        setCoverLetterGenerated(!!coverLetterPDF);
      } else {
        setPdfGenerated(false);
        setCoverLetterGenerated(false);
      }
    };

    loadCurrentProfile();

    // Event listeners
    window.addEventListener('profileLoaded', handleProfileChange);
    storageService.addChangeListener(loadCurrentProfile);
    authService.subscribe(loadCurrentProfile);

    return () => {
      window.removeEventListener('profileLoaded', handleProfileChange);
      storageService.removeChangeListener(loadCurrentProfile);
      authService.unsubscribe(loadCurrentProfile);
    };
  }, []);

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

        // Try to check if content script is already running and toggle the floating page
        try {
          const response = await chrome.tabs.sendMessage(tab.id, { action: 'ping' });
          if (response.alive) {
            // If alive, send toggle message
            await chrome.tabs.sendMessage(tab.id, {
              action: 'toggleFloatingPage',
              source: 'popup'
            });
          } else {
            throw new Error('Content script not responding');
          }
        } catch (err) {
          // Inject content script and open floating page
          console.log('[YaoguaiAI] Injecting content script...');
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          });
          await chrome.tabs.sendMessage(tab.id, {
            action: 'openFloatingPage',
            source: 'popup'
          });
        }
        window.close();
      } catch (error) {
        console.error('[YaoguaiAI] Error in handleAutofill:', error);
      }
    } else {
      // DEV mode: toggle floating page
      if (!floatingInstance) {
        console.log('Mounting floating page in DEV mode');
        const instance = showFloatingPage(() => {
          setFloatingInstance(null);
        });
        setFloatingInstance(instance);
      } else {
        console.log('Unmounting floating page in DEV mode');
        if (document.body.contains(floatingInstance)) {
          floatingInstance.remove();
        }
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

  const handleSectionSave = async () => {
    try {
      // Save to localStorage
      const updatedProfile = {
        ...profile,
        metadata: {
          ...profile.metadata,
          lastModified: getCurrentISOString()
        }
      };

      const currentUser = await authService.getCurrentUser();
      if (!currentUser?.id) {
        throw new Error('User not logged in');
      }

      // Update in userProfiles
      const storedProfiles = JSON.parse(await storageService.getAsync('userProfiles') || '{}');
      if (!storedProfiles[currentUser.id]) {
        storedProfiles[currentUser.id] = {};
      }
      storedProfiles[currentUser.id][profile.id] = updatedProfile;

      // Save all updates
      await Promise.all([
        storageService.setAsync('userProfiles', JSON.stringify(storedProfiles)),
        storageService.setAsync('currentProfile', JSON.stringify(updatedProfile)),
        storageService.setAsync(`lastLoadedProfile_${currentUser.id}`, profile.id.toString())
      ]);

      // Update local state
      setProfile(updatedProfile);

      // Dispatch events for other components
      window.dispatchEvent(new CustomEvent('profileUpdated', {
        detail: { profile: updatedProfile }
      }));
      window.dispatchEvent(new CustomEvent('profileLoaded', {
        detail: { profile: updatedProfile }
      }));
    } catch (error) {
      console.error('Error saving profile:', error);
      // Optionally handle error state
    }
  };

  const handleGeneratePDF = async () => {
    setPdfGenerated(false);
    const fileName = `${profile.personal?.firstName + ' ' + profile.personal?.lastName || 'Resume'}_${profile.metadata?.targetRole || ''}_${profile.metadata?.targetCompany || ''}_${moment().local().format('YYYY-MM-DD_HH_mm_ss')}_resume`.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');

    // Clear old PDF data before generating new one
    storageService.remove(`generatedPDF_${profile.id}`);
    storageService.remove(`pdfFileName_${profile.id}`);
    storageService.remove(`pdfTimestamp_${profile.id}`);

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
    const fileName = `${profile.personal?.firstName + " " + profile.personal?.lastName || 'Cover_Letter'}_${profile.metadata?.targetRole || ''}_${profile.metadata?.targetCompany || ''}_${moment().local().format('YYYY-MM-DD_HH_mm_ss')}_cover_letter`.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');

    // Only clear cover letter related data
    storageService.remove(`coverLetter_${profile.id}`);
    storageService.remove(`coverLetterFileName_${profile.id}`);
    storageService.remove(`coverLetterGenerated_${profile.id}`);

    const success = await generatePDF(profile, fileName, profile.id, true);
    if (success) {
      // Store both the file name and the generation status
      storageService.set(`coverLetterFileName_${profile.id}`, fileName);
      storageService.set(`coverLetterGenerated_${profile.id}`, 'true');
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
              {storageService.get(`resumeFileName_${profile.id}`) || 'resume.pdf'}
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
                {storageService.get(`coverLetterFileName_${profile.id}`) || 'cover_letter.pdf'}
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
      {Object.entries(LABELS.sections)
        .filter(([section]) => !APPLICATION_ONLY_SECTIONS.includes(section))
        .map(([section, label]) => (
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

      <h3 className="application-info-header">Application Information</h3>
      {Object.entries(LABELS.sections)
        .filter(([section]) => APPLICATION_ONLY_SECTIONS.includes(section))
        .map(([section, label]) => (
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