import React from 'react';
import WorkdayForm from './WorkdayForm';

const TestForm = ({ entry }) => {
  const renderTestForm = () => {
    switch (entry) {
      case 'workday':
        return <WorkdayForm />;
      // Add more cases for other form types
      default:
        return <div>No test form selected</div>;
    }
  };

  return renderTestForm();
};

export default TestForm;