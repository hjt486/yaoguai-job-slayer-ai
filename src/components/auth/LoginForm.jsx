import { useState, useEffect } from 'react';
import { SITE_LOGO } from '../common/Constants';
import Register from './Register';
import { authService } from '../../services/authService';

const LAST_EMAIL_KEY = 'lastUsedEmail';
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

const LoginForm = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginForm, setLoginForm] = useState({ 
    email: '', 
    password: '' 
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load last used email on component mount
  useEffect(() => {
    const loadLastEmail = async () => {
      const lastEmail = await storageHelper.get(LAST_EMAIL_KEY);
      if (lastEmail) {
        setLoginForm(prev => ({ ...prev, email: lastEmail }));
      }
    };
    loadLastEmail();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await storageHelper.set(LAST_EMAIL_KEY, loginForm.email);
      const response = await authService.login(loginForm);
      console.log('Login successful:', response);
      onLogin(response);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (registerData) => {
    try {
      const response = await authService.register(registerData);
      console.log('Registration successful:', response);
      setLoginForm({
        email: response.email,
        password: ''
      });
      await storageHelper.set(LAST_EMAIL_KEY, response.email);
    } catch (error) {
      throw error;
    }
  };

  if (isRegistering) {
    return <Register 
      onRegister={handleRegister}
      onToggleForm={() => setIsRegistering(false)}
    />;
  }

  return (
    <article>
      <div>
        <hgroup>
          {SITE_LOGO()}
        </hgroup>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={loginForm.email}
            onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={loginForm.password}
            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
            required
          />
          {error && <small style={{ color: 'red' }}>{error}</small>}
          <button type="submit" aria-busy={isLoading} disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <footer>
          <div className='grid' style={{textAlign: 'right'}}>
            <p>Don't have an account? 
              <a href="#" role="button" onClick={(e) => {
                e.preventDefault();
                setIsRegistering(true);
              }}>
                Register
              </a>
            </p>
          </div>
        </footer>
      </div>
    </article>
  );
};

export default LoginForm;