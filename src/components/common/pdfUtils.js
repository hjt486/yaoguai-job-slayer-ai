import { jsPDF } from 'jspdf';
import { formatDate } from './dateUtils';
import moment from 'moment';
import { storageService } from '../../services/storageService';

const SPACING = {
  base: 10,          
  sectionGap: 5,     
  headerGap: 15,     
};

export const generatePDF = async (profile, fileName, profileId, isCoverLetter = false) => {
  try {
    const pdf = new jsPDF({
      unit: 'pt',
      format: 'letter',
      orientation: 'portrait'
    });

    // Set initial configuration
    pdf.setFont('helvetica');
    const margin = 40;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let usableWidth = pageWidth - (2 * margin);
    let yPos = margin;

    // Remove calculateSpacing and measureTotalContent functions

    // Improved content scaling function
    const scaleContent = () => {
      const maxHeight = pageHeight - (2 * margin);
      const contentRatio = yPos / maxHeight;
      let scale = 1;
    
      // Case 1: Less than 1 page - stretch to fill
      if (contentRatio < 0.9) {
        scale = 1 / contentRatio;
        scale = Math.min(scale, 1.2); // Don't stretch more than 120%
      }
      // Case 2: Between 1-1.3 pages - compress to 1 page
      else if (contentRatio > 1 && contentRatio <= 1.3) {
        scale = 1 / contentRatio;
      }
      // Case 3: Between 2-2.3 pages - compress to 2 pages
      else if (contentRatio > 2 && contentRatio <= 2.3) {
        scale = 2 / contentRatio;
      }
      // Case 4: Between 3-3.3 pages - compress to 3 pages
      else if (contentRatio > 3 && contentRatio <= 3.3) {
        scale = 3 / contentRatio;
      }
    
      // Apply scaling if needed
      if (scale !== 1) {
        scale = Math.max(0.8, scale); // Don't scale smaller than 80%
        pdf.setFontSize(pdf.getFontSize() * scale);
        SPACING.base = Math.floor(10 * scale);
        SPACING.sectionGap = Math.floor(5 * scale);
        SPACING.headerGap = Math.floor(15 * scale);
        return true;
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
      // First pass to measure content height
      let tempYPos = margin;
      pdf.setFontSize(12);
      tempYPos += SPACING.headerGap;

      const contactInfo = [
        profile.personal?.email || "",
        profile.personal?.phone || "",
        profile.personal?.location || "",
      ].filter(Boolean);

      tempYPos += SPACING.headerGap;
      tempYPos += (contactInfo.length * SPACING.base);
      tempYPos += SPACING.headerGap * 2;

      // Measure cover letter content
      if (profile.coverLetter) {
        const paragraphs = profile.coverLetter.split('\n\n');
        paragraphs.forEach(paragraph => {
          const lines = pdf.splitTextToSize(paragraph, usableWidth);
          tempYPos += (lines.length * SPACING.base) + SPACING.sectionGap;
        });
      }

      // Calculate and apply spacing scale
      const contentRatio = tempYPos / (pageHeight - (2 * margin));
      let spacingScale = 1;

      if (contentRatio < 0.9) {
        spacingScale = Math.min(1.2, 1 / contentRatio);
      } else if (contentRatio > 1 && contentRatio <= 1.3) {
        spacingScale = 1 / contentRatio;
      }

      // Apply scaled spacing
      const scaledSpacing = {
        base: Math.floor(SPACING.base * spacingScale),
        sectionGap: Math.floor(SPACING.sectionGap * spacingScale),
        headerGap: Math.floor(SPACING.headerGap * spacingScale)
      };

      // Reset and render with scaled spacing
      yPos = margin;
      pdf.setFontSize(12);
      pdf.text(profile.personal?.firstName + ' ' + profile.personal?.lastName  || '', margin, yPos);
      yPos += scaledSpacing.headerGap;

      // Date
      pdf.text(moment().format('MMMM D, YYYY'), margin, yPos);
      yPos += scaledSpacing.headerGap;

      // Contact info
      contactInfo.forEach(info => {
        pdf.text(info, margin, yPos);
        yPos += scaledSpacing.base;
      });

      yPos += scaledSpacing.headerGap * 2;

      // Cover Letter content
      if (profile.coverLetter) {
        pdf.setFontSize(12);
        const paragraphs = profile.coverLetter.split('\n\n');
        paragraphs.forEach(paragraph => {
          checkNewPage();
          const lines = pdf.splitTextToSize(paragraph, usableWidth);
          pdf.text(lines, margin, yPos);
          yPos += (lines.length * scaledSpacing.base) + scaledSpacing.sectionGap;
        });
      }

      // Closing
      checkNewPage();
    } else {

      // Personal Information
      if (profile.personal) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(cleanText(profile.personal?.firstName + ' ' + profile.personal?.lastName) || '', pageWidth / 2, yPos, { align: 'center' });

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

          yPos += SPACING.base;
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

          yPos += SPACING.base
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
          yPos += SPACING.sectionGap;  // Instead of fixed 15
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
          yPos += SPACING.base

          if (proj.description) {
            pdf.setFont('helvetica', 'normal');
            const bullets = proj.description.split('\n').filter(r => r.trim());
            bullets.forEach(bullet => {
              checkNewPage();
              const bulletText = `• ${bullet}`;
              const lines = pdf.splitTextToSize(bulletText, usableWidth - 10);
              pdf.text(lines, margin + 10, yPos);
              yPos += lines.length * SPACING.base;
            });
          }
          yPos += SPACING.sectionGap;  // Instead of fixed 15
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
            yPos += SPACING.base;  // Instead of 15
          }

          if (cert.issuer) {
            pdf.setFont('helvetica', 'italic');
            pdf.text(cert.issuer, margin, yPos);
            yPos += SPACING.base;  // Instead of 15
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