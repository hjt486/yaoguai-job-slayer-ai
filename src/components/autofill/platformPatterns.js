export const PLATFORM_PATTERNS = {
  workday: {
    patterns: [
      'workday',
      'wd3',
      'myworkday',
      'myworkdayjobs',
      'wd3.myworkday.com',
      'wd3.myworkdayjobs.com',
    ],
    fields: {
      firstName: {
        selectors: [
          'legalNameSection_firstName',
          '[data-automation-id="firstName"] input',
        ],
        profilePath: 'personal.firstName',
        type: 'text'
      },
      lastName: {
        selectors: [
          'legalNameSection_lastName',
          '[data-automation-id="lastName"] input',
        ],
        profilePath: 'personal.lastName',
        type: 'text'
      },
      email: {
        selectors: [
          'email',
          'emailAddress',
          '[data-automation-id="email"] input',
        ],
        profilePath: 'personal.email',
        type: 'text'
      },
      phone: {
        selectors: [
          'phone-number',
          '[data-automation-id="phoneNumber"] input',
        ],
        profilePath: 'personal.phone',
        type: 'text'
      },
      address_line_1: {
        selectors: [
          'addressSection_addressLine1',
          '[data-automation-id="addressLine1"] input',
        ],
        profilePath: 'application_misc.address_line_1',
        type: 'text'
      },
      city: {
        selectors: [
          'addressSection_city',
          '[data-automation-id="city"] input',
        ],
        profilePath: 'application_misc.city',
        type: 'text'
      },
      state: {
        selectors: [
          'addressSection_countryRegion',
          '[data-automation-id="state"] select',
        ],
        profilePath: 'application_misc.state',
        type: 'dropdown'
      },
      postal_code: {
        selectors: [
          'addressSection_postalCode',
          '[data-automation-id="postalCode"] input',
        ],
        profilePath: 'application_misc.post_code',
        type: 'text'
      },
      linkedin: {
        selectors: [
          '[data-automation-id="linkedinUrl"] input',
        ],
        profilePath: 'personal.linkedin',
        type: 'text'
      },
      work_experience: {
        selectors: [
          '[data-automation-id="workExperience"] textarea',
        ],
        profilePath: 'experience.summary',
        type: 'text'
      },
      education: {
        selectors: [
          '[data-automation-id="educationHistory"] textarea',
        ],
        profilePath: 'education.summary',
        type: 'text'
      },
      resume: {
        selectors: [
          '[data-automation-id="file-upload-input-ref"]',
          '[data-automation-id="fileUploadPanel"]',
          '[data-automation-id="file-upload-drop-zone"]',
          '[data-automation-id="resumeUpload"] input[type="file"]',
        ],
        profilePath: 'resume.resumeFile',
        type: 'file'
      },
      submit: {
        selectors: [
          '[data-automation-id="submit"] button',
        ],
        type: 'button'
      }
    }
  }
};

// Ensure that any string comparisons in JavaScript are case-insensitive and exact
// This can be done in the logic where these patterns are used for matching
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
  },
  state: {
    workday: {
      'Alabama': ['Alabama', 'AL'],
      'Alaska': ['Alaska', 'AK'],
      'Arizona': ['Arizona', 'AZ'],
      'Arkansas': ['Arkansas', 'AR'],
      'California': ['California', 'CA'],
      'Colorado': ['Colorado', 'CO'],
      'Connecticut': ['Connecticut', 'CT'],
      'Delaware': ['Delaware', 'DE'],
      'District of Columbia': ['District of Columbia', 'DC', 'Washington DC'],
      'Florida': ['Florida', 'FL'],
      'Georgia': ['Georgia', 'GA'],
      'Hawaii': ['Hawaii', 'HI'],
      'Idaho': ['Idaho', 'ID'],
      'Illinois': ['Illinois', 'IL'],
      'Indiana': ['Indiana', 'IN'],
      'Iowa': ['Iowa', 'IA'],
      'Kansas': ['Kansas', 'KS'],
      'Kentucky': ['Kentucky', 'KY'],
      'Louisiana': ['Louisiana', 'LA'],
      'Maine': ['Maine', 'ME'],
      'Maryland': ['Maryland', 'MD'],
      'Massachusetts': ['Massachusetts', 'MA'],
      'Michigan': ['Michigan', 'MI'],
      'Minnesota': ['Minnesota', 'MN'],
      'Mississippi': ['Mississippi', 'MS'],
      'Missouri': ['Missouri', 'MO'],
      'Montana': ['Montana', 'MT'],
      'Nebraska': ['Nebraska', 'NE'],
      'Nevada': ['Nevada', 'NV'],
      'New Hampshire': ['New Hampshire', 'NH'],
      'New Jersey': ['New Jersey', 'NJ'],
      'New Mexico': ['New Mexico', 'NM'],
      'New York': ['New York', 'NY'],
      'North Carolina': ['North Carolina', 'NC'],
      'North Dakota': ['North Dakota', 'ND'],
      'Ohio': ['Ohio', 'OH'],
      'Oklahoma': ['Oklahoma', 'OK'],
      'Oregon': ['Oregon', 'OR'],
      'Pennsylvania': ['Pennsylvania', 'PA'],
      'Rhode Island': ['Rhode Island', 'RI'],
      'South Carolina': ['South Carolina', 'SC'],
      'South Dakota': ['South Dakota', 'SD'],
      'Tennessee': ['Tennessee', 'TN'],
      'Texas': ['Texas', 'TX'],
      'Utah': ['Utah', 'UT'],
      'Vermont': ['Vermont', 'VT'],
      'Virginia': ['Virginia', 'VA'],
      'Washington': ['Washington', 'WA'],
      'West Virginia': ['West Virginia', 'WV'],
      'Wisconsin': ['Wisconsin', 'WI'],
      'Wyoming': ['Wyoming', 'WY'],
      'American Samoa': ['American Samoa', 'AS'],
      'Guam': ['Guam', 'GU'],
      'Northern Mariana Islands': ['Northern Mariana Islands', 'MP'],
      'Puerto Rico': ['Puerto Rico', 'PR'],
      'U.S. Virgin Islands': ['U.S. Virgin Islands', 'VI'],
      'Armed Forces Americas': ['Armed Forces Americas', 'AA'],
      'Armed Forces Europe': ['Armed Forces Europe', 'AE'],
      'Armed Forces Pacific': ['Armed Forces Pacific', 'AP']
    }
  },
};