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
  const fileInputRef = useRef(null);

  // Add function to check if resume exists for a profile
  const hasResume = (profileId) => {
    const resumeKey = `resume_${profileId}`;
    const storedResume = localStorage.getItem(resumeKey);
    return !!storedResume;
  };

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

  // Move loadProfiles before useEffect
  const loadProfiles = () => {
    const currentUser = authService.getCurrentUser();
    const storedProfiles = JSON.parse(localStorage.getItem('userProfiles') || '{}');
    const userProfiles = storedProfiles[currentUser.id] || {};

    const profilesArray = Object.values(userProfiles).sort((a, b) => {
      if (a.id === 1) return -1;
      if (b.id === 1) return 1;
      return 0;
    });

    console.log('Loading profiles:', profilesArray);
    setProfiles(profilesArray);
  };

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    const storedProfiles = JSON.parse(localStorage.getItem('userProfiles') || '{}');

    // Clear all user-specific data if no profiles exist for this user
    if (!storedProfiles[currentUser.id]) {
      // Clear resume data
      localStorage.removeItem('storedResume');
      localStorage.removeItem(`resumeOwner_${currentUser.id}`);
      
      // Clear current profile
      localStorage.removeItem('currentProfile');
      
      // Clear any generated PDFs
      localStorage.removeItem('generatedPDF_1');
      localStorage.removeItem('pdfFileName_1');
      localStorage.removeItem('coverLetter_1');
      localStorage.removeItem('coverLetterFileName_1');
      
      setResumeName('');
      setSelectedFile(null);
      setCurrentProfileId(null);
    }

    loadProfiles();

    // Load saved resume name if exists and belongs to current user
    const storedResume = JSON.parse(localStorage.getItem('storedResume'));
    if (storedResume && localStorage.getItem(`resumeOwner_${currentUser.id}`)) {
      setResumeName(storedResume.name);
    }

    // Add listener for profile updates
    const handleProfileUpdate = (e) => {
      console.log('Profile update received:', e.detail.profile);
      loadProfiles();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    window.addEventListener('storage', loadProfiles);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      window.removeEventListener('storage', loadProfiles);
    };
  }, []);


  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file && allowedFileTypes.includes(file.type)) {
      const currentUser = authService.getCurrentUser();
      const currentProfile = JSON.parse(localStorage.getItem('currentProfile'));
      
      if (!currentProfile) {
        setError('Please select a profile first');
        return;
      }
      
      // Store resume with profile ID
      const resumeKey = `resume_${currentProfile.id}`;
      localStorage.removeItem(resumeKey);

      // First update the UI
      setSelectedFile(file);
      setResumeName(file.name);
      setError('');

      // Then store new file in base64 format with profile ID
      const reader = new FileReader();
      reader.onload = () => {
        const base64File = reader.result;
        const resumeData = {
          name: file.name,
          type: file.type,
          content: base64File,
          timestamp: new Date().toISOString(),
          profileId: currentProfile.id
        };
        localStorage.setItem(resumeKey, JSON.stringify(resumeData));
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setResumeName('');
      setError('Please select a valid file (PDF, DOC, DOCX, TEX, or TXT)');
    }
  };

  // Update download handler
  const handleDownloadResume = (profileId) => {
    const resumeKey = `resume_${profileId}`;
    const storedResume = JSON.parse(localStorage.getItem(resumeKey));
    if (!storedResume) {
      setError('No resume file found for this profile');
      return;
    }

    const link = document.createElement('a');
    link.href = storedResume.content;
    link.download = storedResume.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteProfile = (id) => {
    const currentUser = authService.getCurrentUser();
    const storedProfiles = JSON.parse(localStorage.getItem('userProfiles') || '{}');

    if (storedProfiles[currentUser.id]) {
      // Remove profile from userProfiles
      delete storedProfiles[currentUser.id][id];
      localStorage.setItem('userProfiles', JSON.stringify(storedProfiles));

      // Remove associated data
      localStorage.removeItem(`resume_${id}`);
      localStorage.removeItem(`generatedPDF_${id}`);
      localStorage.removeItem(`pdfFileName_${id}`);
      localStorage.removeItem(`coverLetter_${id}`);
      localStorage.removeItem(`coverLetterFileName_${id}`);

      // If the deleted profile was the current profile, clear currentProfile
      const currentProfile = JSON.parse(localStorage.getItem('currentProfile'));
      if (currentProfile && currentProfile.id === id) {
        localStorage.removeItem('currentProfile');
        setCurrentProfileId(null);
        setSelectedFile(null);
        setResumeName('');
      }

      loadProfiles();
    }
  };

  // Update handleParse to handle profile updates
  const handleParse = async () => {
    if (!selectedFile) return;
    setIsParsing(true);
    setError('');

    try {
      const currentUser = authService.getCurrentUser();
      const apiSettings = authService.getUserApiSettings(currentUser.id);

      if (!apiSettings) {
        throw new Error('Please configure API settings first');
      }

      const parsedDoc = await parseDocument(selectedFile);
      const aiResponse = await aiService.parseResume(apiSettings, parsedDoc.content);

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

      // Update profiles state and localStorage
      const defaultProfile = {
        id: 1,
        ...DEFAULT_PROFILE_STRUCTURE,
        ...resumeData,
        metadata: {
          ...DEFAULT_PROFILE_STRUCTURE.metadata,
          ...resumeData.metadata,
          createdAt: getCurrentISOString(),  // Add creation time
          lastModified: getCurrentISOString(),
          resumeName: resumeName
        }
      };

      setProfiles(prev => {
        const filtered = prev.filter(p => p.id !== 1);
        const updated = [defaultProfile, ...filtered];

        // Update localStorage
        const storedProfiles = JSON.parse(localStorage.getItem('userProfiles') || '{}');
        if (!storedProfiles[currentUser.id]) {
          storedProfiles[currentUser.id] = {};
        }
        storedProfiles[currentUser.id]['1'] = defaultProfile;
        localStorage.setItem('userProfiles', JSON.stringify(storedProfiles));

        // Set as current profile
        handleLoadProfile(defaultProfile);

        return updated;
      });

    } catch (err) {
      console.error('Parse error:', err);
      setError(err.message);
    } finally {
      setIsParsing(false);
    }
  };

  // Add function to handle setting current profile
  const handleLoadProfile = (profile) => {
    localStorage.setItem('currentProfile', JSON.stringify(profile));
    setCurrentProfileId(profile.id);
    window.dispatchEvent(new CustomEvent('profileLoaded', {
      detail: { profile }
    }));
    setError('');
  };

  const handleCreateProfile = () => {
    const currentUser = authService.getCurrentUser();
    const storedProfiles = JSON.parse(localStorage.getItem('userProfiles') || '{}');

    if (!storedProfiles[currentUser.id]) {
      storedProfiles[currentUser.id] = {};
    }

    // Find the next available ID
    const existingIds = Object.keys(storedProfiles[currentUser.id]).map(Number);
    const nextId = Math.max(0, ...existingIds) + 1;

    // Create new profile
    const newProfile = {
      id: nextId,
      ...DEFAULT_PROFILE_STRUCTURE,
      metadata: {
        ...DEFAULT_PROFILE_STRUCTURE.metadata,
        profileName: `Profile ${nextId}`,
        createdAt: getCurrentISOString(),  // Add creation time
        lastModified: getCurrentISOString()
      }
    };

    // Save to localStorage
    storedProfiles[currentUser.id][nextId] = newProfile;
    localStorage.setItem('userProfiles', JSON.stringify(storedProfiles));

    // Refresh profiles list
    loadProfiles();
  };

  const handleCopyProfile = (profileToCopy) => {
    const currentUser = authService.getCurrentUser();
    const storedProfiles = JSON.parse(localStorage.getItem('userProfiles') || '{}');

    if (!storedProfiles[currentUser.id]) {
      storedProfiles[currentUser.id] = {};
    }

    // Find the next available ID
    const existingIds = Object.keys(storedProfiles[currentUser.id]).map(Number);
    const nextId = Math.max(0, ...existingIds) + 1;

    // Create copied profile
    const newProfile = {
      ...profileToCopy,
      id: nextId,
      metadata: {
        ...profileToCopy.metadata,
        profileName: `${profileToCopy.metadata?.profileName || profileToCopy.profileName} Copied`,
        createdAt: getCurrentISOString(),  // Add creation time
        lastModified: getCurrentISOString()
      }
    };

    // Save to localStorage
    storedProfiles[currentUser.id][nextId] = newProfile;
    localStorage.setItem('userProfiles', JSON.stringify(storedProfiles));

    // Refresh profiles list
    loadProfiles();
  };

  return (
    <article>
      <fieldset role="group">
        <button type="button" onClick={handleFileSelect}>Load</button>
        <input
          name="resume_name"
          type="text"
          placeholder="Load a resume"
          readOnly
          value={resumeName || ''}
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
          disabled={!selectedFile}
          loadingText=""
          timeout={30000}
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
            {hasResume(profile.id) && (
              <button
                className='button-full'
                onClick={() => handleDownloadResume(profile.id)}
              >
                Download Resume
              </button>
            )}
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