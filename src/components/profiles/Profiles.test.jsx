import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Profiles from './Profiles';

// Mock the services
jest.mock('../../services/authService', () => ({
  authService: {
    getCurrentUser: jest.fn(() => ({ id: 'test-user-id', name: 'Test User' })),
    getUserApiSettings: jest.fn(() => Promise.resolve({ apiKey: 'test-key' }))
  }
}));

jest.mock('../../services/storageService', () => ({
  storageService: {
    getAsync: jest.fn(),
    setAsync: jest.fn(),
    removeAsync: jest.fn(),
    addChangeListener: jest.fn(),
    removeChangeListener: jest.fn()
  }
}));

jest.mock('../common/DocumentParser', () => ({
  parseDocument: jest.fn(() => Promise.resolve({ content: 'parsed content' }))
}));

jest.mock('../common/aiService', () => ({
  aiService: {
    parseResume: jest.fn(() => Promise.resolve({
      choices: [{
        message: {
          content: '```json\n{"personal":{"name":"Test User"}}\n```'
        }
      }]
    }))
  }
}));

describe('Profiles Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    // Setup default storage mock returns
    const storageService = require('../../services/storageService').storageService;
    storageService.getAsync.mockImplementation((key) => {
      if (key === 'userProfiles') {
        return Promise.resolve(JSON.stringify({
          'test-user-id': {
            1: {
              id: 1,
              metadata: { profileName: 'Test Profile' }
            }
          }
        }));
      }
      return Promise.resolve(null);
    });
  });

  test('renders Add New Profile button', async () => {
    await act(async () => {
      render(<Profiles />);
    });
    const addButton = screen.getByText(/Add New Profile/i);
    expect(addButton).toBeInTheDocument();
  });

  test('opens paste dialog when input is clicked', async () => {
    await act(async () => {
      render(<Profiles />);
    });
    const input = screen.getByPlaceholderText(/or paste a resume here/i);
    fireEvent.click(input);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeVisible();
  });

  test('displays error message when invalid file is selected', async () => {
    await act(async () => {
      render(<Profiles />);
    });
    const fileInput = screen.getByTestId('file-input');
    const file = new File(['dummy content'], 'test.invalid', { type: 'invalid/type' });
    
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    expect(screen.getByText(/Please select a valid file/i)).toBeInTheDocument();
  });

  test('handles valid file upload and parsing', async () => {
    await act(async () => {
      render(<Profiles />);
    });
    
    const fileInput = screen.getByTestId('file-input');
    const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
    
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    const parseButton = screen.getByText('Parse');
    await act(async () => {
      fireEvent.click(parseButton);
    });

    await waitFor(() => {
      expect(screen.queryByText(/Analyzing resume content/i)).not.toBeInTheDocument();
    });
  });

  test('creates new profile when Add New Profile is clicked', async () => {
    await act(async () => {
      render(<Profiles />);
    });
    
    const addButton = screen.getByText(/Add New Profile/i);
    await act(async () => {
      fireEvent.click(addButton);
    });

    const storageService = require('../../services/storageService').storageService;
    expect(storageService.setAsync).toHaveBeenCalled();
  });

  test('handles profile deletion', async () => {
    await act(async () => {
      render(<Profiles />);
    });
    
    const deleteButton = screen.getByText('Delete');
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    const storageService = require('../../services/storageService').storageService;
    expect(storageService.removeAsync).toHaveBeenCalled();
  });

  test('handles profile copy', async () => {
    await act(async () => {
      render(<Profiles />);
    });
    
    const copyButton = screen.getByText('Copy');
    await act(async () => {
      fireEvent.click(copyButton);
    });

    const storageService = require('../../services/storageService').storageService;
    expect(storageService.setAsync).toHaveBeenCalled();
  });

  test('handles paste dialog confirmation', async () => {
    await act(async () => {
      render(<Profiles />);
    });
    
    const input = screen.getByPlaceholderText(/or paste a resume here/i);
    fireEvent.click(input);
    
    const textarea = screen.getByPlaceholderText(/Paste your resume text here/i);
    fireEvent.change(textarea, { target: { value: 'Test resume content' } });
    
    const confirmButton = screen.getByText('Confirm');
    await act(async () => {
      fireEvent.click(confirmButton);
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('loads existing profiles on mount', async () => {
    await act(async () => {
      render(<Profiles />);
    });

    expect(screen.getByText('Test Profile')).toBeInTheDocument();
  });

  test('handles API errors during parsing', async () => {
    const aiService = require('../common/aiService').aiService;
    aiService.parseResume.mockRejectedValueOnce(new Error('API Error'));

    await act(async () => {
      render(<Profiles />);
    });
    
    const fileInput = screen.getByTestId('file-input');
    const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
    
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    const parseButton = screen.getByText('Parse');
    await act(async () => {
      fireEvent.click(parseButton);
    });

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });
});