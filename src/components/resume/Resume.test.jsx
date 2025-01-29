// Mock other necessary modules
jest.mock('../../components/common/Constants', () => ({
  DEFAULT_PROFILE_STRUCTURE: {
    skills: [''],
    experience: [{ title: '', company: '', description: '' }]
  },
  LABELS: {
    sections: {
      personal: { name: 'Personal Information', fields: {} },
      skills: { name: 'Skills', fields: {} },
      experience: { name: 'Experience', fields: {} }
    },
    actions: {
      edit: 'Edit',
      save: 'Save',
      cancel: 'Cancel'
    }
  },
  TEXTAREA_FIELDS: ['description'],
  DATE_TIME_FIELDS: [],
  DATE_FIELDS: [],
  NOT_EDITABLE_FIELDS: [],
  ARRAY_SECTIONS: ['skills', 'experience'],
  BOOLEAN_FIELDS: [],
  APPLICATION_ONLY_SECTIONS: []
}));

jest.mock('../../components/autofill/Autofill', () => ({
  showFloatingPage: jest.fn()
}));

// Rest of your imports
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Resume, { ResumeSection } from './Resume';
import { authService } from '../../services/authService';
import { storageService } from '../../services/storageService';

// Remove PDF utils import and mock
jest.mock('../../services/authService');
jest.mock('../../services/storageService');

describe('Resume Component', () => {
  const mockProfile = {
    id: 1,
    personal: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com'
    },
    metadata: {
      profileName: 'Test Profile',
      targetRole: 'Software Engineer',
      targetCompany: 'Tech Corp'
    },
    skills: ['React', 'JavaScript'],
    experience: [
      {
        title: 'Senior Developer',
        company: 'Tech Corp',
        description: 'Led development team'
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    authService.getCurrentUser.mockReturnValue({ id: 'user123' });
    storageService.get.mockImplementation((key) => {
      if (key === 'currentProfile') return JSON.stringify(mockProfile);
      return null;
    });
  });

  test('renders profile data when available', () => {
    render(<Resume />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  test('shows create profile message when no profile exists', () => {
    storageService.get.mockReturnValue(null);
    render(<Resume />);
    
    expect(screen.getByText('Please create a profile')).toBeInTheDocument();
  });

  // Remove the 'handles PDF generation' test
  test('handles section editing', async () => {
    render(<Resume />);

    // Find and click edit button for personal section
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    // Find input field and change value
    const fullNameInput = screen.getByDisplayValue('John Doe');
    fireEvent.change(fullNameInput, { target: { value: 'Jane Doe' } });

    // Save changes
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    expect(storageService.set).toHaveBeenCalledWith(
      'currentProfile',
      expect.any(String)
    );
  });

  test('handles skill addition and deletion', async () => {
    render(<Resume />);

    // Find and click edit button for skills section
    const editButtons = screen.getAllByText('Edit');
    const skillsEditButton = editButtons[1]; // Update index to target skills section
    fireEvent.click(skillsEditButton);

    // Find input field and enter a skill
    const inputs = screen.getAllByRole('textbox');
    const newSkillInput = inputs[0]; // First input in skills section
    fireEvent.change(newSkillInput, { target: { value: 'Python' } });

    // Save changes
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    expect(storageService.set).toHaveBeenCalled();
  });
});

// Test ResumeSection component separately
describe('ResumeSection Component', () => {
  const mockOnEdit = jest.fn();
  const mockOnSave = jest.fn();

  const mockSectionProps = {
    section: 'personal',
    title: 'Personal Information',
    data: {
      fullName: 'John Doe',
      email: 'john@example.com'
    },
    profile: { id: 1 },
    onEdit: mockOnEdit,
    onSave: mockOnSave
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders section content correctly', () => {
    render(<ResumeSection {...mockSectionProps} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  test('handles edit mode toggle', () => {
    render(<ResumeSection {...mockSectionProps} />);

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
  });

  test('handles save and cancel', () => {
    render(<ResumeSection {...mockSectionProps} />);

    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));

    // Make changes
    const input = screen.getByDisplayValue('John Doe');
    fireEvent.change(input, { target: { value: 'Jane Doe' } });

    // Save changes
    fireEvent.click(screen.getByText('Save'));
    expect(mockOnSave).toHaveBeenCalled();

    // Test cancel
    fireEvent.click(screen.getByText('Edit'));
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnEdit).toHaveBeenCalledWith('personal', {
      action: 'restore',
      value: mockSectionProps.data
    });
  });
});