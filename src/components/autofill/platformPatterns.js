export const PLATFORM_PATTERNS = {
  workday: {
    patterns: [
      'workday',
      'wd3',
      'myworkday',
      'myworkdayjobs',
      '[data-automation-id="fileUploadPanel"]',
      '[data-automation-id="file-upload-input-ref"]'
    ],
    fields: {
      country: {
        selectors: [
          'countryDropdown',  // Exact match for data-automation-id
        ],
        profilePath: 'application_misc.country',
        type: 'dropdown',
      },  
      firstName: {
        selectors: [
          'legalNameSection_firstName',
        ],
        profilePath: 'personal.firstName',
        type: 'text'
      },
      lastName: {
        selectors: [
          'legalNameSection_lastName',
        ],
        profilePath: 'personal.lastName',
        type: 'text'
      },
      email: {
        selectors: [
          'email',
          'input-12',
          'emailAddress',
          'username',
          'input-3'
        ],
        profilePath: 'personal.email',
        type: 'text'
      },
      address_line_1: {
        selectors: [
          'addressSection_addressLine1',
        ],
        profilePath: 'application_misc.address_line_1'
      },
      city: {
        selectors: [
          'addressSection_city',
        ],
        profilePath: 'application_misc.city'
      },    
      state: {
        selectors: [
          'addressSection_countryRegion',  // Exact match for data-automation-id
        ],
        profilePath: 'application_misc.state',
        type: 'dropdown',
      }, 
      postal_code: {
        selectors: [
          'addressSection_postalCode',
        ],
        profilePath: 'application_misc.post_code',
        type: 'text'
      }, 
      county: {
        selectors: [
          'addressSection_regionSubdivision1',
        ],
        profilePath: 'application_misc.county',
        type: 'text'
      },
      phone_type: {
        selectors: [
          'phone_type',  // Exact match for data-automation-id
        ],
        profilePath: 'application_misc.phone_type',
        type: 'dropdown',
      },  
      phone: {
        selectors: [
          'phone-number',
        ],
        profilePath: 'personal.phone',
        type: 'text'
      },
      phone_type: {
        selectors: [
          'phone-device-type',
        ],
        profilePath: 'application_misc.phone_type',
        type: 'dropdown'
      },
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