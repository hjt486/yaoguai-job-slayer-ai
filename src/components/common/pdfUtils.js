import { jsPDF } from 'jspdf';
import { formatDate } from './dateUtils';
import moment from 'moment';
import { storageService } from '../../services/storageService';

const SPACING = {
  base: 10,          // Reduced from 12
  sectionGap: 5,    // Reduced from 20
  headerGap: 15,     // Reduced from 25
  minScale: 0.15,    // Allows for tighter compression
  maxScale: 1.2      // Keep the same max expansion
};

export const generatePDF = async (profile, fileName, profileId, isCoverLetter = false) => {
  try {
    const pdf = new jsPDF({
      unit: 'pt',
      format: 'letter',
      orientation: 'portrait'
    });

    // Set initial configuration first
    pdf.setFont('helvetica');
    const margin = 40;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let usableWidth = pageWidth - (2 * margin);
    let yPos = margin;

    // Simplified calculateSpacing function focused on one-page fit
    const calculateSpacing = (totalContent) => {
      const availableSpace = pageHeight - (2 * margin);
      const contentRatio = totalContent / availableSpace;

      // If content is less than 1.2 pages, try to fit it into one page
      if (contentRatio <= 1.2) {
        const scale = 1 / contentRatio;
        const adjustedScale = Math.max(SPACING.minScale, Math.min(SPACING.maxScale, scale));
        
        SPACING.base *= adjustedScale;
        SPACING.sectionGap *= adjustedScale;
        SPACING.headerGap *= adjustedScale;
      }
      // Otherwise, keep original spacing
    };

    // Measure content and calculate spacing
    const measureTotalContent = () => {
      let totalHeight = margin;
      // Add measurements for each section
      // ... measure all sections
      return totalHeight;
    };

    const totalContent = measureTotalContent();
    calculateSpacing(totalContent);


    // Add content scaling function
    const scaleContent = (contentHeight) => {
      const maxHeight = pageHeight - (2 * margin);
      if (contentHeight > maxHeight) {
        const scale = maxHeight / contentHeight;
        const minScale = 0.8; // Don't scale smaller than 80%

        if (scale >= minScale) {
          // Adjust margins and spacing
          margin = Math.max(30, margin * scale);
          usableWidth = pageWidth - (2 * margin);
          pdf.setFontSize(pdf.getFontSize() * scale);
          return true;
        }
      }
      return false;
    };

    // First pass: measure content height
    const measureContent = () => {
      let totalHeight = margin;
      // ... measure each section's height
      return totalHeight;
    };

    // Scale content if needed
    const contentHeight = measureContent();
    const needsScaling = scaleContent(contentHeight);

    if (needsScaling) {
      // Reset position and regenerate with new scale
      yPos = margin;
      pdf.setFont('helvetica');
    }

    // Helper functions
    // Helper functions
    const cleanText = (text) => {
      if (!text) return '';
      return text
        .replace(/\s+/g, ' ')                    // normalize spaces
        .replace(/[^\x20-\x7E\n]/g, '')         // remove non-printable chars
        .replace(/0$/, '')                       // remove trailing zeros
        .replace(/\s+•\s+/g, ' • ')             // fix bullet spacing
        .trim();
    };

    const addSectionHeader = (title) => {
      // Check if there's enough space for the header plus some content
      const minimumSpaceNeeded = 50; // Space for header + some content
      if (yPos > pageHeight - (margin + minimumSpaceNeeded)) {
        pdf.addPage();
        yPos = margin;
      }

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      const cleanTitle = cleanText(title);
      const textWidth = pdf.getTextWidth(cleanTitle);
      pdf.line(margin, yPos + 5, pageWidth - margin, yPos + 5);
      pdf.text(cleanTitle, margin, yPos);
      yPos += SPACING.headerGap;  // Instead of 25
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
      yPos += SPACING.headerGap;  // Instead of 20

      const contactInfo = [
        profile.personal?.email || "",
        profile.personal?.phone || "",
        profile.personal?.location || "",
      ].filter(Boolean);

      // Date
      pdf.text(moment().format('MMMM D, YYYY'), margin, yPos);

      yPos += SPACING.headerGap;  // Instead of 20

      contactInfo.forEach(info => {
        pdf.text(info, margin, yPos);
        yPos += SPACING.base;  // Instead of 15
      });

      yPos += SPACING.headerGap * 2;  // Instead of 40

      // Cover Letter content
      if (profile.coverLetter) {
        const paragraphs = profile.coverLetter.split('\n\n');
        paragraphs.forEach(paragraph => {
          checkNewPage();
          const lines = pdf.splitTextToSize(paragraph, usableWidth);
          pdf.text(lines, margin, yPos);
          yPos += (lines.length * SPACING.base) + SPACING.sectionGap;  // Instead of (lines.length * 15) + 20
        });
      }

      // Closing
      checkNewPage();
    } else {

      // Personal Information
      if (profile.personal) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(cleanText(profile.personal.fullName) || '', pageWidth / 2, yPos, { align: 'center' });

        yPos += SPACING.headerGap;  // Instead of 20
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
        yPos += (contactLines.length * SPACING.base) + SPACING.sectionGap;

        if (profile.personal.summary) {
          addSectionHeader('Summary');
          const summaryLines = pdf.splitTextToSize(cleanText(profile.personal.summary), usableWidth);
          pdf.text(summaryLines, margin, yPos);
          yPos += (summaryLines.length * SPACING.base) + SPACING.sectionGap;
        }
      }

      // Skills
      if (profile.skills?.length > 0) {
        checkNewPage();
        addSectionHeader('Skills');
        const skillsText = profile.skills.join(' • ');
        const lines = pdf.splitTextToSize(skillsText, usableWidth);
        pdf.text(lines, margin, yPos);
        yPos += (lines.length * SPACING.base) + SPACING.sectionGap;
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
          yPos += SPACING.base;

          if (exp.responsibilities) {
            pdf.setFont('helvetica', 'normal');
            const bullets = exp.responsibilities.split('\n').filter(r => r.trim());
            bullets.forEach(bullet => {
              checkNewPage();
              const bulletText = `• ${bullet}`;
              const lines = pdf.splitTextToSize(bulletText, usableWidth - 10);
              pdf.text(lines, margin + 10, yPos);
              yPos += lines.length * SPACING.base;  // Instead of fixed 12
            });
          }
          yPos += SPACING.sectionGap;  // Instead of fixed 15
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
            yPos += SPACING.base;
          }

          if (edu.achievements) {
            pdf.setFont('helvetica', 'normal');
            const lines = pdf.splitTextToSize(edu.achievements, usableWidth);
            pdf.text(lines, margin, yPos);
            yPos += (lines.length * SPACING.base);  // Instead of (lines.length * 12)
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
            yPos += (lines.length * SPACING.base) + SPACING.sectionGap;
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
            yPos += SPACING.base;  // Instead of 15
            pdf.setFont('helvetica', 'italic');
            pdf.text(cert.issuer, margin, yPos);
          }

          yPos += SPACING.sectionGap;  // Instead of 20
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
            yPos += (lines.length * SPACING.base) + SPACING.sectionGap;  // Instead of (lines.length * 12) + 10
          }
        });
      }
    }


    // Remove duplicate storage
    const pdfData = pdf.output('dataurlstring');

    if (isCoverLetter) {
      // Store cover letter data
      storageService.set(`coverLetter_${profileId}`, pdfData);
      storageService.set(`coverLetterFileName_${profileId}`, fileName);
      storageService.set(`coverLetterTimestamp_${profileId}`, new Date().toISOString());
    } else {
      // Store resume data
      storageService.set(`resumePDF_${profileId}`, pdfData);
      storageService.set(`resumeFileName_${profileId}`, fileName);
      storageService.set(`resumeTimestamp_${profileId}`, new Date().toISOString());
    }

    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};

export const downloadStoredPDF = (profileId, isCoverLetter = false) => {
  const pdfKey = isCoverLetter ? `coverLetter_${profileId}` : `resumePDF_${profileId}`;
  const fileNameKey = isCoverLetter ? `coverLetterFileName_${profileId}` : `resumeFileName_${profileId}`;

  const pdfData = storageService.get(pdfKey);
  const fileName = storageService.get(fileNameKey);

  if (!pdfData || !fileName) return false;

  const link = document.createElement('a');
  link.href = pdfData;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
};