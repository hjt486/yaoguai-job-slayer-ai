import { storageService } from '../../services/storageService';

export const platformHandlers = {
  workday: {
    getInputSelectors() {
      const selectors = [
        'input[data-automation-id]',
        'select[data-automation-id]',
        'textarea[data-automation-id]',
        'input[aria-label]',
        'select[aria-label]',
        'textarea[aria-label]',
        '[data-automation-id="formField"]',
        '[data-automation-id="textInput"]',
        '[data-automation-id="selectInput"]',
        'button[aria-haspopup="listbox"]',
        'input.css-ilrio6',
        'select.css-ilrio6',
        'input[id^="input-"]',
        'select[id^="input-"]',
        '[data-automation-id*="legalNameSection"]',
        '[data-automation-id*="firstName"]',
        '[data-automation-id*="lastName"]',
        '[data-automation-id^="formField-"]',
        '[data-automation-id*="addressSection"]',
        '[data-automation-id*="countryDropdown"]',
        '[data-automation-id*="phoneType"]',
      ];

      console.log('[YaoguaiAI Debug] Workday selectors including application_misc:', selectors);

      // Debug: Log all matching elements for each selector
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          console.log('[YaoguaiAI Debug] Found application_misc elements:', {
            selector,
            count: elements.length,
            elements: Array.from(elements).map(el => ({
              tag: el.tagName,
              type: el.type,
              id: el.id,
              'data-automation-id': el.getAttribute('data-automation-id'),
              'aria-label': el.getAttribute('aria-label'),
              name: el.name,
              class: el.className,
              value: el.value,
              placeholder: el.placeholder,
              parentLabel: el.parentElement?.querySelector('label')?.textContent?.trim()
            }))
          });
        }
      });

      return selectors;
    },

    async handleFileUpload(input, profile) {
      const resumeKey = `resumePDF_${profile.id}`;
      const resumeData = storageService.get(resumeKey);
      if (!resumeData) {
        throw new Error('No resume file found');
      }

      // Try multiple selectors for the upload button
      const selectFileButton = document.querySelector([
        '[data-automation-id="select-files"]',
        '[aria-label*="upload"]',
        '[aria-label*="resume"]',
        'button:has(span:contains("Upload"))'
      ].join(','));

      if (selectFileButton) {
        selectFileButton.click();
        await new Promise(resolve => setTimeout(resolve, 500));

        // Try multiple selectors for the file input
        const fileInput = document.querySelector([
          '[data-automation-id="file-upload-input-ref"]',
          'input[type="file"]',
          '[aria-label*="file"]'
        ].join(','));

        if (fileInput) {
          const file = new File([resumeData], 'resume.pdf', { type: 'application/pdf' });
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          fileInput.files = dataTransfer.files;
          
          fileInput.dispatchEvent(new Event('change', { bubbles: true }));
          fileInput.dispatchEvent(new Event('input', { bubbles: true }));
          return true;
        }
      }
      return false;
    }
  },
  greenhouse: {
    async handleFileUpload(input, profile) {
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