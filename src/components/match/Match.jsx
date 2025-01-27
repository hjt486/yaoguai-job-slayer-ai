import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import { aiService } from '../common/aiService';
import { LoadingButton } from '../common/LoadingButton';
import Modal from '../common/Modal';

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
  }
};

const Match = ({ setActiveTab }) => {
  const [currentProfile, setCurrentProfile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [analysisResults, setAnalysisResults] = useState(null);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      const currentUser = await authService.getCurrentUser();
      const savedProfile = await storageHelper.get('currentProfile');
      const profile = savedProfile ? JSON.parse(savedProfile) : null;
      setCurrentProfile(profile);

      if (currentUser?.id && profile?.id) {
        const savedJob = await storageHelper.get(`jobDescription_${currentUser.id}_${profile.id}`);
        const savedResults = await storageHelper.get(`analysisResults_${currentUser.id}_${profile.id}`);
        
        setJobDescription(savedJob || '');
        setAnalysisResults(savedResults ? JSON.parse(savedResults) : null);
      }
    };

    loadInitialData();
  }, []);

  // Update storage when job description changes
  const handleJobDescriptionChange = async (e) => {
    const newValue = e.target.value;
    setJobDescription(newValue);

    const currentUser = await authService.getCurrentUser();
    if (currentUser?.id && currentProfile?.id) {
      await storageHelper.set(`jobDescription_${currentUser.id}_${currentProfile.id}`, newValue);
    }
  };

  // Update storage when analysis results change
  useEffect(() => {
    const updateStorage = async () => {
      const currentUser = await authService.getCurrentUser();
      if (currentUser?.id && currentProfile?.id && analysisResults) {
        await storageHelper.set(
          `analysisResults_${currentUser.id}_${currentProfile.id}`,
          JSON.stringify(analysisResults)
        );
      }
    };

    updateStorage();
  }, [analysisResults, currentProfile]);

  // Update handleGenerateProfile
  const handleGenerateProfile = async () => {
    setError('');

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

      const enhancedProfile = await aiService.generateEnhancedProfile(
        apiSettings,
        currentProfile,
        jobDescription,
        analysisResults.missingKeywords
      );

      // Get stored profiles
      const storedProfilesStr = await storageHelper.get('userProfiles');
      const storedProfiles = JSON.parse(storedProfilesStr || '{}');
      if (!storedProfiles[currentUser.id]) {
        storedProfiles[currentUser.id] = {};
      }

      const existingIds = Object.keys(storedProfiles[currentUser.id]).map(Number);
      const nextId = Math.max(0, ...existingIds) + 1;

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

      // Save to storage
      storedProfiles[currentUser.id][nextId] = newProfile;
      await storageHelper.set('userProfiles', JSON.stringify(storedProfiles));
      await storageHelper.set('currentProfile', JSON.stringify(newProfile));
      await storageHelper.set(`lastLoadedProfile_${currentUser.id}`, nextId.toString());

      // Clear match data
      if (isExtension) {
        await chrome.storage.local.remove([
          `jobDescription_${currentUser.id}_${nextId}`,
          `analysisResults_${currentUser.id}_${nextId}`
        ]);
      } else {
        localStorage.removeItem(`jobDescription_${currentUser.id}_${nextId}`);
        localStorage.removeItem(`analysisResults_${currentUser.id}_${nextId}`);
      }

      setJobDescription('');
      setAnalysisResults(null);
      setCurrentProfile(newProfile);

      if (!isExtension) {
        window.dispatchEvent(new CustomEvent('profileLoaded', {
          detail: { profile: newProfile }
        }));
      }

      setActiveTab('resume');
    } catch (err) {
      console.error('Profile generation error:', err);
      setError(err.message);
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
                    min="1"
                    max="5"
                    value={item.rating || 1}
                    style={{ height: '2em' }}
                    onChange={(e) => handleRatingChange(index, parseInt(e.target.value, 10))}
                  />
                  <small className="rating-value">Rating: {item.rating}/5</small>
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