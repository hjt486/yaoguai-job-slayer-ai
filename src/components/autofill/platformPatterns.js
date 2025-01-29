export const PLATFORM_PATTERNS = {
  workday: {
    patterns: [
      'workday',
      'wd3',
      'myworkday',
      'myworkdayjobs'
    ],
    fields: {
      firstName: [
        'legalNameSection_firstName',
        'input-5',
        'First Name',
        'firstName',
        'first-name',
        'given-name'
      ],
      lastName: [
        'legalNameSection_lastName',
        'input-6',
        'Last Name',
        'lastName',
        'last-name',
        'family-name'
      ],
      email: [
        'email',
        'input-12',
        'emailAddress',
        'username',
        'input-3'
      ],
      phone: [
        'phone-number',
        'phoneNumber',
        'mobile',
        'phone'
      ],
      phone_extension: [
        'phone-extension',
        'extension',
        'phoneExt'
      ],
      address_line_1: [
        'addressSection_addressLine1',
        'address-line-1',
        'street-address'
      ],
      city: [
        'addressSection_city',
        'city',
        'municipality'
      ],
      state: [
        'addressSection_countryRegion',
        'state',
        'region'
      ],
      postal_code: [
        'addressSection_postalCode',
        'postal-code',
        'zip'
      ],
      county: [
        'addressSection_regionSubdivision1',
        'county',
        'district'
      ],
      country: [
        'countryDropdown',
        'input-4',
        'country',
        'nation'
      ],
      phoneType: [
        'phone-device-type',
        'input-13',
        'phoneType'
      ],
      phoneCountryCode: [
        'country-phone-code',
        'input-14',
        'phoneCountry'
      ],
      resume: [
        'upload-resume',
        'select-files',
        'drop-zone',
        'attachCV',
        'file-upload',
        'upload-file',
        'dropzone',
        'add-file',
        'attach-file',
        'upload-resume',
        'fileupload',
        'file-input',
        'resume-upload'
      ],
      linkedin: [
        'linkedin',
        'linkedInUrl',
        'socialMedia'
      ],
      workAuth: [
        'workAuthorization',
        'eligibleToWork',
        'legallyAuthorized'
      ],
      sponsorship: [
        'requireSponsorship',
        'visaSponsorship',
        'needVisa'
      ],
      experience: [
        'yearsOfExperience',
        'totalExperience',
        'workExperience'
      ],
      referralSource: [
        'sourceDropdown',
        'formField-sourceDropdown',
        'input-2',
        'referral'
      ],
      previousEmployment: [
        'previousWorker',
        'formField-',
        'input-3',
        'priorEmployee'
      ]
    }
  },
  greenhouse: {
    patterns: [
      'greenhouse',
      'boards.greenhouse.io',
      'app.greenhouse.io'
    ],
    fields: {
      firstName: ['first_name', 'job_application[first_name]', 'first-name'],
      lastName: ['last_name', 'job_application[last_name]', 'last-name'],
      email: ['email', 'job_application[email]', 'email-address'],
      phone: ['phone', 'job_application[phone]', 'phone-number'],
      resume: ['resume', 'job_application[resume]', 'resume-upload'],
      linkedin: ['job_application[urls][LinkedIn]', 'linkedin-url'],
      workAuth: ['job_application[eligible_to_work]', 'work-authorization'],
      sponsorship: ['job_application[requires_sponsorship]', 'visa-sponsorship'],
      location: ['job_application[location]', 'preferred-location'],
      summary: ['job_application[cover_letter]', 'cover-letter'],
      country: [
        'countryDropdown',
        'country-select',
        'country',
        'nation'
      ],
      address_line_1: [
        'addressSection_addressLine1',
        'address-line-1',
        'street-address',
        'address1'
      ],
      city: [
        'addressSection_city',
        'city',
        'municipality',
        'townCity'
      ],
      state: [
        'addressSection_countryRegion',
        'state',
        'region',
        'province'
      ],
      postal_code: [
        'addressSection_postalCode',
        'postal-code',
        'zip',
        'zipCode'
      ],
      phone_type: [
        'phone-device-type',
        'phoneType',
        'phone-type',
        'device-type'
      ]
    }
  },
  lever: {
    patterns: [
      'lever',
      'jobs.lever.co',
      'hire.lever.co'
    ],
    fields: {
      firstName: ['first-name', 'fname', 'first', 'given-name'],
      lastName: ['last-name', 'lname', 'last', 'family-name'],
      fullName: ['name', 'full-name', 'candidate-name'],
      email: ['email', 'email-address', 'candidate-email'],
      resume: ['resume', 'resume-upload', 'cv-upload'],
      phone: ['phone', 'phone-number', 'contact-number'],
      linkedin: ['linkedin', 'linkedin-url', 'social-links'],
      location: ['location', 'current-location', 'preferred-location'],
      workAuth: ['work-authorization', 'legally-authorized'],
      summary: ['additional-information', 'cover-letter', 'introduction']
    }
  },
  smartrecruiters: {
    patterns: [
      'smartrecruiters',
      'jobs.smartrecruiters.com'
    ],
    fields: {
      firstName: ['firstName', 'first-name', 'given-name'],
      lastName: ['lastName', 'last-name', 'family-name'],
      email: ['email', 'email-address', 'contact-email'],
      phone: ['phone', 'mobile-number', 'contact-phone'],
      resume: ['resume', 'cv', 'document-upload'],
      linkedin: ['linkedin', 'social-profile', 'professional-profile'],
      location: ['location', 'city', 'region'],
      workAuth: ['work-permit', 'authorization', 'eligible-to-work'],
      experience: ['experience', 'years-of-experience', 'seniority']
    }
  },
  icims: {
    patterns: [
      'icims.com',
      'jobs.icims.com'
    ],
    fields: {
      firstName: ['firstname', 'first_name', 'applicant.firstName'],
      lastName: ['lastname', 'last_name', 'applicant.lastName'],
      email: ['email', 'emailaddress', 'applicant.email'],
      phone: ['phone', 'phonenumber', 'applicant.phone'],
      resume: ['resume', 'upload_resume', 'applicant.resume'],
      linkedin: ['linkedin', 'linkedin_url', 'social_media_1'],
      location: ['location', 'city_state', 'current_location'],
      workAuth: ['work_authorization', 'legally_authorized', 'can_work'],
      sponsorship: ['need_sponsorship', 'require_visa', 'visa_status'],
      experience: ['years_experience', 'total_experience', 'experience_level']
    }
  },
  jobvite: {
    patterns: [
      'jobvite',
      'jobs.jobvite.com'
    ],
    fields: {
      firstName: ['first_name', 'fname', 'apply_firstName'],
      lastName: ['last_name', 'lname', 'apply_lastName'],
      email: ['email', 'apply_email', 'contact_email'],
      phone: ['phone', 'apply_phone', 'contact_phone'],
      resume: ['resume', 'apply_resume', 'candidate_resume'],
      linkedin: ['linkedin', 'apply_linkedin', 'social_profile'],
      location: ['location', 'apply_location', 'preferred_location'],
      workAuth: ['work_auth', 'authorization_status', 'can_work_us'],
      summary: ['cover_letter', 'introduction', 'additional_info']
    }
  },
  taleo: {
    patterns: [
      'taleo',
      'tbe.taleo.net'
    ],
    fields: {
      firstName: ['firstName', 'first-name', 'given-name'],
      lastName: ['lastName', 'last-name', 'family-name'],
      email: ['email', 'emailAddress', 'contact-email'],
      phone: ['phone', 'phoneNumber', 'contact-phone'],
      resume: ['resume', 'attachCV', 'upload-resume'],
      linkedin: ['linkedin', 'socialMedia', 'professional-profile'],
      location: ['location', 'address', 'current-location'],
      workAuth: ['legallyAuthorized', 'workAuthorization', 'eligible-to-work'],
      sponsorship: ['requireSponsorship', 'needVisa', 'visa-required'],
      experience: ['experience', 'yearsOfExperience', 'work-history']
    }
  },
  bamboohr: {
    patterns: [
      'bamboohr.com',
      'bamboohr.jobs'
    ],
    fields: {
      firstName: ['firstName', 'first_name', 'applicant.first'],
      lastName: ['lastName', 'last_name', 'applicant.last'],
      email: ['email', 'contact_email', 'applicant.email'],
      phone: ['phone', 'contact_phone', 'applicant.phone'],
      resume: ['resume', 'cv_upload', 'document'],
      linkedin: ['linkedin', 'social_linkedin', 'profile_url'],
      location: ['location', 'current_city', 'preferred_location'],
      workAuth: ['authorized_work', 'work_eligibility', 'can_work_in'],
      experience: ['experience_years', 'work_experience', 'career_length']
    }
  },
  ashby: {
    patterns: [
      'ashbyhq.com',
      'jobs.ashby.io'
    ],
    fields: {
      firstName: ['first_name', 'given_name', 'fname'],
      lastName: ['last_name', 'family_name', 'lname'],
      email: ['email', 'contact_email', 'primary_email'],
      phone: ['phone', 'mobile_number', 'contact_number'],
      resume: ['resume', 'cv', 'document'],
      linkedin: ['linkedin', 'linkedin_profile', 'social_url'],
      location: ['location', 'current_location', 'city_country'],
      workAuth: ['work_authorization', 'employment_eligibility', 'can_work_legally'],
      summary: ['cover_note', 'introduction', 'about_you']
    }
  },
  successfactors: {
    patterns: [
      'successfactors.com',
      'jobs.sap.com'
    ],
    fields: {
      firstName: ['firstName', 'first-name', 'candidate.firstName'],
      lastName: ['lastName', 'last-name', 'candidate.lastName'],
      email: ['email', 'emailAddress', 'candidate.email'],
      phone: ['phone', 'phoneNumber', 'candidate.phone'],
      resume: ['resume', 'attachCV', 'fileupload'],
      linkedin: ['linkedin', 'socialProfile', 'linkedinUrl'],
      location: ['location', 'preferredLocation', 'workLocation'],
      workAuth: ['workPermit', 'legalRight', 'workAuthorization'],
      sponsorship: ['visaSponsorship', 'needSponsorship', 'requireVisa'],
      experience: ['experience', 'totalExperience', 'yearsOfWork']
    }
  },
  recruitee: {
    patterns: [
      'recruitee.com',
      'careers.recruitee.com'
    ],
    fields: {
      firstName: ['first_name', 'fname', 'given_name'],
      lastName: ['last_name', 'lname', 'surname'],
      email: ['email', 'contact_email', 'email_address'],
      phone: ['phone', 'mobile', 'telephone'],
      resume: ['resume', 'cv', 'attachment'],
      linkedin: ['linkedin', 'social_linkedin', 'linkedin_profile'],
      location: ['location', 'city', 'preferred_location'],
      workAuth: ['work_permit', 'authorized', 'can_work'],
      summary: ['motivation', 'cover_letter', 'message']
    }
  }
};

