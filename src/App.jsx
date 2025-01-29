import { useState, useEffect } from 'react';
import { authService } from './services/authService';
import './App.css';
import LoginForm from './components/auth/LoginForm';
import Profiles from './components/profiles/Profiles';
import Resume from './components/resume/Resume';
import Settings from './components/settings/Settings';
import Match from './components/match/Match';
import TabLayout from './components/layout/TabLayout';
import TestForm from './components/test/TestForm'; // Add this import

window.DEBUG = true; // Make DEBUG globally available
window.TEST_PAGE = '/test/workday.html'; // Fix path and add trailing semicolon
window.TEST_ENTRY = 'workday'

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setIsLoggedIn(!!currentUser);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsLoggedIn(false);
      }
    };

    checkAuth();
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
          {window.DEBUG && activeTab === 'test' && <TestForm entry={window.TEST_ENTRY}/>}
        </TabLayout>
      )}
    </div>
  );
};

export default App;
