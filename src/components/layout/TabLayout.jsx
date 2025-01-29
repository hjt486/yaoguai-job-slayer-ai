import React from 'react';
import { SITE_LOGO } from '../common/Constants';

const TabLayout = ({ activeTab, onTabChange, children }) => {
  const tabs = [
    { id: 'profiles', label: 'Profiles' },
    { id: 'resume', label: 'Resume' },
    { id: 'match', label: 'Match' },
    { id: 'settings', label: 'Settings' },
  ];

  if (window.DEBUG) {
    tabs.push({ id: 'test', label: 'Test' });
  }

  return (
    <div>
      <nav>
        <ul><li>{SITE_LOGO()}</li></ul>
        <ul>
          {tabs.map(({ id, label }) => (
            <li key={id}>
              {activeTab === id ? (
                <button
                  onClick={() => onTabChange(id)}
                  role="tab"
                  aria-selected="true"
                >
                  {label}
                </button>
              ) : (
                <span
                  onClick={() => onTabChange(id)}
                  role="tab"
                  aria-selected="false"
                  style={{ cursor: 'pointer' }}
                >
                  {label}
                </span>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <main>
        {children}
      </main>
    </div>
  );
};

export default TabLayout;