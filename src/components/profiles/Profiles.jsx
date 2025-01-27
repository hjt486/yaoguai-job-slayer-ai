import { useState, useEffect, useRef } from 'react';
import { DEFAULT_PROFILE_STRUCTURE, AI_PROMPTS, AI_CONFIG } from '../common/Constants';
import { authService } from '../../services/authService';
import { LoadingButton } from '../common/LoadingButton';
import { parseDocument } from '../common/DocumentParser';
import { aiService } from '../common/aiService';
import { formatDateTime, getCurrentISOString } from '../common/dateUtils';

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

  // Add storage helper at the top
  const isExtension = typeof chrome !== 'undefined' && chrome.runtime;
  
  const storageHelper = {
    async get(key) {
      if (isExtension) {
        const result = await chrome.storage.local.get(key);
        return result[key];
      }
      return localStorage.getItem(key);
    },
  
    async set(key, value) {
      if (isExtension) {
        await chrome.storage.local.set({ [key]: value });
      } else {
        localStorage.setItem(key, value);
      }
    },
  
    async remove(key) {
      if (isExtension) {
        await chrome.storage.local.remove(key);
      } else {
        localStorage.removeItem(key);
      }
    }
  };
  
  // Update loadProfiles function
  const loadProfiles = async () => {
    const currentUser = await authService.getCurrentUser();
    const storedProfilesStr = await storageHelper.get('userProfiles');
    const storedProfiles = JSON.parse(storedProfilesStr || '{}');
    const userProfiles = storedProfiles[currentUser.id] || {};
  
    const profilesArray = Object.values(userProfiles).sort((a, b) => {
      if (a.id === 1) return -1;
      if (b.id === 1) return 1;
      return 0;
    });
  
    setProfiles(profilesArray);
  };
  
  // Update useEffect
  useEffect(() => {
    const initializeProfiles = async () => {
      const currentUser = await authService.getCurrentUser();
      const storedProfilesStr = await storageHelper.get('userProfiles');
      const storedProfiles = JSON.parse(storedProfilesStr || '{}');
      const lastLoadedProfileId = await storageHelper.get(`lastLoadedProfile_${currentUser.id}`);
  
      if (!storedProfiles[currentUser.id]) {
        await storageHelper.remove('currentProfile');
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
    };
  
    initializeProfiles();
  
    const handleProfileUpdate = async (e) => {
      await loadProfiles();
      setCurrentProfileId(e.detail.profile.id);
    };
  
    const handleStorageChange = async () => {
      await loadProfiles();
      const updatedProfile = JSON.parse(await storageHelper.get('currentProfile'));
      if (updatedProfile) {
        setCurrentProfileId(updatedProfile.id);
      }
    };
  
    if (!isExtension) {
      window.addEventListener('profileLoaded', handleProfileUpdate);
      window.addEventListener('storage', handleStorageChange);
  
      return () => {
        window.removeEventListener('profileLoaded', handleProfileUpdate);
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, []);
  
  // Update handleDeleteProfile
  const handleDeleteProfile = async (id) => {
    const currentUser = await authService.getCurrentUser();
    const storedProfilesStr = await storageHelper.get('userProfiles');
    const storedProfiles = JSON.parse(storedProfilesStr || '{}');
  
    if (storedProfiles[currentUser.id]) {
      delete storedProfiles[currentUser.id][id];
      await storageHelper.set('userProfiles', JSON.stringify(storedProfiles));
  
      // Remove associated data
      await Promise.all([
        storageHelper.remove(`resume_${id}`),
        storageHelper.remove(`generatedPDF_${id}`),
        storageHelper.remove(`pdfFileName_${id}`),
        storageHelper.remove(`coverLetter_${id}`),
        storageHelper.remove(`coverLetterFileName_${id}`)
      ]);
  
      const currentProfile = JSON.parse(await storageHelper.get('currentProfile'));
      if (currentProfile && currentProfile.id === id) {
        const remainingProfiles = Object.values(storedProfiles[currentUser.id]);
        const sortedProfiles = remainingProfiles.sort((a, b) => b.id - a.id);
        const nextProfile = sortedProfiles.find(p => p.id < id);
  
        if (nextProfile) {
          await handleLoadProfile(nextProfile);
        } else if (sortedProfiles.length > 0) {
          await handleLoadProfile(sortedProfiles[0]);
        } else {
          await storageHelper.remove('currentProfile');
          setCurrentProfileId(null);
          setSelectedFile(null);
          setResumeName('');
        }
      }
  
      await loadProfiles();
    }
  };
  
  // Update handleFileChange to use async storage
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file && allowedFileTypes.includes(file.type)) {
      setSelectedFile(file);
      setResumeName(file.name);
      setPastedResume('');
      setError('');
    } else {
      setSelectedFile(null);
      setResumeName('');
      setPastedResume('');
      setError('Please select a valid file (PDF, DOC, DOCX, TEX, or TXT)');
    }
  };

  // Update handleParse to use storageHelper
  // Update handleParse to properly handle API settings
  const handleParse = async () => {
    if (!selectedFile && !pastedResume) return;
    setIsParsing(true);
    setError('');
  
    try {
      const currentUser = await authService.getCurrentUser();
      const apiSettings = await authService.getUserApiSettings(currentUser.id);
  
      if (!apiSettings?.apiKey) {
        throw new Error('Please configure your API key in settings first');
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
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
  
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from AI response');
      }
  
      let resumeData;
      try {
        resumeData = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error('JSON parse error:', jsonMatch[1]);
        throw new Error('Failed to parse AI response into valid JSON');
      }
  
      const storedProfilesStr = await storageHelper.get('userProfiles');
      const storedProfiles = JSON.parse(storedProfilesStr || '{}');
      if (!storedProfiles[currentUser.id]) {
        storedProfiles[currentUser.id] = {};
      }
  
      const existingIds = Object.keys(storedProfiles[currentUser.id]).map(Number);
      const nextId = Math.max(0, ...existingIds) + 1;
  
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
  
      // Save resume file using async/await
      if (selectedFile || pastedResume) {
        const saveResumeFile = async () => {
          const content = selectedFile ? 
            await new Promise(resolve => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.readAsDataURL(selectedFile);
            }) :
            await new Promise(resolve => {
              const blob = new Blob([pastedResume], { type: 'text/plain' });
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.readAsDataURL(blob);
            });
  
          const resumeFileData = {
            name: selectedFile ? selectedFile.name : 'pasted_resume.txt',
            type: selectedFile ? selectedFile.type : 'text/plain',
            content,
            timestamp: new Date().toISOString(),
            profileId: newProfile.id
          };
  
          await storageHelper.set(`resume_${newProfile.id}`, JSON.stringify(resumeFileData));
        };
  
        await saveResumeFile();
      }
  
      storedProfiles[currentUser.id][nextId] = newProfile;
      await storageHelper.set('userProfiles', JSON.stringify(storedProfiles));
  
      setProfiles(prev => [...prev, newProfile]);
      await handleLoadProfile(newProfile);
    } catch (err) {
      console.error('Parse error:', err);
      setError(err.message);
    } finally {
      setIsParsing(false);
    }
  };
  
  // Add function to handle setting current profile
  // Update handleLoadProfile to use async storage
  const handleLoadProfile = async (profile) => {
    const currentUser = await authService.getCurrentUser();
    const storedProfilesStr = await storageHelper.get('userProfiles');
    const storedProfiles = JSON.parse(storedProfilesStr || '{}');
    
    // Verify profile belongs to current user
    if (!storedProfiles[currentUser.id]?.[profile.id]) {
      setError('Profile not found');
      return;
    }
  
    await storageHelper.set('currentProfile', JSON.stringify(profile));
    await storageHelper.set(`lastLoadedProfile_${currentUser.id}`, profile.id.toString());
    setCurrentProfileId(profile.id);
    
    if (!isExtension) {
      window.dispatchEvent(new CustomEvent('profileLoaded', {
        detail: { profile }
      }));
    }
    setError('');
  };

  const handleCreateProfile = async () => {
    const currentUser = await authService.getCurrentUser();
    const storedProfilesStr = await storageHelper.get('userProfiles');
    const storedProfiles = JSON.parse(storedProfilesStr || '{}');
  
    if (!storedProfiles[currentUser.id]) {
      storedProfiles[currentUser.id] = {};
    }
  
    const existingIds = Object.keys(storedProfiles[currentUser.id]).map(Number);
    const nextId = Math.max(0, ...existingIds) + 1;
  
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
  
    storedProfiles[currentUser.id][nextId] = newProfile;
    await storageHelper.set('userProfiles', JSON.stringify(storedProfiles));
  
    await loadProfiles();
    await handleLoadProfile(newProfile);
  };

  const handleCopyProfile = async (profileToCopy) => {
    const currentUser = await authService.getCurrentUser();
    const storedProfilesStr = await storageHelper.get('userProfiles');
    const storedProfiles = JSON.parse(storedProfilesStr || '{}');
  
    if (!storedProfiles[currentUser.id]) {
      storedProfiles[currentUser.id] = {};
    }
  
    const existingIds = Object.keys(storedProfiles[currentUser.id]).map(Number);
    const nextId = Math.max(0, ...existingIds) + 1;
  
    const newProfile = {
      ...profileToCopy,
      id: nextId,
      metadata: {
        ...profileToCopy.metadata,
        profileName: `${profileToCopy.metadata?.profileName || profileToCopy.profileName} Copied`,
        createdAt: getCurrentISOString(),
        lastModified: getCurrentISOString()
      }
    };
  
    storedProfiles[currentUser.id][nextId] = newProfile;
    await storageHelper.set('userProfiles', JSON.stringify(storedProfiles));
  
    await loadProfiles();
    await handleLoadProfile(newProfile);
  };

  return (
    <article>
      <fieldset role="group">
        <button type="button" onClick={handleFileSelect}>Load</button>
        <input
          name="resume_text"
          type="text"
          placeholder="or paste a resume here"
          readOnly
          value={resumeName || ''}
          onClick={handleInputClick}
          style={{ cursor: 'pointer' }}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.tex,.txt"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <LoadingButton
          onClick={handleParse}
          disabled={!selectedFile && !pastedResume}
          loadingText=""
          timeout={60000}
        >
          Parse
        </LoadingButton>
      </fieldset>

      {error && <small style={{ color: 'red' }}>{error}</small>}
      {isParsing && (
        <div style={{ marginTop: '1rem' }}>
          <progress></progress>
          <small>Analyzing resume content...</small>
        </div>
      )}

{showPasteDialog && (
        <dialog open>
          <article>
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
              onClick={() => handleLoadProfile(profile).catch(err => setError(err.message))}
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
          </div>
        </article>
      ))}
      <div className='grid'>
        <button onClick={handleCreateProfile} >Add New Profile</button>
      </div>
    </article>
  );
};

export default Profiles;