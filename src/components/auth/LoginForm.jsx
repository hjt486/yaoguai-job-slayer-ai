import { useState } from 'react';
import {SITE_LOGO} from '../Constants'

const LoginForm = ({ onLogin }) => {
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  const handleLogin = (e) => {
    e.preventDefault();
    // TODO: Implement login logic
    onLogin();
  };

  return (
    <article>
      <div>
        <hgroup>
          {SITE_LOGO()}
        </hgroup>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={loginForm.username}
            onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={loginForm.password}
            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
            required
          />
          <button type="submit">Login</button>
        </form>
        <footer>
          <div className='grid' style={{textAlign: 'right'}}>
            <p>Don't have an account? <a href="#" role="button">Register</a></p>
          </div>
        </footer>
      </div>
    </article>
  );
};

export default LoginForm;