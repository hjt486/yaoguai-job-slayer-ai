import React from 'react';
import { SITE_LOGO } from '../Constants';

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
              <li
                onClick={() => onTabChange('profiles')}
                role="tab"
                aria-selected="false"
              >
                Profiles
              </li>
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
              <li
                onClick={() => onTabChange('resume')}
                role="tab"
                aria-selected="false"
              >
                Resume
              </li>
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
              <li
                onClick={() => onTabChange('match')}
                role="tab"
                aria-selected="false"
              >
                Match
              </li>
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
              <li
                onClick={() => onTabChange('settings')}
                role="tab"
                aria-selected="false"
              >
                Settings
              </li>
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