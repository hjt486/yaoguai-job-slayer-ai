import { useState, useRef } from 'react';
import { DEFAULT_PROFILE_STRUCTURE, AI_PROMPTS, AI_CONFIG } from '../Constants';
import { authService } from '../../services/authService';
import { LoadingButton } from '../common/LoadingButton';
import { parseDocument } from '../common/DocumentParser';
import { aiService } from '../common/aiService';

const Profiles = () => {
  const [profiles, setProfiles] = useState([
    {
      id: 1,
      profileName: 'Default Profile',
      lastModified: '2024-02-20',
      targetRole: 'Software Engineer',
      targetCompany: 'Megger',
    },
    {
      id: 2,
      profileName: 'Full Stack Software Engineer',
      lastModified: '2024-02-20',
      targetRole: 'Full Stack Software Engineer',
      targetCompany: 'Apkudo',
    }
  ]);

  const handleCreateProfile = () => {
    // TODO: Implement profile creation logic
  };

  const handleEditProfile = (id) => {
    // TODO: Implement profile editing logic
  };

  const handleDeleteProfile = (id) => {
    // TODO: Implement profile deletion logic
  };

  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const [isParsing, setIsParsing] = useState(false);

  const allowedFileTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/x-tex',
    'text/plain'
  ];

  const handleFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && allowedFileTypes.includes(file.type)) {
      setSelectedFile(file);
      setError('');
    } else {
      setSelectedFile(null);
      setError('Please select a valid file (PDF, DOC, DOCX, TEX, or TXT)');
    }
  };

  const handleParse = async () => {
    if (!selectedFile) return;
    setIsParsing(true);
    setError('');  // Clear previous errors

    try {
      const currentUser = authService.getCurrentUser();
      const apiSettings = authService.getUserApiSettings(currentUser.id);

      if (!apiSettings) {
        throw new Error('Please configure API settings first');
      }

      const parsedDoc = await parseDocument(selectedFile);
      const aiResponse = await aiService.parseResume(apiSettings, parsedDoc.content);

      // Extract the parsed content from AI response, removing markdown formatting
      const parsedData = aiResponse.choices[0].message.content
        .replace(/^```json\n/, '')  // Remove opening markdown
        .replace(/\n```$/, '');     // Remove closing markdown
        
      let resumeData;
      try {
        resumeData = JSON.parse(parsedData);
      } catch (e) {
        console.error('JSON parse error:', parsedData);
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
          lastModified: new Date().toISOString()
        }
      };

      setProfiles(prev => {
        const filtered = prev.filter(p => p.id !== 1);
        return [defaultProfile, ...filtered];
      });

      // Save to localStorage
      const storedProfiles = JSON.parse(localStorage.getItem('userProfiles') || '{}');
      if (!storedProfiles[currentUser.id]) {
        storedProfiles[currentUser.id] = {};
      }
      storedProfiles[currentUser.id]['1'] = defaultProfile;
      localStorage.setItem('userProfiles', JSON.stringify(storedProfiles));

    } catch (err) {
      console.error('Parse error:', err);
      setError(err.message);
    } finally {
      setIsParsing(false);
    }
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
          value={selectedFile ? selectedFile.name : ''}
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
        <article key={profile.id} className='grid-horizontal profile-grid'>
          <div className='tighter-layout'>
            <div><h3>{profile.metadata?.profileName || profile.profileName}</h3></div>
            <div><small>Target Role: {profile.metadata?.targetRole || profile.targetRole}</small></div>
            <div><small>Target Company: {profile.metadata?.targetCompany || profile.targetCompany}</small></div>
            <div><small>Last modified: {profile.metadata?.lastModified || profile.lastModified}</small></div>
            {profile.personal && (
              <>
                <div><small>Email: {profile.personal.email}</small></div>
                <div><small>Phone: {profile.personal.phone}</small></div>
                {profile.personal.website && (
                  <div><small>Website: {profile.personal.website}</small></div>
                )}
              </>
            )}
          </div>
          <div className='grid-vertical'>
            <button className='button-full' onClick={() => handleEditProfile(profile.id)}>Load</button>
            <button className='button-full' onClick={() => handleDeleteProfile(profile.id)}>Delete</button>
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