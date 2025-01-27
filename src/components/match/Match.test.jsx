import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Match from './Match';
import { authService } from '../../services/authService';
import { aiService } from '../common/aiService';
import { storageService } from '../../services/storageService';

// Mock the required services
jest.mock('../../services/authService');
jest.mock('../common/aiService');
jest.mock('../../services/storageService');

describe('Match Component', () => {
  const mockProfile = {
    id: 1,
    metadata: {
      profileName: 'Test Profile'
    }
  };

  const mockUser = { id: 'user123' };
  const mockApiSettings = { apiKey: 'test-key' };
  const mockSetActiveTab = jest.fn(); // Add mock function for setActiveTab
  const mockCurrentUser = { id: 'user123' }; // Add mock current user

  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default mock implementations
    authService.getCurrentUser.mockReturnValue(mockUser);
    authService.getUserApiSettings.mockReturnValue(mockApiSettings);
    storageService.get.mockImplementation((key) => {
      if (key === 'currentProfile') return JSON.stringify(mockProfile);
      return null;
    });
  });

  test('renders job description textarea', () => {
    render(<Match setActiveTab={mockSetActiveTab} />);
    expect(screen.getByPlaceholderText('Paste the job description here...')).toBeInTheDocument();
  });

  test('handles job description input', () => {
    render(<Match setActiveTab={mockSetActiveTab} />);
    const textarea = screen.getByPlaceholderText('Paste the job description here...');
    
    fireEvent.change(textarea, { target: { value: 'New job description' } });
    
    expect(textarea.value).toBe('New job description');
    expect(storageService.set).toHaveBeenCalledWith(
      `jobDescription_${mockCurrentUser.id}_${mockProfile.id}`,
      'New job description'
    );
  });

  test('handles analyze button click', async () => {
    const mockAnalysisResults = {
      missingKeywords: [
        { keyword: 'React', rating: 0, description: '' }
      ]
    };

    aiService.analyzeJobMatch.mockResolvedValueOnce(mockAnalysisResults);

    render(<Match setActiveTab={mockSetActiveTab} />);
    
    const textarea = screen.getByPlaceholderText('Paste the job description here...');
    fireEvent.change(textarea, { target: { value: 'Test job description' } });

    const analyzeButton = screen.getByText('Analyze');
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(screen.getByText('Missing Keywords (1)')).toBeInTheDocument();
      expect(screen.getByText('React')).toBeInTheDocument();
    });
  });

  test('handles analysis error', async () => {
    const errorMessage = 'Analysis failed';
    aiService.analyzeJobMatch.mockRejectedValueOnce(new Error(errorMessage));

    render(<Match setActiveTab={mockSetActiveTab} />);
    
    const textarea = screen.getByPlaceholderText('Paste the job description here...');
    fireEvent.change(textarea, { target: { value: 'Test job description' } });

    const analyzeButton = screen.getByText('Analyze');
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('handles keyword rating change', async () => {
    const mockAnalysisResults = {
      missingKeywords: [
        { keyword: 'React', rating: 0, description: '' }
      ]
    };

    aiService.analyzeJobMatch.mockResolvedValueOnce(mockAnalysisResults);

    render(<Match setActiveTab={mockSetActiveTab} />);
    
    // Trigger analysis to show results
    const textarea = screen.getByPlaceholderText('Paste the job description here...');
    fireEvent.change(textarea, { target: { value: 'Test job description' } });
    
    const analyzeButton = screen.getByText('Analyze');
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      const ratingInput = screen.getByRole('slider');
      fireEvent.change(ratingInput, { target: { value: '3' } });
      expect(screen.getByText('Rating: 3/5')).toBeInTheDocument();
    });
  });

  const mockAnalysisResults = {
    missingKeywords: [
      { 
        keyword: 'React', 
        rating: 0, 
        description: '',
        importance: 'high',
        context: 'Frontend development with React required'
      },
      { 
        keyword: 'TypeScript', 
        rating: 0, 
        description: '',
        importance: 'medium',
        context: 'Experience with TypeScript preferred'
      },
      { 
        keyword: 'AWS', 
        rating: 0, 
        description: '',
        importance: 'low',
        context: 'Basic understanding of AWS services'
      }
    ],
    matchScore: 75,
    feedback: 'Good match overall, but missing some key technical skills'
  };

  const mockEnhancedProfile = {
    ...mockProfile,
    experience: [
      {
        title: 'Senior Developer',
        company: 'Tech Corp',
        description: 'Enhanced description with React and TypeScript experience'
      }
    ],
    skills: ['React', 'TypeScript', 'AWS'],
    metadata: {
      ...mockProfile.metadata,
      profileName: 'Test Profile (Enhanced)',
      createdAt: '2023-01-01T00:00:00.000Z',
      lastModified: '2023-01-01T00:00:00.000Z'
    }
  };

  test('handles profile generation', async () => {
    // Mock the services with more detailed responses
    aiService.analyzeJobMatch.mockResolvedValueOnce(mockAnalysisResults);
    aiService.generateEnhancedProfile.mockResolvedValueOnce(mockEnhancedProfile);
    
    // Mock storage with more complete implementation
    const mockStorage = {
      [mockCurrentUser.id]: {}
    };
    
    storageService.get.mockImplementation((key) => {
      if (key === 'currentProfile') return JSON.stringify(mockProfile);
      if (key === 'userProfiles') return JSON.stringify(mockStorage);
      if (key.startsWith('jobDescription_')) return 'Test job description';
      if (key.startsWith('analysisResults_')) return JSON.stringify(mockAnalysisResults);
      return null;
    });

    render(<Match setActiveTab={mockSetActiveTab} />);
    
    // Trigger analysis first
    const textarea = screen.getByPlaceholderText('Paste the job description here...');
    fireEvent.change(textarea, { target: { value: 'Test job description' } });
    
    const analyzeButton = screen.getByText('Analyze');
    fireEvent.click(analyzeButton);

    // Wait for analysis results to appear
    await waitFor(() => {
      expect(screen.getByText('Missing Keywords (3)')).toBeInTheDocument();
    });

    // Click generate profile button
    const generateButton = screen.getByText('Generate New Profile');
    fireEvent.click(generateButton);

    // Wait for success modal and verify storage updates
    await waitFor(() => {
      // Check for modal title and content
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Profile Generation')).toBeInTheDocument();
      expect(screen.getByText('Enhanced profile generated successfully!')).toBeInTheDocument();
      
      // Verify storage updates
      expect(storageService.set).toHaveBeenCalledWith('currentProfile', expect.any(String));
      expect(storageService.set).toHaveBeenCalledWith('userProfiles', expect.any(String));
      expect(mockSetActiveTab).toHaveBeenCalledWith('resume');
    });
  });

  test('handles keyword description change', async () => {
    aiService.analyzeJobMatch.mockResolvedValueOnce(mockAnalysisResults);

    render(<Match setActiveTab={mockSetActiveTab} />);
    
    // Trigger analysis
    const textarea = screen.getByPlaceholderText('Paste the job description here...');
    fireEvent.change(textarea, { target: { value: 'Test job description' } });
    const analyzeButton = screen.getByText('Analyze');
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      const descriptionInput = screen.getAllByPlaceholderText('Describe your experience with this technology...')[0];
      fireEvent.change(descriptionInput, { target: { value: 'I have 5 years of React experience' } });
      expect(descriptionInput.value).toBe('I have 5 years of React experience');
    });
  });
});