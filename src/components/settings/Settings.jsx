import { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import { storageService } from '../../services/storageService';
import Modal from '../common/Modal';
import React from 'react';

const Settings = () => {
  const [apiKey, setApiKey] = useState('');
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [modelName, setModelName] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [showSaveApiSettingsModal, setShowApiSettingsModal] = useState(false);
  const [showSaveUserSettingsModal, setShowUserSettingsModal] = useState(false);
  const [apiError, setApiError] = useState('');
  const [userForm, setUserForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  });
  const [userError, setUserError] = useState('');

  // Add to useEffect to load saved API settings
  useEffect(() => {
    const loadSettings = async () => {
      const user = await authService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        setUserForm({
          email: user.email || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          password: '',
          confirmPassword: ''
        });

        // Load saved API settings
        const savedSettings = await authService.getUserApiSettings(user.id);
        if (savedSettings) {
          setApiKey(savedSettings.apiKey || '');
          setApiEndpoint(savedSettings.apiEndpoint || '');
          setModelName(savedSettings.modelName || '');
        }
      }
    };

    loadSettings();
  }, []);

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setUserError('');

    if (userForm.password || userForm.confirmPassword) {
      if (userForm.password !== userForm.confirmPassword) {
        setUserError('Passwords do not match');
        return;
      }
    }

    try {
      const updateData = {
        email: userForm.email,
        firstName: userForm.firstName,
        lastName: userForm.lastName
      };

      if (userForm.password) {
        updateData.password = userForm.password;
      }

      const updatedUser = await authService.updateUser(currentUser.id, updateData);
      setCurrentUser(updatedUser);
      setUserForm({ ...userForm, password: '', confirmPassword: '' });
      setShowUserSettingsModal(true)
    } catch (error) {
      setUserError(error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        // Clear all user-specific data
        await storageService.removeAsync('currentProfile');
        await storageService.removeAsync(`lastLoadedProfile_${currentUser.id}`);
        await storageService.removeAsync(`userApiSettings_${currentUser.id}`);
        await storageService.removeAsync('userProfiles');

        // Finally logout
        await authService.logout();
      }

      window.location.reload();
    } catch (error) {
      console.error('Error during sign out:', error);
      // Force reload even if there's an error
      window.location.reload();
    }
  };

  // Update handleApiSubmit function
  const handleApiSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!currentUser) {
      return;
    }

    try {
      const apiSettings = {
        apiKey,
        apiEndpoint,
        modelName,
      };

      await authService.updateUserApiSettings(currentUser.id, apiSettings);
      setShowApiSettingsModal(true);
    } catch (error) {
      setApiError(error.message);
      console.error('Failed to save API settings:', error);
    }
  };

  return (
    <div>
      <article>
        <header><h2>API Settings</h2></header>
        <form onSubmit={handleApiSubmit}>
          <div>
            <label htmlFor="apiKey">OpenAI API Key</label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key here"
            />
          </div>
          <div>
            <label htmlFor="apiEndpoint">API Endpoint</label>
            <input
              id="apiEndpoint"
              type="url"
              value={apiEndpoint}
              onChange={(e) => setApiEndpoint(e.target.value)}
              placeholder="Enter API endpoint e.g. https://api.deepseek.com"
            />
          </div>
          <div>
            <label htmlFor="modelName">Model Name</label>
            <input
              id="modelName"
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="Enter Model name e.g.: deepseek-chat"
            />
          </div>
          {apiError && <small style={{ color: 'red' }}>{apiError}</small>}
          <button type="submit">Save API Settings</button>
        </form>
      </article>
      <article>
        <header>
          <h2>User Settings</h2>
          {currentUser && <p>Logged in as: {currentUser.email}</p>}
        </header>
        <form onSubmit={handleUserSubmit}>
          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              type="text"
              value={userForm.firstName}
              onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="lastName">Last Name</label>
            <input
              id="lastName"
              type="text"
              value={userForm.lastName}
              onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="password">New Password (optional)</label>
            <input
              id="password"
              type="password"
              placeholder="Leave blank to keep current password"
              value={userForm.password}
              onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              value={userForm.confirmPassword}
              onChange={(e) => setUserForm({ ...userForm, confirmPassword: e.target.value })}
            />
          </div>
          {userError && <small style={{ color: 'red' }}>{userError}</small>}
          <div className="grid">
            <button type="submit">Save User Settings</button>
          </div>
          <div className="grid">
            <button type="button" className="secondary" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>
        </form>
        <div className='text-muted text-right'>
          <p>Developed by <a href="https://jiataihan.dev/" target="_blank" rel="noopener noreferrer">Jiatai Han</a></p>
        </div>
      </article>

      <Modal
        isOpen={showSaveUserSettingsModal}
        onClose={() => setShowUserSettingsModal(false)}
      >
        <h1>User Settings</h1>
        <p>Updated successfully!</p>
      </Modal>
      <Modal
        isOpen={showSaveApiSettingsModal}
        onClose={() => setShowApiSettingsModal(false)}
      >
        <h1>API Settings</h1>
        <p>Updated successfully!</p>
      </Modal>
    </div>
  );

}; // Add closing brace for Settings component

export default Settings;