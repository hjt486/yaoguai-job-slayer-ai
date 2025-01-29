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
      console.log('[YaoguaiAI] Starting Workday resume upload...');
      
      const resumeKey = `resumePDF_${profile.id}`;
      const resumeData = storageService.get(resumeKey);
      if (!resumeData) {
        throw new Error('No resume file found');
      }

      // Ensure the correct selector is used for the file input
      const fileInputSelectors = [
        '[data-automation-id="file-upload-input-ref"]',
        'input[type="file"]'
      ];

      const fileInput = document.querySelector(fileInputSelectors.join(','));

      if (fileInput) {
        console.log('[YaoguaiAI] Found file input, injecting file...');
        const file = new File([resumeData], 'resume.pdf', { type: 'application/pdf' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
        
        // Dispatch both change and input events
        fileInput.dispatchEvent(new Event('change', { bubbles: true }));
        fileInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        console.log('[YaoguaiAI] Resume upload completed');
        return true;
      } else {
        throw new Error('File input not found');
      }
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