export const PLATFORM_VALUE_MAPPINGS = {
  workAuth: {
    workday: {
      'true': ['yes', 'true', '1'],
      'false': ['no', 'false', '0']
    },
    greenhouse: {
      'true': ['Yes', 'true'],
      'false': ['No', 'false']
    },
    lever: {
      'true': ['Yes', 'Authorized', 'Have Authorization'],
      'false': ['No', 'Not Authorized', 'Need Authorization']
    },
    successfactors: {
      'true': ['Yes', 'Y', 'Authorized'],
      'false': ['No', 'N', 'Not Authorized']
    }
  },
  experience: {
    workday: {
      '0-2': ['entry', 'junior', '0-2'],
      '3-5': ['mid', 'intermediate', '3-5'],
      '5-10': ['senior', 'experienced', '5-10'],
      '10+': ['expert', 'lead', '10+']
    },
    greenhouse: {
      '0-2': ['Entry Level', 'Junior', '0-2 years'],
      '3-5': ['Mid Level', 'Intermediate', '3-5 years'],
      '5-10': ['Senior Level', 'Experienced', '5-10 years'],
      '10+': ['Principal', 'Expert', '10+ years']
    },
    icims: {
      '0-2': ['Entry', '0-2', 'Junior Level'],
      '3-5': ['Mid', '3-5', 'Intermediate Level'],
      '5-10': ['Senior', '5-10', 'Advanced Level'],
      '10+': ['Expert', '10+', 'Principal Level']
    }
  },
  sponsorship: {
    workday: {
      'true': ['Yes', 'Required', 'Need Sponsorship'],
      'false': ['No', 'Not Required', 'No Sponsorship']
    },
    greenhouse: {
      'true': ['Yes', 'Sponsorship Required'],
      'false': ['No', 'Sponsorship Not Required']
    }
  },
  location: {
    remote: ['remote', 'work from home', 'virtual', 'Remote Work'],
    hybrid: ['hybrid', 'flexible', 'partial remote', 'Hybrid Work'],
    onsite: ['onsite', 'in office', 'on-site', 'Office Based']
  }
};