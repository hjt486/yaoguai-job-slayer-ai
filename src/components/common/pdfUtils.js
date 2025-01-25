import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { LABELS } from '../Constants';
import { formatDate } from './dateUtils';

const createResumeHTML = (profile) => {
  const container = document.createElement('div');
  container.className = 'resume-preview';
  container.style.cssText = `
    width: 8.5in;
    min-height: 11in;
    padding: 0.5in;
    margin: 0 auto;
    background: white;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    font-family: Arial, sans-serif;
  `;

  // Header
  const header = document.createElement('header');
  if (profile.personal) {
    const { name, email, phone, location, website, linkedin } = profile.personal;
    header.innerHTML = `
      ${name ? `<h1 style="margin: 0; font-size: 24px; text-align: center;">${name}</h1>` : ''}
      <div style="text-align: center; margin-top: 8px; font-size: 14px;">
        ${[email, phone, location, website, linkedin].filter(Boolean).join(' • ')}
      </div>
    `;
  }
  container.appendChild(header);

  // Skills
  if (profile.skills?.length > 0) {
    const skillsSection = document.createElement('section');
    skillsSection.innerHTML = `
      <h2 style="border-bottom: 1px solid #000; font-size: 16px; margin-top: 20px;">
        ${LABELS.sections.skills}
      </h2>
      <p style="margin-top: 8px; font-size: 14px; line-height: 1.4;">
        ${profile.skills.join(', ')}
      </p>
    `;
    container.appendChild(skillsSection);
  }

  // Experience
  if (profile.experience?.length > 0) {
    const expSection = document.createElement('section');
    expSection.innerHTML = `
      <h2 style="border-bottom: 1px solid #000; font-size: 16px; margin-top: 20px;">
        ${LABELS.sections.experience}
      </h2>
      ${profile.experience.map(exp => `
        <div style="margin-top: 12px;">
          <div style="display: flex; justify-content: space-between; font-weight: bold;">
            <span>${exp.company}</span>
            <span>${formatDate(exp.startDate)} - ${formatDate(exp.endDate)}</span>
          </div>
          <div style="font-style: italic;">${exp.title}</div>
          ${exp.responsibilities ? `
            <ul style="margin-top: 8px; padding-left: 20px;">
              ${exp.responsibilities.split('\n')
                .filter(r => r.trim())
                .map(r => `<li style="margin-bottom: 4px;">${r.trim()}</li>`)
                .join('')}
            </ul>
          ` : ''}
        </div>
      `).join('')}
    `;
    container.appendChild(expSection);
  }

  // Education
  if (profile.education?.length > 0) {
    const eduSection = document.createElement('section');
    eduSection.innerHTML = `
      <h2 style="border-bottom: 1px solid #000; font-size: 16px; margin-top: 20px;">
        ${LABELS.sections.education}
      </h2>
      ${profile.education.map(edu => `
        <div style="margin-top: 12px;">
          <div style="display: flex; justify-content: space-between; font-weight: bold;">
            <span>${edu.degree}</span>
            <span>${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}</span>
          </div>
          <div style="font-style: italic;">${edu.institution}</div>
          ${edu.achievements ? `
            <div style="margin-top: 4px;">${edu.achievements}</div>
          ` : ''}
        </div>
      `).join('')}
    `;
    container.appendChild(eduSection);
  }

  return container;
};

export const generatePDF = async (profile, type = 'resume') => {
  try {
    const resumeHTML = createResumeHTML(profile);
    document.body.appendChild(resumeHTML);

    const canvas = await html2canvas(resumeHTML, {
      scale: 2,
      useCORS: true,
      logging: false
    });

    document.body.removeChild(resumeHTML);

    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF({
      unit: 'px',
      format: 'letter'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth * ratio, imgHeight * ratio);
    return pdf;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return null;
  }
};

export const showResumePreview = (profile) => {
  const previewContainer = createResumeHTML(profile);
  return previewContainer;
};