import React, { useState } from 'react';

const Match = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    // TODO: Implement actual analysis logic
    // Mockup results for now
    setTimeout(() => {
      setAnalysisResults({
        missingKeywords: [
          { keyword: 'Docker', rating: 1, description: '' },
          { keyword: 'AWS', rating: 1, description: '' },
          { keyword: 'Python', rating: 1, description: '' }
        ],
        matchScore: 75
      });
      setIsAnalyzing(false);
    }, 1000);
  };

  const handleRatingChange = (index, value) => {
    setAnalysisResults(prev => ({
      ...prev,
      missingKeywords: prev.missingKeywords.map((item, i) =>
        i === index ? { ...item, rating: value } : item
      )
    }));
  };

  const handleDescriptionChange = (index, value) => {
    setAnalysisResults(prev => ({
      ...prev,
      missingKeywords: prev.missingKeywords.map((item, i) =>
        i === index ? { ...item, description: value } : item
      )
    }));
  };

  const handleGenerateProfile = () => {
    // TODO: Implement profile generation logic using the analysis results
    console.log('Generating new profile with:', analysisResults);
  };

  return (
    <article>
      <div className="grid">
        <textarea
          placeholder="Paste the job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows="10"
        />
      </div>
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
          <h3>{analysisResults.matchScore}% Match, Missing Keywords ({analysisResults.missingKeywords.length})</h3>
          {analysisResults.missingKeywords.map((item, index) => (
            <article key={item.keyword} className="grid grid-vertical">
              <div role="group">
                <label htmlFor={`keyword-${index}`}>{item.keyword}</label>
                <input
                  type="range"
                  id={`keyword-${index}`}
                  min="1"
                  max="5"
                  value={item.rating}
                  onChange={(e) => handleRatingChange(index, parseInt(e.target.value))}
                />
                <small>Familiarity Level: {item.rating}/5</small>
              </div>
              <textarea
                type="text"
                placeholder="Describe your experience with this technology..."
                value={item.description}
                onChange={(e) => handleDescriptionChange(index, e.target.value)}
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