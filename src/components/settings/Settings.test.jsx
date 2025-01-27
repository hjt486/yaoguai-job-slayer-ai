import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Settings from './Settings';

// Mock the services
// Update the authService mock to include updateUser
jest.mock('../../services/authService', () => ({
  authService: {
    getCurrentUser: jest.fn(() => ({ id: 'test-user-id', name: 'Test User', email: 'test@example.com' })),
    getUserApiSettings: jest.fn(() => Promise.resolve({ apiKey: 'test-key' })),
    updateUserApiSettings: jest.fn((userId, settings) => Promise.resolve({ success: true })),
    updateUser: jest.fn(() => Promise.resolve({ success: true }))
  }
}));

jest.mock('../../services/storageService', () => ({
  storageService: {
    getAsync: jest.fn(),
    setAsync: jest.fn(),
    removeAsync: jest.fn()
  }
}));

describe('Settings Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const storageService = require('../../services/storageService').storageService;
    storageService.getAsync.mockImplementation(() => Promise.resolve(null));
  });

  // Update the authService mock to include logout
  jest.mock('../../services/authService', () => ({
    authService: {
      getCurrentUser: jest.fn(() => ({ id: 'test-user-id', name: 'Test User', email: 'test@example.com' })),
      getUserApiSettings: jest.fn(() => Promise.resolve({ apiKey: 'test-key' })),
      updateUserApiSettings: jest.fn((userId, settings) => Promise.resolve({ success: true })),
      updateUser: jest.fn(() => Promise.resolve({ success: true })),
      logout: jest.fn(() => Promise.resolve())
    }
  }));
  
  // Update the test to be more specific
  test('renders settings form', async () => {
    await act(async () => {
      render(<Settings />);
    });
    expect(screen.getByRole('heading', { name: /API Settings/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/API Key/i)).toBeInTheDocument();
  });

  test('loads existing API key on mount', async () => {
    await act(async () => {
      render(<Settings />);
    });
    
    await waitFor(() => {
      const apiKeyInput = screen.getByLabelText(/API Key/i);
      expect(apiKeyInput.value).toBe('test-key');
    });
  });

  test('handles API key update', async () => {
    await act(async () => {
      render(<Settings />);
    });

    const apiKeyInput = screen.getByLabelText(/API Key/i);
    const saveButton = screen.getByText(/Save API Settings/i);

    await act(async () => {
      fireEvent.change(apiKeyInput, { target: { value: 'new-api-key' } });
      fireEvent.click(saveButton);
    });

    const authService = require('../../services/authService').authService;
    expect(authService.updateUserApiSettings).toHaveBeenCalledWith('test-user-id', {
      apiKey: 'new-api-key',
      apiEndpoint: '',
      modelName: '',
      userId: 'test-user-id'
    });
  });

  // Update error test to check console.error
  test('handles API error during save', async () => {
    const consoleSpy = jest.spyOn(console, 'error');
    const authService = require('../../services/authService').authService;
    authService.updateUserApiSettings.mockRejectedValueOnce(new Error('Failed to update'));
  
    await act(async () => {
      render(<Settings />);
    });
  
    const apiKeyInput = screen.getByLabelText(/API Key/i);
    const saveButton = screen.getByText(/Save API Settings/i);
  
    await act(async () => {
      fireEvent.change(apiKeyInput, { target: { value: 'new-api-key' } });
      fireEvent.click(saveButton);
    });
  
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to save API settings:',
      expect.any(Error)
    );
    consoleSpy.mockRestore();
  });

  test('handles user settings update', async () => {
    const authService = require('../../services/authService').authService;
    
    await act(async () => {
      render(<Settings />);
    });

    const firstNameInput = screen.getByLabelText(/First Name/i);
    const lastNameInput = screen.getByLabelText(/Last Name/i);
    const saveButton = screen.getByText(/Save User Settings/i);

    await act(async () => {
      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
      fireEvent.click(saveButton);
    });

    expect(authService.updateUser).toHaveBeenCalledWith('test-user-id', {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe'
    });
  });

  test('displays success message after saving API settings', async () => {
    await act(async () => {
      render(<Settings />);
    });

    const apiKeyInput = screen.getByLabelText(/API Key/i);
    const saveButton = screen.getByText(/Save API Settings/i);

    await act(async () => {
      fireEvent.change(apiKeyInput, { target: { value: 'new-api-key' } });
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/Updated successfully/i)).toBeInTheDocument();
    });
  });

  test('handles sign out', async () => {
    await act(async () => {
      render(<Settings />);
    });

    const signOutButton = screen.getByText(/Sign Out/i);
    
    await act(async () => {
      fireEvent.click(signOutButton);
    });

    const storageService = require('../../services/storageService').storageService;
    expect(storageService.removeAsync).toHaveBeenCalled();
  });

  test('handles user settings update', async () => {
    await act(async () => {
      render(<Settings />);
    });

    const firstNameInput = screen.getByLabelText(/First Name/i);
    const lastNameInput = screen.getByLabelText(/Last Name/i);
    const saveButton = screen.getByText(/Save User Settings/i);

    await act(async () => {
      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/Updated successfully/i)).toBeInTheDocument();
    });
  });
});