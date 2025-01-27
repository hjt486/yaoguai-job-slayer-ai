import { jsPDF } from 'jspdf';
import { formatDate } from './dateUtils';
import moment from 'moment';

const isExtension = typeof chrome !== 'undefined' && chrome.runtime;

const storageHelper = {
  async get(key) {
    if (isExtension) {
      const result = await chrome.storage.local.get(key);
      return result[key];
    }
    return localStorage.getItem(key);
  },

  async set(key, value) {
    if (isExtension) {
      await chrome.storage.local.set({ [key]: value });
    } else {
      localStorage.setItem(key, value);
    }
  }
};

// Update the generatePDF function
export const generatePDF = async (profile, fileName, profileId, isCoverLetter = false) => {
  try {
    const pdf = new jsPDF({
      unit: 'pt',
      format: 'letter',
      orientation: 'portrait'
    });

    // Set default font and margins
    pdf.setFont('helvetica');
    const margin = 50;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const usableWidth = pageWidth - (2 * margin);
    let yPos = margin;

    // Helper functions
    const addSectionHeader = (title) => {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      const textWidth = pdf.getTextWidth(title);
      pdf.line(margin, yPos + 5, pageWidth - margin, yPos + 5);
      pdf.text(title, margin, yPos);
      yPos += 25;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
    };

    const checkNewPage = () => {
      if (yPos > pdf.internal.pageSize.getHeight() - margin) {
        pdf.addPage();
        yPos = margin;
      }
    };

    if (isCoverLetter) {
      // Header with contact info
      pdf.setFontSize(12);
      pdf.text(profile.personal?.fullName || '', margin, yPos);
      yPos += 20;

      const contactInfo = [
        profile.personal?.email || "",
        profile.personal?.phone || "",
        profile.personal?.location || "",
      ].filter(Boolean);

      // Date
      pdf.text(moment().format('MMMM D, YYYY'), margin, yPos);

      yPos += 20;

      contactInfo.forEach(info => {
        pdf.text(info, margin, yPos);
        yPos += 15;
      });

      yPos += 40;

      // Cover Letter content
      if (profile.coverLetter) {
        const paragraphs = profile.coverLetter.split('\n\n');
        paragraphs.forEach(paragraph => {
          checkNewPage();
          const lines = pdf.splitTextToSize(paragraph, usableWidth);
          pdf.text(lines, margin, yPos);
          yPos += (lines.length * 15) + 20;
        });
      }

      // Closing
      checkNewPage();
    } else {

      // Personal Information
      if (profile.personal) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(profile.personal.fullName || '', pageWidth / 2, yPos, { align: 'center' });

        yPos += 20;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const contactInfo = [
          profile.personal.email,
          profile.personal.phone,
          profile.personal.website,
          profile.personal.linkedin,
          profile.personal.location
        ].filter(Boolean).join(' • ');

        const contactLines = pdf.splitTextToSize(contactInfo, usableWidth);
        pdf.text(contactLines, pageWidth / 2, yPos, { align: 'center' });
        yPos += (contactLines.length * 12) + 20;

        if (profile.personal.summary) {
          addSectionHeader('Summary');
          const summaryLines = pdf.splitTextToSize(profile.personal.summary, usableWidth);
          pdf.text(summaryLines, margin, yPos);
          yPos += (summaryLines.length * 12) + 20;
        }
      }

      // Skills
      if (profile.skills?.length > 0) {
        checkNewPage();
        addSectionHeader('Skills');
        const skillsText = profile.skills.join(' • ');
        const lines = pdf.splitTextToSize(skillsText, usableWidth);
        pdf.text(lines, margin, yPos);
        yPos += (lines.length * 12) + 20;
      }

      // Experience
      if (profile.experience?.length > 0 && profile.experience.some(exp => exp.company || exp.jobTitle)) {
        checkNewPage();
        addSectionHeader('Experience');
        profile.experience.forEach(exp => {
          if (!exp.company && !exp.jobTitle) return; // Skip empty entries
          checkNewPage();
          pdf.setFont('helvetica', 'bold');
          pdf.text(exp.company || '', margin, yPos);
          const dateText = `${formatDate(exp.startDate)} - ${exp.endDate ? formatDate(exp.endDate) : 'Present'}`;
          pdf.text(dateText, pageWidth - margin - pdf.getTextWidth(dateText), yPos);

          yPos += 15;
          pdf.setFont('helvetica', 'italic');
          const titleLocation = `${exp.jobTitle}${exp.location ? ` - ${exp.location}` : ''}`;
          pdf.text(titleLocation, margin, yPos);
          yPos += 15;

          if (exp.responsibilities) {
            pdf.setFont('helvetica', 'normal');
            const bullets = exp.responsibilities.split('\n').filter(r => r.trim());
            bullets.forEach(bullet => {
              checkNewPage();
              const bulletText = `• ${bullet}`;
              const lines = pdf.splitTextToSize(bulletText, usableWidth - 10);
              pdf.text(lines, margin + 10, yPos);
              yPos += (lines.length * 12);
            });
          }
          yPos += 15;
        });
      }

      // Education
      if (profile.education?.length > 0 && profile.education.some(edu => edu.school || edu.degree)) {
        checkNewPage();
        addSectionHeader('Education');
        profile.education.forEach(edu => {
          if (!edu.school && !edu.degree) return; // Skip empty entries
          checkNewPage();
          pdf.setFont('helvetica', 'bold');
          pdf.text(edu.school || '', margin, yPos);
          const dateText = `${formatDate(edu.startDate)} - ${edu.endDate ? formatDate(edu.endDate) : 'Present'}`;
          pdf.text(dateText, pageWidth - margin - pdf.getTextWidth(dateText), yPos);

          yPos += 15;
          if (edu.degree || edu.field) {
            pdf.setFont('helvetica', 'italic');
            const degreeField = [edu.degree, edu.field].filter(Boolean).join(' - ');
            pdf.text(degreeField, margin, yPos);
            yPos += 15;
          }

          if (edu.achievements) {
            pdf.setFont('helvetica', 'normal');
            const lines = pdf.splitTextToSize(edu.achievements, usableWidth);
            pdf.text(lines, margin, yPos);
            yPos += (lines.length * 12);
          }
          yPos += 15;
        });
      }

      // Projects
      if (profile.projects?.length > 0 && profile.projects.some(proj => proj.name || proj.description)) {
        checkNewPage();
        addSectionHeader('Projects');
        profile.projects.forEach(proj => {
          if (!proj.name && !proj.description) return; // Skip empty entries
          checkNewPage();
          pdf.setFont('helvetica', 'bold');
          pdf.text(proj.name || '', margin, yPos);
          if (proj.startDate) {
            const dateText = `${formatDate(proj.startDate)} - ${proj.endDate ? formatDate(proj.endDate) : 'Present'}`;
            pdf.text(dateText, pageWidth - margin - pdf.getTextWidth(dateText), yPos);
          }
          yPos += 15;

          if (proj.description) {
            pdf.setFont('helvetica', 'normal');
            const lines = pdf.splitTextToSize(proj.description, usableWidth);
            pdf.text(lines, margin, yPos);
            yPos += (lines.length * 12) + 15;
          }
        });
      }

      // Certifications
      if (profile.certifications?.length > 0 && profile.certifications.some(cert => cert.name || cert.issuer)) {
        checkNewPage();
        addSectionHeader('Certifications');
        profile.certifications.forEach(cert => {
          if (!cert.name && !cert.issuer) return; // Skip empty entries
          checkNewPage();
          pdf.setFont('helvetica', 'bold');
          pdf.text(cert.name || '', margin, yPos);
          
          if (cert.awardedDate) {
            const dateText = formatDate(cert.awardedDate);
            pdf.text(dateText, pageWidth - margin - pdf.getTextWidth(dateText), yPos);
          }

          if (cert.issuer) {
            yPos += 15;
            pdf.setFont('helvetica', 'italic');
            pdf.text(cert.issuer, margin, yPos);
          }
          
          yPos += 20;
        });
      }

      // Achievements
      if (profile.achievements?.length > 0 && profile.achievements.some(ach => ach.name || ach.description)) {
        checkNewPage();
        addSectionHeader('Achievements');
        profile.achievements.forEach(ach => {
          if (!ach.name && !ach.description) return; // Skip empty entries
          checkNewPage();
          if (ach.name) {
            pdf.setFont('helvetica', 'bold');
            const achievementHeader = `${ach.name}${ach.issuer ? ` from ${ach.issuer}` : ''}`;
            const lines = pdf.splitTextToSize(achievementHeader, usableWidth - 150); // Reserve space for date
            pdf.text(lines, margin, yPos);

            if (ach.awardedDate) {
              const dateText = formatDate(ach.awardedDate);
              pdf.text(dateText, pageWidth - margin - pdf.getTextWidth(dateText), yPos);
            }

            yPos += (lines.length * 12);
          }

          if (ach.description) {
            pdf.setFont('helvetica', 'normal');
            const lines = pdf.splitTextToSize(ach.description, usableWidth);
            pdf.text(lines, margin, yPos);
            yPos += (lines.length * 12) + 10;
          }
        });
      }
    }


    // Store PDF in localStorage with profile-specific keys
    const pdfData = pdf.output('dataurlstring');
    await storageHelper.set(`generatedPDF_${profile.id || profileId}`, pdfData);
    await storageHelper.set(`pdfTimestamp_${profile.id || profileId}`, new Date().toISOString());
    await storageHelper.set(`pdfFileName_${profile.id || profileId}`, fileName);

    const pdfKey = isCoverLetter ? `coverLetter_${profileId}` : `generatedPDF_${profileId}`;
    const fileNameKey = isCoverLetter ? `coverLetterFileName_${profileId}` : `pdfFileName_${profileId}`;

    await storageHelper.set(pdfKey, pdfData);
    await storageHelper.set(fileNameKey, fileName);

    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};

// Update the downloadStoredPDF function
export const downloadStoredPDF = async (profileId, isCoverLetter = false) => {
  const pdfKey = isCoverLetter ? `coverLetter_${profileId}` : `generatedPDF_${profileId}`;
  const fileNameKey = isCoverLetter ? `coverLetterFileName_${profileId}` : `pdfFileName_${profileId}`;

  try {
    const [pdfData, fileName] = await Promise.all([
      storageHelper.get(pdfKey),
      storageHelper.get(fileNameKey)
    ]);

    if (!pdfData || !fileName) return false;

    const link = document.createElement('a');
    link.href = pdfData;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (error) {
    console.error('Error downloading PDF:', error);
    return false;
  }
};