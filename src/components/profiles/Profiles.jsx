import { useState, useEffect, useRef } from 'react';
import { DEFAULT_PROFILE_STRUCTURE, AI_PROMPTS, AI_CONFIG } from '../common/Constants';
import { authService } from '../../services/authService';
import { LoadingButton } from '../common/LoadingButton';
import { parseDocument } from '../common/DocumentParser';
import { aiService } from '../common/aiService';
import { formatDateTime, getCurrentISOString } from '../common/dateUtils';
import { storageService } from '../../services/storageService';
import Modal from '../common/Modal';
import React from 'react';

const Profiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [resumeName, setResumeName] = useState('');
  const [error, setError] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [currentProfileId, setCurrentProfileId] = useState(null);
  const [pastedResume, setPastedResume] = useState('');
  const [showPasteDialog, setShowPasteDialog] = useState(false);
  const fileInputRef = useRef(null);
  const [importError, setImportError] = useState('');
  const importFileRef = useRef(null);

  const allowedFileTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/x-tex',
    'text/plain'
  ];

  // Add handleFileSelect function
  const handleFileSelect = () => {
    fileInputRef.current.click();
  };

  // Add import handler functions
  const handleImportClick = () => {
    importFileRef.current.click();
  };

  const handleImportProfile = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importedProfile = JSON.parse(text);

      // Validate imported profile structure
      if (!importedProfile.id || !importedProfile.metadata) {
        throw new Error('Invalid profile format');
      }

      const currentUser = await authService.getCurrentUser();
      if (!currentUser?.id) {
        throw new Error('No user logged in');
      }

      const storedProfiles = JSON.parse(await storageService.getAsync('userProfiles') || '{}');
      if (!storedProfiles[currentUser.id]) {
        storedProfiles[currentUser.id] = {};
      }

      // Generate new ID for imported profile
      const existingIds = Object.keys(storedProfiles[currentUser.id]).map(Number);
      const nextId = Math.max(0, ...existingIds) + 1;

      // Create new profile with imported data
      const newProfile = {
        ...importedProfile,
        id: nextId,
        metadata: {
          ...importedProfile.metadata,
          profileName: `${importedProfile.metadata.profileName} (Imported)`,
          createdAt: getCurrentISOString(),
          lastModified: getCurrentISOString()
        }
      };

      // Save to localStorage
      storedProfiles[currentUser.id][nextId] = newProfile;
      await storageService.setAsync('userProfiles', JSON.stringify(storedProfiles));

      // Update UI
      await loadProfiles();
      await handleLoadProfile(newProfile);
      setImportError('');
    } catch (error) {
      console.error('Import error:', error);
      setImportError('Failed to import profile: ' + error.message);
    } finally {
      if (importFileRef.current) {
        importFileRef.current.value = '';
      }
    }
  };

  const handleExportProfile = async (profile) => {
    try {
      // Get associated files
      const [resumeData, pdfData] = await Promise.all([
        storageService.getAsync(`resume_${profile.id}`),
        storageService.getAsync(`generatedPDF_${profile.id}`)
      ]);

      // Create export data object
      const exportData = {
        ...profile,
        associatedFiles: {
          resume: resumeData ? JSON.parse(resumeData) : null,
          pdf: pdfData || null
        }
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${profile.metadata?.profileName || 'profile'}_${profile.id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      setError('Failed to export profile: ' + error.message);
    }
  };

  // Move loadProfiles before useEffect
  // Update loadProfiles to be async
  const loadProfiles = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      const storedProfiles = JSON.parse(await storageService.getAsync('userProfiles') || '{}');
      const userProfiles = storedProfiles[currentUser.id] || {};

      const profilesArray = Object.values(userProfiles).sort((a, b) => {
        if (a.id === 1) return -1;
        if (b.id === 1) return 1;
        return 0;
      });

      setProfiles(profilesArray);
    } catch (error) {
      console.error('Error loading profiles:', error);
      setError('Failed to load profiles');
    }
  };

  const handleCreateProfile = async () => {
    try {
      setError('');
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('No user logged in');
      }

      let storedProfiles;
      try {
        storedProfiles = JSON.parse(await storageService.getAsync('userProfiles') || '{}');
      } catch (e) {
        storedProfiles = {};
      }

      // Initialize user's profiles if not exists
      if (!storedProfiles[currentUser.id]) {
        storedProfiles[currentUser.id] = {};
      }

      const existingIds = Object.keys(storedProfiles[currentUser.id]).map(Number);
      const nextId = existingIds.length > 0 ? Math.max(0, ...existingIds) + 1 : 1;

      const newProfile = {
        id: nextId,
        ...DEFAULT_PROFILE_STRUCTURE,
        metadata: {
          ...DEFAULT_PROFILE_STRUCTURE.metadata,
          profileName: `Profile ${nextId}`,
          createdAt: getCurrentISOString(),
          lastModified: getCurrentISOString()
        }
      };

      // Save to localStorage first
      try {
        storedProfiles[currentUser.id][nextId] = newProfile;
        await storageService.setAsync('userProfiles', JSON.stringify(storedProfiles));

        // Update local state first
        setProfiles(prev => [...prev, newProfile]);

        // Then load the new profile
        await handleLoadProfile(newProfile);
      } catch (e) {
        throw new Error('Failed to save profile: ' + e.message);
      }

    } catch (error) {
      console.error('Error creating new profile:', error);
      setError(error.message || 'Failed to create new profile');
    }
  };

  // Add handler for input click
  const handleInputClick = () => {
    setShowPasteDialog(true);
  };

  // Add handler for paste dialog confirmation
  const handlePasteConfirm = () => {
    if (pastedResume.trim()) {
      setSelectedFile(null);
      setResumeName(pastedResume.split(' ').slice(0, 5).join(' ') + '...');
      setShowPasteDialog(false);
    }
  };

  useEffect(() => {
    const initializeProfiles = async () => {
      try {
        // Properly wait for user authentication status
        const currentUser = await authService.getCurrentUser();
        if (!currentUser) return;
        const storedProfiles = JSON.parse(await storageService.getAsync('userProfiles') || '{}');
        const [lastLoadedProfileId, currentProfile] = await Promise.all([
          storageService.getAsync(`lastLoadedProfile_${currentUser.id}`),
          storageService.getAsync('currentProfile')
        ]);

        // Prioritize currentProfile from storage if exists
        if (currentProfile) {
          const parsedProfile = JSON.parse(currentProfile);
          if (parsedProfile?.id) {
            await handleLoadProfile(parsedProfile);
            return;
          }
        }

        // Clear all user-specific data if no profiles exist for this user
        if (!storedProfiles[currentUser.id]) {
          await storageService.removeAsync('currentProfile');
          setCurrentProfileId(null);
          setSelectedFile(null);
          setResumeName('');
          setPastedResume('');
        } else if (lastLoadedProfileId && storedProfiles[currentUser.id][lastLoadedProfileId]) {
          await handleLoadProfile(storedProfiles[currentUser.id][lastLoadedProfileId]);
        } else {
          const firstProfile = Object.values(storedProfiles[currentUser.id])[0];
          if (firstProfile) {
            await handleLoadProfile(firstProfile);
          }
        }

        await loadProfiles();
      } catch (error) {
        console.error('Error initializing profiles:', error);
        setError('Failed to load profiles');
      }
    };

    initializeProfiles();

    const handleProfileUpdate = async (e) => {
      // console.log('Profile update received:', e.detail.profile);
      await loadProfiles();
      setCurrentProfileId(e.detail.profile.id);
    };

    const handleStorageChange = async () => {
      try {
        await loadProfiles();
        const updatedProfile = JSON.parse(await storageService.getAsync('currentProfile'));
        if (updatedProfile) {
          setCurrentProfileId(updatedProfile.id);
        }
      } catch (error) {
        console.error('Error handling storage change:', error);
      }
    };

    window.addEventListener('profileLoaded', handleProfileUpdate);
    storageService.addChangeListener(handleStorageChange);

    return () => {
      window.removeEventListener('profileLoaded', handleProfileUpdate);
      storageService.removeChangeListener(handleStorageChange);
    };
  }, []);


  // Modify handleFileChange
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file && allowedFileTypes.includes(file.type)) {
      setSelectedFile(file);
      setResumeName(file.name);
      setPastedResume(''); // Clear any pasted resume
      setError('');
    } else {
      setSelectedFile(null);
      setResumeName('');
      setPastedResume('');
      setError('Please select a valid file (PDF, DOC, DOCX, TEX, or TXT)');
    }
  };


  const handleDeleteProfile = async (id) => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser?.id) {
        throw new Error('No user logged in');
      }

      const storedProfiles = JSON.parse(await storageService.getAsync('userProfiles') || '{}');
      if (!storedProfiles[currentUser.id]?.[id]) {
        throw new Error('Profile not found');
      }

      // Remove profile from userProfiles
      delete storedProfiles[currentUser.id][id];
      await storageService.setAsync('userProfiles', JSON.stringify(storedProfiles));

      // Remove associated data in parallel
      await Promise.all([
        storageService.removeAsync(`resume_${id}`),
        storageService.removeAsync(`generatedPDF_${id}`),
        storageService.removeAsync(`pdfFileName_${id}`),
        storageService.removeAsync(`coverLetter_${id}`),
        storageService.removeAsync(`coverLetterFileName_${id}`)
      ]);

      // Handle current profile updates
      const currentProfile = JSON.parse(await storageService.getAsync('currentProfile'));
      if (currentProfile?.id === id) {
        const remainingProfiles = Object.values(storedProfiles[currentUser.id]);
        if (remainingProfiles.length > 0) {
          const nextProfile = remainingProfiles[0];
          await handleLoadProfile(nextProfile);
        } else {
          await storageService.removeAsync('currentProfile');
          setCurrentProfileId(null);
          setSelectedFile(null);
          setResumeName('');
        }
      }

      await loadProfiles();
    } catch (error) {
      console.error('Error deleting profile:', error);
      setError(error.message || 'Failed to delete profile');
    }
  };

  // Update handleParse to handle profile updates
  const handleParse = async () => {
    if (!selectedFile && !pastedResume) return;
    setIsParsing(true);
    setError('');

    try {
      const currentUser = await authService.getCurrentUser();
      const apiSettings = await authService.getUserApiSettings(currentUser.id);

      console.log("apiSettings", apiSettings)
      if (!apiSettings) {
        throw new Error('Please configure API settings first');
      }

      let parsedContent;
      if (selectedFile) {
        const parsedDoc = await parseDocument(selectedFile);
        parsedContent = parsedDoc.content;
      } else {
        parsedContent = pastedResume;
      }

      const aiResponse = await aiService.parseResume(apiSettings, parsedContent);

      // Extract JSON from AI response
      const content = aiResponse.choices[0].message.content;
      let resumeData;
      try {
        // First try to parse the content directly as JSON
        resumeData = JSON.parse(content);
      } catch (e) {
        // If direct parsing fails, try to extract JSON from markdown code blocks
        const jsonMatch = content.match(/```(?:json)?\n?([\s\S]*?)(?:\n```|$)/);
        if (!jsonMatch) {
          // If no code blocks found, try to find JSON-like content
          const jsonStart = content.indexOf('{');
          const jsonEnd = content.lastIndexOf('}');
          if (jsonStart === -1 || jsonEnd === -1) {
            throw new Error('Could not extract JSON from AI response');
          }
          try {
            resumeData = JSON.parse(content.slice(jsonStart, jsonEnd + 1));
          } catch (e) {
            console.error('JSON parse error:', content);
            throw new Error('Failed to parse AI response into valid JSON');
          }
        } else {
          try {
            resumeData = JSON.parse(jsonMatch[1]);
          } catch (e) {
            console.error('JSON parse error:', jsonMatch[1]);
            throw new Error('Failed to parse AI response into valid JSON');
          }
        }
      }

      // Find the next available ID
      const storedProfiles = JSON.parse(await storageService.getAsync('userProfiles') || '{}');
      if (!storedProfiles[currentUser.id]) {
        storedProfiles[currentUser.id] = {};
      }
      const existingIds = Object.keys(storedProfiles[currentUser.id]).map(Number);
      const nextId = Math.max(0, ...existingIds) + 1;

      // Create new profile with parsed data
      const newProfile = {
        id: nextId,
        ...DEFAULT_PROFILE_STRUCTURE,
        ...resumeData,
        metadata: {
          ...DEFAULT_PROFILE_STRUCTURE.metadata,
          ...resumeData.metadata,
          profileName: `Profile ${nextId}`,
          createdAt: getCurrentISOString(),
          lastModified: getCurrentISOString(),
          resumeName: resumeName
        }
      };

      // Save the resume file if it exists
      if (selectedFile) {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64File = reader.result;
          const resumeFileData = {
            name: selectedFile.name,
            type: selectedFile.type,
            content: base64File,
            timestamp: new Date().toISOString(),
            profileId: newProfile.id
          };
          await storageService.setAsync(`resume_${newProfile.id}`, JSON.stringify(resumeFileData));
        };
        reader.readAsDataURL(selectedFile);
      } else if (pastedResume) {
        const blob = new Blob([pastedResume], { type: 'text/plain' });
        const reader = new FileReader();
        reader.onload = async () => {
          const resumeFileData = {
            name: 'pasted_resume.txt',
            type: 'text/plain',
            content: reader.result,
            timestamp: new Date().toISOString(),
            profileId: newProfile.id
          };
          await storageService.setAsync(`resume_${newProfile.id}`, JSON.stringify(resumeFileData));
        };
        reader.readAsDataURL(blob);
      }

      // Update localStorage and state
      storedProfiles[currentUser.id][nextId] = newProfile;
      await storageService.setAsync('userProfiles', JSON.stringify(storedProfiles));

      // Update local state and load profile
      setProfiles(prev => [...prev, newProfile]);

      // Ensure the profile is saved before loading it
      await new Promise(resolve => setTimeout(resolve, 100));
      await handleLoadProfile(newProfile);
    } catch (err) {
      console.error('Parse error:', err);
      setError(err.message);
    } finally {
      setIsParsing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Add function to handle setting current profile
  const handleLoadProfile = async (profile) => {
    try {
      const currentUser = await authService.getCurrentUser();
      const storedProfiles = JSON.parse(await storageService.getAsync('userProfiles') || '{}');

      if (!storedProfiles[currentUser?.id]?.[profile.id]) {
        setError('Profile not found');
        return;
      }

      // Save current profile
      await Promise.all([
        storageService.setAsync('currentProfile', JSON.stringify(profile)),
        storageService.setAsync(`lastLoadedProfile_${currentUser.id}`, profile.id)
      ]);

      setCurrentProfileId(profile.id);
      window.dispatchEvent(new CustomEvent('profileLoaded', {
        detail: { profile }
      }));
      setError('');
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile');
    }
  };

  const handleCopyProfile = async (profileToCopy) => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser?.id) {
        throw new Error('No user logged in');
      }

      const storedProfiles = JSON.parse(await storageService.getAsync('userProfiles') || '{}');
      if (!storedProfiles[currentUser.id]) {
        storedProfiles[currentUser.id] = {};
      }

      // Copy associated files first
      const resumeData = await storageService.getAsync(`resume_${profileToCopy.id}`);
      const pdfData = await storageService.getAsync(`generatedPDF_${profileToCopy.id}`);
      const pdfFileName = await storageService.getAsync(`pdfFileName_${profileToCopy.id}`);

      const existingIds = Object.keys(storedProfiles[currentUser.id]).map(Number);
      const nextId = Math.max(0, ...existingIds) + 1;

      const newProfile = {
        ...profileToCopy,
        id: nextId,
        metadata: {
          ...profileToCopy.metadata,
          profileName: `${profileToCopy.metadata?.profileName || 'Profile'} (Copy)`,
          createdAt: getCurrentISOString(),
          lastModified: getCurrentISOString()
        }
      };

      // Save the new profile
      storedProfiles[currentUser.id][nextId] = newProfile;
      await storageService.setAsync('userProfiles', JSON.stringify(storedProfiles));

      // Copy associated files with new ID
      if (resumeData) await storageService.setAsync(`resume_${nextId}`, resumeData);
      if (pdfData) await storageService.setAsync(`generatedPDF_${nextId}`, pdfData);
      if (pdfFileName) await storageService.setAsync(`pdfFileName_${nextId}`, pdfFileName);

      // Update UI
      await loadProfiles();
      await handleLoadProfile(newProfile);
    } catch (error) {
      console.error('Error copying profile:', error);
      setError(error.message || 'Failed to copy profile');
    }
  };

  return (
    <article key="profiles-container">
      <div style={{ display: "flex" }}>
        <button type="button" style={{ flex: "1" }} onClick={handleFileSelect}>
          Load A Resume
        </button>
        <input
          name="resume_text"
          type="text"
          placeholder="or Paste A Resume"
          readOnly
          value={resumeName || ''}
          onClick={handleInputClick}
          style={{ cursor: 'pointer', flex: "1" }}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.tex,.txt"
          style={{ display: 'none', flex: "1" }}
          onChange={handleFileChange}
          data-testid="file-input"
        />
        <LoadingButton
          onClick={handleParse}
          disabled={!selectedFile && !pastedResume}
          loadingText=""
          timeout={60000}
        >
          Parse
        </LoadingButton>
        {error && <small style={{ color: 'red' }}>{error}</small>}
      </div>
      <div style={{ display: "flex" }}>
        <button style={{ flex: "1" }} onClick={handleImportClick}>Import A Profile</button>
        <input
          ref={importFileRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleImportProfile}
        />
        {importError && <small style={{ color: 'red' }}>{importError}</small>}
      </div>
      {showPasteDialog && (
        <dialog open>
          <article key="paste-dialog">
            <header>
              <h3>Paste Resume Text</h3>
            </header>
            <textarea
              value={pastedResume}
              onChange={(e) => setPastedResume(e.target.value)}
              rows={10}
              placeholder="Paste your resume text here..."
            />
            <footer>
              <div role="group">
                <button onClick={handlePasteConfirm}>Confirm</button>
                <button
                  className="secondary"
                  onClick={() => setShowPasteDialog(false)}
                >
                  Cancel
                </button>
              </div>
            </footer>
          </article>
        </dialog>
      )}

      {profiles.map(profile => (
        <article
          key={profile.id}
          className='grid-horizontal profile-grid'
          style={{
            border: profile.id === currentProfileId ? '1px solid var(--pico-primary-background)' : 'inherit',
            transition: 'background-color 0.2s ease'
          }}
        >
          <div className='tighter-layout'>
            <div><h3>{profile.metadata?.profileName || profile.profileName}</h3></div>
            <div><small>Target Role: {profile.metadata?.targetRole || profile.targetRole}</small></div>
            <div><small>Target Company: {profile.metadata?.targetCompany || profile.targetCompany}</small></div>
            {profile.personal && (
              <>
                <div><small>Email: {profile.personal.email}</small></div>
                <div><small>Phone: {profile.personal.phone}</small></div>
              </>
            )}
            <strong>
              <small>
                Last modified: {formatDateTime(profile.metadata?.lastModified || profile.lastModified)}
              </small>
            </strong>
          </div>
          <div className='grid-vertical'>
            <button
              className='button-full'
              onClick={() => handleLoadProfile(profile)}
              disabled={profile.id === currentProfileId}
            >
              {profile.id === currentProfileId ? 'Loaded' : 'Load'}
            </button>
            <button
              className='button-full'
              onClick={() => handleCopyProfile(profile)}
            >
              Copy
            </button>
            <button
              className='button-full'
              onClick={() => handleDeleteProfile(profile.id)}
            >
              Delete
            </button>
            <button
              className='button-full'
              onClick={() => handleExportProfile(profile)}
            >
              Export
            </button>
          </div>
        </article>
      ))}

      <div className='grid'>
        <button onClick={handleCreateProfile}>Add New Profile</button>
      </div>

      <Modal
        isOpen={isParsing}
        onClose={() => setShowSuccessModal(false)}
        showOKButton={false}
      >
        {isParsing && (
          <div key="parsing-progress" style={{ marginTop: '1rem' }}>
            <progress></progress>
            <small>Analyzing resume content... don't close the extension window.</small>
          </div>
        )}
      </Modal>
    </article>
  );
};

export default Profiles;