export const FIELD_PATTERNS = {
  // Personal Information
  firstName: ['first[_-]?name', 'given[_-]?name', '^first$', 'fname'],
  lastName: ['last[_-]?name', 'surname', 'family[_-]?name', '^last$', 'lname'],
  fullName: ['full[_-]?name', '^name$', 'candidate[_-]?name'],
  email: ['email', 'e[_-]?mail', 'candidate[_-]?email'],
  phone: ['phone', 'telephone', 'mobile', 'cell', 'contact[_-]?number'],
  location: ['location', 'address', 'city', 'state', 'zip', 'postal'],
  linkedin: ['linkedin', 'social[_-]?media', 'profile[_-]?url'],

  // Resume
  resume: ['resume', 'cv', 'upload[_-]?resume', 'document[_-]?upload'],

  // Work Authorization
  workAuth: [
    'legally[_-]?authorized',
    'work[_-]?authorization',
    'eligible[_-]?to[_-]?work',
    'right[_-]?to[_-]?work'
  ],
  sponsorship: [
    'sponsor',
    'visa[_-]?sponsor',
    'require[_-]?sponsor',
    'need[_-]?sponsor'
  ],

  // Work Preferences
  workType: ['remote', 'hybrid', 'onsite', 'work[_-]?type', 'work[_-]?location'],
  salary: ['salary', 'compensation', 'pay[_-]?range', 'expected[_-]?salary'],

  // Experience
  experience: ['experience', 'years[_-]?of[_-]?experience', 'work[_-]?experience'],
  summary: ['summary', 'about', 'background', 'profile', 'introduction']
};

export const VALUE_MAPPINGS = {
  workAuth: {
    'true': ['yes', 'true', '1'],
    'false': ['no', 'false', '0']
  },
  workType: {
    'remote': ['remote', 'work from home', 'wfh'],
    'hybrid': ['hybrid', 'flexible', 'partial remote'],
    'onsite': ['onsite', 'in office', 'in-office']
  }
};