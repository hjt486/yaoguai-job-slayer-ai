import * as pdfjs from 'pdfjs-dist';

// Use the correct version (3.11.174)
const PDFJS_VERSION = '3.11.174';
pdfjs.GlobalWorkerOptions.workerSrc = 
  `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.js`;

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
      const pdf = await pdfjs.getDocument({
        data: arrayBuffer,
        cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/cmaps/`,
        cMapPacked: true
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

