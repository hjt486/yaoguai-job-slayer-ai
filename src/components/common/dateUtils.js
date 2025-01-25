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
  const m = moment(date);
  if (!m.isValid()) return '';

  // Check if the date string contains month and day
  const dateStr = date.toString();
  const hasMonth = dateStr.includes('-');
  const hasDay = dateStr.includes('-') && dateStr.split('-').length > 2;

  if (!hasMonth) {
    return m.format('YYYY');
  } else if (!hasDay) {
    return m.format('MMMM YYYY');
  }
  return m.format('MMMM D, YYYY');
};

export const formatTime = (date) => {
  return moment(date).format('h:mm A');
};

export const getCurrentISOString = () => new Date().toISOString();