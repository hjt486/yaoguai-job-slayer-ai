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

    // console.log('Loading profiles:', profilesArray);
    setProfiles(profilesArray);
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
    const currentUser = authService.getCurrentUser();
    const storedProfiles = JSON.parse(localStorage.getItem('userProfiles') || '{}');
    const lastLoadedProfileId = localStorage.getItem(`lastLoadedProfile_${currentUser.id}`);

    // Clear all user-specific data if no profiles exist for this user
    if (!storedProfiles[currentUser.id]) {
      localStorage.removeItem('currentProfile');
      setCurrentProfileId(null);
      setSelectedFile(null);
      setResumeName('');
      setPastedResume('');
    } else if (lastLoadedProfileId && storedProfiles[currentUser.id][lastLoadedProfileId]) {
      // Load the last used profile if it exists
      handleLoadProfile(storedProfiles[currentUser.id][lastLoadedProfileId]);
    } else {
      // Load the first available profile as fallback
      const firstProfile = Object.values(storedProfiles[currentUser.id])[0];
      if (firstProfile) {
        handleLoadProfile(firstProfile);
      }
    }

    loadProfiles();

    // Add listener for profile updates
    const handleProfileUpdate = (e) => {
      console.log('Profile update received:', e.detail.profile);
      loadProfiles();
      setCurrentProfileId(e.detail.profile.id);
    };

    const handleStorageChange = () => {
      loadProfiles();
      const updatedProfile = JSON.parse(localStorage.getItem('currentProfile'));
      if (updatedProfile) {
        setCurrentProfileId(updatedProfile.id);
      }
    };

    window.addEventListener('profileLoaded', handleProfileUpdate);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('profileLoaded', handleProfileUpdate);
      window.removeEventListener('storage', handleStorageChange);
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

      // If the deleted profile was the current profile
      const currentProfile = JSON.parse(localStorage.getItem('currentProfile'));
      if (currentProfile && currentProfile.id === id) {
        // Find profile with next lower ID
        const remainingProfiles = Object.values(storedProfiles[currentUser.id]);
        const sortedProfiles = remainingProfiles.sort((a, b) => b.id - a.id);
        const nextProfile = sortedProfiles.find(p => p.id < id);

        if (nextProfile) {
          handleLoadProfile(nextProfile);
        } else if (sortedProfiles.length > 0) {
          // If no lower ID found, take the highest ID
          handleLoadProfile(sortedProfiles[0]);
        } else {
          localStorage.removeItem('currentProfile');
          setCurrentProfileId(null);
          setSelectedFile(null);
          setResumeName('');
        }
      }

      loadProfiles();
    }
  };

  // Update handleParse to handle profile updates
  const handleParse = async () => {
    if (!selectedFile && !pastedResume) return;
    setIsParsing(true);
    setError('');

    try {
      const currentUser = authService.getCurrentUser();
      const apiSettings = authService.getUserApiSettings(currentUser.id);

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

      // Find the next available ID
      const storedProfiles = JSON.parse(localStorage.getItem('userProfiles') || '{}');
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
        reader.onload = () => {
          const base64File = reader.result;
          const resumeFileData = {
            name: selectedFile.name,
            type: selectedFile.type,
            content: base64File,
            timestamp: new Date().toISOString(),
            profileId: newProfile.id
          };
          localStorage.setItem(`resume_${newProfile.id}`, JSON.stringify(resumeFileData));
        };
        reader.readAsDataURL(selectedFile);
      } else if (pastedResume) {
        // Save pasted resume as text file
        const blob = new Blob([pastedResume], { type: 'text/plain' });
        const reader = new FileReader();
        reader.onload = () => {
          const resumeFileData = {
            name: 'pasted_resume.txt',
            type: 'text/plain',
            content: reader.result,
            timestamp: new Date().toISOString(),
            profileId: newProfile.id
          };
          localStorage.setItem(`resume_${newProfile.id}`, JSON.stringify(resumeFileData));
        };
        reader.readAsDataURL(blob);
      }

      // Update localStorage and state
      storedProfiles[currentUser.id][nextId] = newProfile;
      localStorage.setItem('userProfiles', JSON.stringify(storedProfiles));
      
      setProfiles(prev => [...prev, newProfile]);
      handleLoadProfile(newProfile);

    } catch (err) {
      console.error('Parse error:', err);
      setError(err.message);
    } finally {
      setIsParsing(false);
    }
  };

  // Add function to handle setting current profile
  const handleLoadProfile = (profile) => {
    const currentUser = authService.getCurrentUser();
    const storedProfiles = JSON.parse(localStorage.getItem('userProfiles') || '{}');
    
    // Verify profile belongs to current user
    if (!storedProfiles[currentUser.id]?.[profile.id]) {
      setError('Profile not found');
      return;
    }

    localStorage.setItem('currentProfile', JSON.stringify(profile));
    localStorage.setItem(`lastLoadedProfile_${currentUser.id}`, profile.id);
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
        createdAt: getCurrentISOString(),
        lastModified: getCurrentISOString()
      }
    };

    // Save to localStorage
    storedProfiles[currentUser.id][nextId] = newProfile;
    localStorage.setItem('userProfiles', JSON.stringify(storedProfiles));

    // Refresh profiles list and load the new profile
    loadProfiles();
    handleLoadProfile(newProfile);  // Add this line to automatically load the new profile
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

    // Refresh profiles list and load the new profile
    loadProfiles();
    handleLoadProfile(newProfile);  // Add this line to automatically load the copied profile
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