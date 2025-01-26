import * as pdfjsLib from 'pdfjs-dist';
import { GlobalWorkerOptions } from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.js';

// Configure PDF.js worker
GlobalWorkerOptions.workerSrc = workerSrc;

const processText = (text) => {
  // Basic text cleanup
  const cleanedText = text
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return {
    content: cleanedText,
    originalLength: text.length,
    finalLength: cleanedText.length
  };
};

export const parseDocument = async (file) => {
  try {
    if (!file) throw new Error('No file provided');

    let text = '';
    
    if (file.type === 'application/pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer,
        standardFontDataUrl: 'built-in',
        disableFontFace: true,
        useSystemFonts: true
      }).promise;

      const textContent = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        textContent.push(content.items.map(item => item.str).join(' '));
      }
      text = textContent.join('\n');
    }
    // ... rest of file type cases

    return processText(text);
  } catch (error) {
    console.error('Document parsing error:', error);
    throw new Error(`Failed to parse document: ${error.message}`);
  }
};

