import { storageService } from '../../services/storageService';
import { PLATFORM_PATTERNS, PLATFORM_VALUE_MAPPINGS } from './platformPatterns';

// Export as default to ensure it's properly bundled
export const platformHandlers = {
  workday: {
    getInputSelectors() {
      // Get all selectors from platformPatterns.js
      const fields = PLATFORM_PATTERNS.workday.fields;
      const selectors = Object.values(fields).reduce((acc, field) => {
        return acc.concat(field.selectors.map(selector => {
          // Don't modify selectors that are already complete CSS selectors
          if (selector.includes('[') || selector.includes('.') || 
              selector.includes('#') || selector.includes('input') ||
              selector.includes('button')) {
            return selector;
          }
          // Generate both case variations for data-automation-id
          return [
            `[data-automation-id="${selector}"]`,
            `[data-automation-id="${selector.toLowerCase()}"]`
          ];
        })).flat();
      }, []);

      // Remove duplicates
      const uniqueSelectors = [...new Set(selectors)];
      console.log('[YaoguaiAI Debug] Workday selectors from platformPatterns:', uniqueSelectors);

      return uniqueSelectors;
    },

    async handleDropdown(input, value, fieldType) {
      console.log('[YaoguaiAI] Handling Workday dropdown:', { fieldType, value });
      
      // Ensure any existing dropdown is closed first
      const existingListbox = document.querySelector('[role="listbox"]');
      if (existingListbox) {
        document.body.click(); // Click outside to close existing dropdown
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Click to open the dropdown
      input.click();
      await new Promise(resolve => setTimeout(resolve, 500));

      // Find the listbox with retry
      let listbox = document.querySelector('[role="listbox"]');
      let retries = 0;
      while (!listbox && retries < 3) {
        console.log('[YaoguaiAI] Waiting for listbox to appear...');
        await new Promise(resolve => setTimeout(resolve, 500));
        listbox = document.querySelector('[role="listbox"]');
        retries++;
      }

      if (!listbox) {
        throw new Error('Dropdown listbox not found after retries');
      }

      // Get all options after dropdown is fully loaded
      const options = Array.from(document.querySelectorAll('[role="option"]'))
        .filter(opt => opt.textContent !== 'select one');

      let result = false;

      try {
        // For country field
        if (fieldType === 'country') {
          const countryOptions = options.filter(opt => 
            opt.textContent.toLowerCase() === 'united states of america' ||
            opt.textContent.toLowerCase() === 'canada'
          );
          
          const matchingOption = countryOptions.find(opt => 
            opt.textContent.toLowerCase() === 'united states of america'
          );

          if (matchingOption) {
            matchingOption.click();
            result = true;
          }
        }
        // For state field
        else if (fieldType === 'state') {
          const stateOptions = options.filter(opt => 
            !opt.textContent.toLowerCase().includes('select one')
          );

          const mappedValue = this.getValueMapping(fieldType, value);
          const matchingOption = stateOptions.find(opt => 
            opt.textContent.toLowerCase() === mappedValue.toLowerCase()
          );

          if (matchingOption) {
            matchingOption.click();
            result = true;
          }
        }
        // For phone type
        else if (fieldType === 'phone_type') {
          const phoneTypeOptions = options.filter(opt => 
            !opt.textContent.toLowerCase().includes('select one')
          );
          
          const matchingOption = phoneTypeOptions.find(opt => 
            opt.textContent.toLowerCase() === 'mobile'
          );

          if (matchingOption) {
            matchingOption.click();
            result = true;
          }
        }

        // Ensure dropdown is closed after selection
        await new Promise(resolve => setTimeout(resolve, 500));
        const dropdownStillOpen = document.querySelector('[role="listbox"]');
        if (dropdownStillOpen) {
          document.body.click(); // Click outside to force close
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        if (!result) {
          throw new Error(`No matching option found for ${fieldType}: ${value}`);
        }

        return result;

      } catch (error) {
        // Ensure dropdown is closed even if there's an error
        document.body.click();
        await new Promise(resolve => setTimeout(resolve, 500));
        throw error;
      }
    },

    getValueMapping(fieldType, value) {
      if (PLATFORM_VALUE_MAPPINGS[fieldType]?.workday) {
        const stateEntry = Object.entries(PLATFORM_VALUE_MAPPINGS[fieldType].workday)
          .find(([_, patterns]) => patterns.some(pattern => 
            pattern.toLowerCase() === value.toLowerCase()
          ));
        if (stateEntry) {
          return stateEntry[0];
        }
      }
      return value;
    },

    async handleFileUpload(input, profile) {
      console.log('[YaoguaiAI] Starting Workday resume upload...');
      
      // Get resume data
      const resumeKey = `resumePDF_${profile.id}`;
      const resumeData = storageService.get(resumeKey);
      
      let file;
      // Fallback to original resume if PDF not found
      if (!resumeData) {
        const originalResumeKey = `resume_${profile.id}`;
        const originalResume = JSON.parse(storageService.get(originalResumeKey));
        if (!originalResume) {
          throw new Error('No resume file found');
        }
        
        // Handle original resume
        file = await fetch(originalResume.content)
          .then(res => res.blob())
          .then(blob => new File([blob], originalResume.name, { type: 'application/pdf' }));
      } else {
        // Handle PDF resume
        file = new File([resumeData], 'resume.pdf', { type: 'application/pdf' });
      }

      // Create and set the file
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;

      // Trigger events
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.dispatchEvent(new Event('input', { bubbles: true }));

      // Find and update file name display - updated selector to match new structure
      const dropZone = input.closest('[data-automation-id="file-upload-drop-zone"]');
      if (dropZone) {
        // Try to find existing file name display or create one
        let fileNameDisplay = dropZone.querySelector('.css-file-name');
        if (!fileNameDisplay) {
          fileNameDisplay = document.createElement('div');
          fileNameDisplay.className = 'css-file-name';
          dropZone.appendChild(fileNameDisplay);
        }
        fileNameDisplay.textContent = `Uploaded: ${file.name}`;
      }

      return true;
    }
  },
  greenhouse: {
    async handleFileUpload(input, profile) {
      // First try to get the generated PDF
      const pdfResumeKey = `resumePDF_${profile.id}`;
      const pdfResume = storageService.get(pdfResumeKey);
      
      // If no PDF, try to get the original uploaded resume
      if (!pdfResume) {
        const originalResumeKey = `resume_${profile.id}`;
        const originalResume = JSON.parse(storageService.get(originalResumeKey));
        
        if (!originalResume) {
          throw new Error('No resume file found');
        }
      
        // Use the original resume
        const file = await fetch(originalResume.content)
          .then(res => res.blob())
          .then(blob => new File([blob], originalResume.name, { type: 'application/pdf' }));
      
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
      } else {
        // Use the generated PDF
        const file = await fetch(pdfResume)
          .then(res => res.blob())
          .then(blob => new File([blob], 'resume.pdf', { type: 'application/pdf' }));
      
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
      }
      
      input.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
  },
  // Add other platform handlers as needed
};

export const handleFileUpload = async (input, profile, platform) => {
  if (platform && platformHandlers[platform]?.handleFileUpload) {
    return await platformHandlers[platform].handleFileUpload(input, profile);
  }
  
  // Default file upload handling
  const resumeKey = `resumePDF_${profile.id}`;
  const resumeData = storageService.get(resumeKey);
  if (!resumeData) {
    throw new Error('No resume file found');
  }

  const file = new File([resumeData], 'resume.pdf', { type: 'application/pdf' });
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  input.files = dataTransfer.files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
};

// Add new function to get platform-specific selectors
export const getPlatformSelectors = (platform) => {
  console.log('[YaoguaiAI Debug] Getting selectors for platform:', platform);
  
  const selectors = platform && platformHandlers[platform]?.getInputSelectors?.() || [
    'input:not([type="hidden"])',
    'select',
    'textarea'
  ];

  console.log('[YaoguaiAI Debug] Using selectors:', {
    platform,
    selectorCount: selectors.length,
    selectors
  });

  return selectors;
};

export const getValueMapping = (type, value, platform) => {
  // Check platform-specific mappings first
  if (platform && PLATFORM_VALUE_MAPPINGS[type]?.[platform]) {
    const platformMappings = PLATFORM_VALUE_MAPPINGS[type][platform];
    for (const [mappedValue, patterns] of Object.entries(platformMappings)) {
      if (patterns.includes(value.toLowerCase())) {
        return mappedValue;
      }
    }
  }

  // Fall back to generic mappings
  if (VALUE_MAPPINGS[type]) {
    for (const [mappedValue, patterns] of Object.entries(VALUE_MAPPINGS[type])) {
      if (patterns.includes(value.toLowerCase())) {
        return mappedValue;
      }
    }
  }
  return value;
};