import { useState } from 'react';

const Settings = () => {
  const [apiKey, setApiKey] = useState('••••••••••••••••');
  const [apiEndpoint, setApiEndpoint] = useState('https://api.openai.com/v1');
  const [modelName, setModelName] = useState('gpt-4');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement save settings logic
  };

  return (
    <div>
      <article>
        <header>
          <h2>API Settings</h2>
        </header>
        <form onSubmit={handleSubmit}>
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
              placeholder="Enter API endpoint e.g. https://api.openai.com/v1"
            />
          </div>
          <div>
            <label htmlFor="modelName">Model Name</label>
            <input
              id="modelName"
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="Enter Model name e.g.: gpt-4"
            />
          </div>
          <button type="submit">Save API Settings</button>
        </form>
      </article>
      <article>
        <header>
          <h2>User Settings</h2>
        </header>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              required
            />
          </div>
          <div>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              required
            />
          </div>
          <div className="grid">
            <button type="submit">Save Changes</button>
          </div>
          <div className="grid"><button type="button" className="secondary" onClick={() => { }}>Sign Out</button></div>
        </form>
      </article>
    </div>
  );
};

export default Settings;