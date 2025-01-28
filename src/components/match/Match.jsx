import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import { aiService } from '../common/aiService';
import { LoadingButton } from '../common/LoadingButton';
import Modal from '../common/Modal';
import { storageService } from '../../services/storageService';

const Match = ({ setActiveTab }) => {
  const [currentProfile, setCurrentProfile] = useState(() => {
    const savedProfile = storageService.get('currentProfile');
    return savedProfile ? JSON.parse(savedProfile) : null;
  });

  const [jobDescription, setJobDescription] = useState(() => {
    const currentUser = authService.getCurrentUser();
    const savedJob = storageService.get(`jobDescription_${currentUser?.id}_${currentProfile?.id}`);
    return savedJob || '';
  });

  const [analysisResults, setAnalysisResults] = useState(() => {
    const currentUser = authService.getCurrentUser();
    const savedResults = storageService.get(`analysisResults_${currentUser?.id}_${currentProfile?.id}`);
    return savedResults ? JSON.parse(savedResults) : null;
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  // Update localStorage when job description changes
  const handleJobDescriptionChange = async (e) => {
    const newValue = e.target.value;
    setJobDescription(newValue);

    const currentUser = authService.getCurrentUser();
    if (currentUser?.id && currentProfile?.id) {
      await storageService.setAsync(`jobDescription_${currentUser.id}_${currentProfile.id}`, newValue);
    }
  };

  // Update localStorage when analysis results change
  useEffect( () => {
    const currentUser = authService.getCurrentUser();
    if (currentUser?.id && currentProfile?.id && analysisResults) {
      storageService.setAsync(
        `analysisResults_${currentUser.id}_${currentProfile.id}`,
        JSON.stringify(analysisResults)
      );
    }
  }, [analysisResults, currentProfile]);

  // Clear stored data when profile changes
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser?.id && currentProfile?.id) {
      const savedJob = storageService.getAsync(`jobDescription_${currentUser.id}_${currentProfile.id}`);
      const savedResults = storageService.getAsync(`analysisResults_${currentUser.id}_${currentProfile.id}`);

      setJobDescription(savedJob || '');
      setAnalysisResults(savedResults ? JSON.parse(savedResults) : null);
    }
  }, [currentProfile]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError('');

    try {
      if (!currentProfile) {
        throw new Error('Please select a profile first');
      }

      if (!jobDescription.trim()) {
        throw new Error('Please enter a job description');
      }

      const currentUser = await authService.getCurrentUser();
      if (!currentUser?.id) {
        setActiveTab('settings');
        throw new Error('Please log in to continue');
      }

      const apiSettings = await authService.getUserApiSettings(currentUser.id);
      if (!apiSettings?.apiKey) {
        setActiveTab('settings');
        throw new Error('Please configure your API key in Settings');
      }

      const formattedSettings = {
        apiKey: apiSettings.apiKey,
        apiEndpoint: apiSettings.apiEndpoint || '',
        modelName: apiSettings.modelName || ''
      };

      // Only analyze for missing keywords, don't update profile
      const analysisData = await aiService.analyzeJobMatch(formattedSettings, {...currentProfile}, jobDescription);
      
      // Store only missing keywords in analysis results
      setAnalysisResults({
        missingKeywords: analysisData.missingKeywords
      });

      // Save analysis results without updating profile
      if (currentUser?.id && currentProfile?.id) {
        await storageService.setAsync(
          `analysisResults_${currentUser.id}_${currentProfile.id}`,
          JSON.stringify({ missingKeywords: analysisData.missingKeywords })
        );
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // In handleGenerateProfile, update the success state
  // Replace showSuccess state with showSuccessModal
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Update handleGenerateProfile to use modal
  const handleGenerateProfile = async () => {
    setError('');
    setIsGenerating(true);

    try {
      if (!analysisResults?.missingKeywords || !currentProfile?.id) {
        throw new Error('No analysis results available');
      }

      const currentUser = await authService.getCurrentUser();
      if (!currentUser?.id) {
        throw new Error('Please log in first');
      }

      const apiSettings = await authService.getUserApiSettings(currentUser.id);
      if (!apiSettings) {
        throw new Error('Please configure API settings first');
      }

      // Generate enhanced profile using AI
      const enhancedProfile = await aiService.generateEnhancedProfile(
        apiSettings,
        currentProfile,
        jobDescription,
        analysisResults.missingKeywords
      );

      // Create new profile with enhanced data
      const storedProfiles = JSON.parse(await storageService.getAsync('userProfiles') || '{}');
      if (!storedProfiles[currentUser.id]) {
        storedProfiles[currentUser.id] = {};
      }

      // Find next available ID
      const existingIds = Object.keys(storedProfiles[currentUser.id]).map(Number);
      const nextId = Math.max(0, ...existingIds) + 1;

      // Create new profile
      const newProfile = {
        ...enhancedProfile,
        id: nextId,
        metadata: {
          ...enhancedProfile.metadata,
          profileName: `${currentProfile.metadata.profileName} (Enhanced)`,
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString()
        }
      };

      setShowSuccessModal(true);

      // Save to localStorage
      storedProfiles[currentUser.id][nextId] = newProfile;
      await storageService.setAsync('userProfiles', JSON.stringify(storedProfiles));

      // Clear the match data for the new profile
      await storageService.setAsync(`jobDescription_${currentUser.id}_${nextId}`);
      await storageService.setAsync(`analysisResults_${currentUser.id}_${nextId}`);

      // Save as current profile and update last loaded profile
      await storageService.setAsync('currentProfile', JSON.stringify(newProfile));
      await storageService.setAsync(`lastLoadedProfile_${currentUser.id}`, nextId.toString());

      // Clear current match data
      setJobDescription('');
      setAnalysisResults(null);

      // Update current profile
      setCurrentProfile(newProfile);

      // Trigger profile update event
      window.dispatchEvent(new CustomEvent('profileLoaded', {
        detail: { profile: newProfile }
      }));

      setActiveTab('resume');
    } catch (err) {
      console.error('Profile generation error:', err);
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRatingChange = (index, value) => {
    setAnalysisResults(prev => {
      if (!prev || !prev.missingKeywords) return prev;

      const updatedKeywords = [...prev.missingKeywords];
      updatedKeywords[index] = {
        ...updatedKeywords[index],
        rating: value
      };

      return {
        ...prev,
        missingKeywords: updatedKeywords
      };
    });
  };

  const handleDescriptionChange = (index, value) => {
    setAnalysisResults(prev => {
      if (!prev || !prev.missingKeywords) return prev;

      const updatedKeywords = [...prev.missingKeywords];
      updatedKeywords[index] = {
        ...updatedKeywords[index],
        description: value
      };

      return {
        ...prev,
        missingKeywords: updatedKeywords
      };
    });
  };

  // Update textarea onChange handler in the return statement
  return (
    <article>
      <div className="grid match-job-description">
        <textarea
          placeholder="Paste the job description here..."
          value={jobDescription}
          onChange={handleJobDescriptionChange}
          rows="10"
        />
      </div>
      {error && <small style={{ color: 'red' }}>{error}</small>}
      <div className='grid'>
        <LoadingButton
          onClick={handleAnalyze}
          disabled={!jobDescription}
          timeout={60000}
          loadingText="Analyzing..."
        >
          Analyze
        </LoadingButton>
      </div>

      <Modal
        isOpen={isAnalyzing || isGenerating}
        showOKButton={false}
      >
        <div style={{ marginTop: '1rem' }}>
          <progress></progress>
          <small> {isAnalyzing ? "Analyzing job description content... " : ""}
            {isGenerating ? "Generating enhanced profile content... " : ""}
            don't close the extension window.</small>
        </div>
      </Modal>

      {analysisResults && (
        <div className="analysis-results">
          <h3>Missing Keywords ({analysisResults.missingKeywords.length})</h3>
          {analysisResults.missingKeywords.map((item, index) => (
            <article key={item.keyword}>
              <div className="keyword-item">
                <label className="keyword-label" htmlFor={`keyword-${index}`}>
                  {item.keyword}
                </label>
                <div className="rating-group">
                  <input
                    type="range"
                    id={`keyword-${index}`}
                    min="0"
                    max="5"
                    value={item.rating ?? 0}
                    style={{ height: '2em' }}
                    onChange={(e) => handleRatingChange(index, parseInt(e.target.value, 10))}
                  />
                  <small className="rating-value">Rating: {item.rating ?? 0}/5</small>
                </div>
              </div>
              <textarea
                className="keyword-description"
                placeholder="Describe your experience with this technology..."
                value={item.description}
                onChange={(e) => handleDescriptionChange(index, e.target.value)}
                rows="3"
              />
            </article>
          ))}
          <div className='grid-vertical'>
            <LoadingButton
              onClick={handleGenerateProfile}
              style={{ marginTop: '20px' }}
              timeout={60000}
              loadingText="Generating..."
            >
              Generate New Profile
            </LoadingButton>
          </div>
          <Modal
            isOpen={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
          >
            <h1>Profile Generation</h1>
            <p>Enhanced profile generated successfully!</p>
          </Modal>
        </div>
      )}
    </article>
  );
};

export default Match;