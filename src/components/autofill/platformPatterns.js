export const PLATFORM_PATTERNS = {
  workday: {
    patterns: [
      'workday',
      'wd3',
      'myworkday',
      'myworkdayjobs',
      '[data-automation-id="legalNameSection"]',  // Update to match actual HTML attribute
      '[data-automation-id="addressSection"]',    // Update to match actual HTML attribute
    ],
    fields: {
      firstName: {
        selectors: [
          'legalNameSection_firstName',
          'input-5',
          'First Name',
          'firstName',
          'first-name',
          'given-name'
        ],
        profilePath: 'personal.firstName'
      },
      lastName: {
        selectors: [
          'legalNameSection_lastName',
          'input-6',
          'Last Name',
          'lastName',
          'last-name',
          'family-name'
        ],
        profilePath: 'personal.lastName'
      },
      email: {
        selectors: [
          'email',
          'input-12',
          'emailAddress',
          'username',
          'input-3'
        ],
        profilePath: 'personal.email'
      },
      phone: {
        selectors: [
          'phone-number',
          'phoneNumber',
          'mobile',
          'phone'
        ],
        profilePath: 'personal.phone'
      },
      phone_extension: {
        selectors: [
          'phone-extension',
          'extension',
          'phoneExt'
        ],
        profilePath: 'application_misc.phone_extension'
      },
      address_line_1: {
        selectors: [
          'addressSection_addressLine1',
          'address-line-1',
          'street-address'
        ],
        profilePath: 'application_misc.address_line_1'
      },
      city: {
        selectors: [
          'addressSection_city',
          'city',
          'municipality'
        ],
        profilePath: 'application_misc.city'
      },
      state: {
        selectors: [
          'addressSection_countryRegion',
          'state',
          'region'
        ],
        profilePath: 'application_misc.state'
      },
      postal_code: {
        selectors: [
          'addressSection_postalCode',
          'postal-code',
          'zip'
        ],
        profilePath: 'application_misc.postal_code'
      }
    }
  }
};

export const PLATFORM_VALUE_MAPPINGS = {
  workAuth: {
    workday: {
      'true': ['yes', 'true', '1'],
      'false': ['no', 'false', '0']
    },
  },
  experience: {
    workday: {
      '0-2': ['entry', 'junior', '0-2'],
      '3-5': ['mid', 'intermediate', '3-5'],
      '5-10': ['senior', 'experienced', '5-10'],
      '10+': ['expert', 'lead', '10+']
    },
  },
  sponsorship: {
    workday: {
      'true': ['Yes', 'Required', 'Need Sponsorship'],
      'false': ['No', 'Not Required', 'No Sponsorship']
    },
  },
  location: {
    remote: ['remote', 'work from home', 'virtual', 'Remote Work'],
    hybrid: ['hybrid', 'flexible', 'partial remote', 'Hybrid Work'],
    onsite: ['onsite', 'in office', 'on-site', 'Office Based']
  }
};