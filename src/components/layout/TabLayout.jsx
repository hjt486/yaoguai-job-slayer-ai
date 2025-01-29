import React from 'react';
import { SITE_LOGO } from '../common/Constants';

const TabLayout = ({ activeTab, onTabChange, children }) => {
  return (
    <div>
      <nav>
        <ul><li>{SITE_LOGO()}</li></ul>
        <ul>
          <li>
            {activeTab === 'profiles' ? (
              <button
                onClick={() => onTabChange('profiles')}
                role="tab"
                aria-selected="true"
              >
                Profiles
              </button>
            ) : (
              <span
                onClick={() => onTabChange('profiles')}
                role="tab"
                aria-selected="false"
                style={{ cursor: 'pointer' }}
              >
                Profiles
              </span>
            )}
          </li>
          <li>
            {activeTab === 'resume' ? (
              <button
                onClick={() => onTabChange('resume')}
                role="tab"
                aria-selected="true"
              >
                Resume
              </button>
            ) : (
              <span
                onClick={() => onTabChange('resume')}
                role="tab"
                aria-selected="false"
                style={{ cursor: 'pointer' }}
              >
                Resume
              </span>
            )}
          </li>
          <li>
            {activeTab === 'match' ? (
              <button
                onClick={() => onTabChange('match')}
                role="tab"
                aria-selected="true"
              >
                Match
              </button>
            ) : (
              <span
                onClick={() => onTabChange('match')}
                role="tab"
                aria-selected="false"
                style={{ cursor: 'pointer' }}
              >
                Match
              </span>
            )}
          </li>
          <li>
            {activeTab === 'settings' ? (
              <button
                onClick={() => onTabChange('settings')}
                role="tab"
                aria-selected="true"
              >
                Settings
              </button>
            ) : (
              <span
                onClick={() => onTabChange('settings')}
                role="tab"
                aria-selected="false"
                style={{ cursor: 'pointer' }}
              >
                Settings
              </span>
            )}
          </li>
        </ul>
      </nav>
      <main>
        {children}
      </main>
    </div>
  );
};

export default TabLayout;