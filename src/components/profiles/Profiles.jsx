import { useState } from 'react';

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

  return (
    <article>
      <fieldset role="group">
        <button type="submit">Load</button>
        <input name="resume_name" type="text" placeholder="Load a resume" />
        <button type="submit">Parse</button>
      </fieldset>
      <div className='align-center'>
        <div aria-busy="true"></div>
        <div>Parsing the resume</div>
      </div>
      {profiles.map(profile => (
        <article key={profile.id} className='grid-horizontal profile-grid'>
          <div className='tighter-layout'>
            <div><h3>{profile.profileName}</h3></div>
            <div><small>Target Role: {profile.targetRole}</small></div>
            <div><small>Target Company: {profile.targetCompany}</small></div>
            <div><small>Last modified: {profile.lastModified}</small></div>
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