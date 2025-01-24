import { useState } from 'react';
import './App.css';
import LoginForm from './components/auth/LoginForm';
import Profiles from './components/profiles/Profiles';
import Resume from './components/resume/Resume';
import Settings from './components/settings/Settings';
import Match from './components/match/Match';
import TabLayout from './components/layout/TabLayout';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('profiles');

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <div className='tight-layout'>
      {!isLoggedIn ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        <TabLayout activeTab={activeTab} onTabChange={setActiveTab}>
          {activeTab === 'profiles' && <Profiles />}
          {activeTab === 'resume' && <Resume />}
          {activeTab === 'match' && <Match />}
          {activeTab === 'settings' && <Settings />}
        </TabLayout>
      )}
    </div>
  );
}

export default App;
