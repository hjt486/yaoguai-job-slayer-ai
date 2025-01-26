import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import { aiService } from '../common/aiService';

const Match = () => {
  const [currentProfile, setCurrentProfile] = useState(() => {
    const savedProfile = localStorage.getItem('currentProfile');
    return savedProfile ? JSON.parse(savedProfile) : null;
  });

  const [jobDescription, setJobDescription] = useState(() => {
    const currentUser = authService.getCurrentUser();
    const savedJob = localStorage.getItem(`jobDescription_${currentUser?.id}_${currentProfile?.id}`);
    return savedJob || '';
  });

  const [analysisResults, setAnalysisResults] = useState(() => {
    const currentUser = authService.getCurrentUser();
    const savedResults = localStorage.getItem(`analysisResults_${currentUser?.id}_${currentProfile?.id}`);
    return savedResults ? JSON.parse(savedResults) : null;
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  // Update localStorage when job description changes
  const handleJobDescriptionChange = (e) => {
    const newValue = e.target.value;
    setJobDescription(newValue);

    const currentUser = authService.getCurrentUser();
    if (currentUser?.id && currentProfile?.id) {
      localStorage.setItem(`jobDescription_${currentUser.id}_${currentProfile.id}`, newValue);
    }
  };

  // Update localStorage when analysis results change
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser?.id && currentProfile?.id && analysisResults) {
      localStorage.setItem(
        `analysisResults_${currentUser.id}_${currentProfile.id}`,
        JSON.stringify(analysisResults)
      );
    }
  }, [analysisResults, currentProfile]);

  // Clear stored data when profile changes
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser?.id && currentProfile?.id) {
      const savedJob = localStorage.getItem(`jobDescription_${currentUser.id}_${currentProfile.id}`);
      const savedResults = localStorage.getItem(`analysisResults_${currentUser.id}_${currentProfile.id}`);

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

      const currentUser = authService.getCurrentUser();
      const apiSettings = authService.getUserApiSettings(currentUser.id);

      if (!apiSettings) {
        throw new Error('Please configure API settings first');
      }

      if (!jobDescription.trim()) {
        throw new Error('Please enter a job description');
      }

      const analysisData = await aiService.analyzeJobMatch(apiSettings, currentProfile, jobDescription);
      setAnalysisResults(analysisData);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateProfile = () => {
    if (!analysisResults?.missingKeywords || !currentProfile?.id) {
      setError('No analysis results available');
      return;
    }

    const currentUser = authService.getCurrentUser();
    if (!currentUser?.id) {
      setError('Please log in first');
      return;
    }

    // Store missing keywords separately with profile reference
    const missingSkillsKey = `missingSkills_${currentUser.id}_${currentProfile.id}`;
    const existingSkills = JSON.parse(localStorage.getItem(missingSkillsKey) || '[]');

    const updatedSkills = [
      ...existingSkills,
      ...analysisResults.missingKeywords
        .filter(item => item.rating > 1)
        .map(item => ({
          keyword: item.keyword,
          rating: item.rating,
          description: item.description,
          jobDescription: jobDescription,
          analyzedAt: new Date().toISOString()
        }))
    ];

    localStorage.setItem(missingSkillsKey, JSON.stringify(updatedSkills));
    setError('Missing skills saved successfully');
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
        <button
          onClick={handleAnalyze}
          aria-busy={isAnalyzing}
          disabled={!jobDescription || isAnalyzing}
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze'}
        </button>
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
                    style={{ height: '2em'}}
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
          <div className='grid'>
            <button
              onClick={handleGenerateProfile}
              style={{ marginTop: '20px' }}
            >
              Generate New Profile
            </button>
          </div>
        </div>
      )}
    </article>
  );
};

export default Match;