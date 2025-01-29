import moment from 'moment';

export const formatDateTime = (date) => {
  if (!date) return '';
  const m = moment(date);
  if (!m.isValid()) return '';

  // Check if the string is an ISO timestamp
  if (date.includes('T')) {
    return m.format('MMMM D, YYYY [at] h:mm A');
  }
  return m.format('MMMM D, YYYY, h:mm A');
};

export const formatDate = (date) => {
  if (!date) return '';
  
  // Ensure proper date format by replacing single digits with leading zeros
  const formattedInput = date.replace(/-(\d)(?!\d)/g, '-0$1');
  
  const momentDate = moment(formattedInput, [
    'YYYY-MM-DD',    // Try ISO format first
    'MM/DD/YYYY',    // Then common US format
    'DD/MM/YYYY',    // Then common UK format
    'YYYY-M-D',      // Then relaxed ISO format
    'M/D/YYYY',      // Then relaxed US format
    'D/M/YYYY'       // Then relaxed UK format
  ], true);          // Strict parsing

  return momentDate.isValid() ? momentDate.format('MMMM YYYY') : '';
};

export const formatTime = (date) => {
  return moment(date).format('h:mm A');
};

export const getCurrentISOString = () => new Date().toISOString();