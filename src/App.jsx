import { useState, useEffect } from 'react';
import { authService } from './services/authService';
import './App.css';
import LoginForm from './components/auth/LoginForm';
import Profiles from './components/profiles/Profiles';
import Resume from './components/resume/Resume';
import Settings from './components/settings/Settings';
import Match from './components/match/Match';
import TabLayout from './components/layout/TabLayout';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
  };

  const [activeTab, setActiveTab] = useState('profiles');

  return (
    <div className='tight-layout'>
      {!isLoggedIn ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        <TabLayout activeTab={activeTab} onTabChange={setActiveTab}>
          {activeTab === 'profiles' && <Profiles />}
          {activeTab === 'resume' && <Resume />}
          {activeTab === 'match' && <Match setActiveTab={setActiveTab} />}
          {activeTab === 'settings' && <Settings />}
        </TabLayout>
      )}
    </div>
  );
};

export default App;
