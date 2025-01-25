import { jsPDF } from 'jspdf';
import { formatDate } from './dateUtils';
import moment from 'moment';

export const generatePDF = async (profile, fileName = 'resume.pdf', profileId, isCoverLetter = false) => {
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
      if (profile.skills?.length) {
        checkNewPage();
        addSectionHeader('Skills');
        const skillsText = profile.skills.join(' • ');
        const lines = pdf.splitTextToSize(skillsText, usableWidth);
        pdf.text(lines, margin, yPos);
        yPos += (lines.length * 12) + 20;
      }

      // Experience
      if (profile.experience?.length) {
        checkNewPage();
        addSectionHeader('Experience');
        profile.experience.forEach(exp => {
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
      if (profile.education?.length) {
        checkNewPage();
        addSectionHeader('Education');
        profile.education.forEach(edu => {
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
      if (profile.projects?.length) {
        checkNewPage();
        addSectionHeader('Projects');
        profile.projects.forEach(proj => {
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

      // Achievements
      if (profile.achievements?.length) {
        checkNewPage();
        addSectionHeader('Achievements');
        profile.achievements.forEach(ach => {
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
    localStorage.setItem(`generatedPDF_${profile.id || profileId}`, pdfData);
    localStorage.setItem(`pdfTimestamp_${profile.id || profileId}`, new Date().toISOString());
    localStorage.setItem(`pdfFileName_${profile.id || profileId}`, fileName);

    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};

export const downloadStoredPDF = (profileId, isCoverLetter = false) => {
  const key = isCoverLetter ? `generatedPDF_${profileId}_coverLetter` : `generatedPDF_${profileId}`;
  const pdfData = localStorage.getItem(key);
  const fileName = localStorage.getItem(key);

  if (!pdfData) return false;

  const link = document.createElement('a');
  link.href = pdfData;
  link.download = fileName || (isCoverLetter ? 'cover_letter.pdf' : 'resume.pdf');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
};