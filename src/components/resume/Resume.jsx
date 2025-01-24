import React, { useState } from 'react';
import { DEFAULT_PROFILE_STRUCTURE, LABELS } from '../Constants';

const ResumeSection = ({ title, data, isEditing }) => {
  const renderContent = () => {
    if (Array.isArray(data)) {
      return data.map((item, index) => (
        <div key={index} className="section-item">
          {Object.entries(item).map(([key, value]) => (
            <div key={key} className="field-item">
              <strong>{LABELS.fields[key] || key}: </strong>
              {isEditing ? (
                <input type="text" value={value} />
              ) : (
                <span>{value}</span>
              )}
            </div>
          ))}
        </div>
      ));
    } else if (typeof data === 'object') {
      return Object.entries(data).map(([key, value]) => {
        if (typeof value === 'object') {
          return (
            <div key={key} className="subsection">
              <h3>{LABELS.fields[key] || key}</h3>
              {Object.entries(value).map(([subKey, subValue]) => (
                <div key={subKey} className="field-item">
                  <strong>{LABELS.fields[subKey] || subKey}: </strong>
                  {isEditing ? (
                    <input type="text" value={subValue} />
                  ) : (
                    <span>{subValue}</span>
                  )}
                </div>
              ))}
            </div>
          );
        }
        return (
          <div key={key} className="field-item">
            <strong>{LABELS.fields[key] || key}: </strong>
            {isEditing ? (
              <input type="text" value={value} />
            ) : (
              <span>{value}</span>
            )}
          </div>
        );
      });
    } else {
      return isEditing ? (
        <textarea value={data} />
      ) : (
        <p>{data}</p>
      );
    }
  };

  return (
    <section className="resume-section">
      <div className="section-header">
        <h2>{title}</h2>
      </div>
      <div className="section-content">
        {renderContent()}
      </div>
    </section>
  );
};

const Resume = () => {
  const [profile, setProfile] = useState(DEFAULT_PROFILE_STRUCTURE);
  const [isEditing, setIsEditing] = useState(false);

  const handleSectionEdit = (section, data) => {
    setProfile(prev => ({
      ...prev,
      [section]: data
    }));
  };

  return (
    <article>
      <div className='grid'><button onClick={() => setIsEditing(!isEditing)}>
        {isEditing ? 'Save' : 'Edit'}
      </button></div>
      {Object.entries(LABELS.sections).map(([section, label]) => (
        <ResumeSection
          key={section}
          title={label}
          data={profile[section]}
          isEditing={isEditing}
          onEdit={(data) => handleSectionEdit(section, data)}
        />
      ))}
      <div className='grid'><button>Download PDF Resume</button></div>
      <div className='grid'><button>Download PDF Cover Letter</button></div>
    </article>
  );
};

export default Resume;