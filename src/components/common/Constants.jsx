export const SITE_NAME = "Yaoguai Job Slayer AI"
export const SITE_LOGO = () => {
  return (<div className='grid-vertical'>
    <h1 style={{ marginBottom: '0', paddingBottom: '0', width: '100%', textAlign: 'center' }}>YAOGU<sup>AI</sup></h1>
    <small style={{ width: '100%', textAlign: 'center', letterSpacing: '0.3em', marginTop: '-0.4em' }}>Job Slayer</small>
  </div>)
}

export const DEFAULT_PROFILE_STRUCTURE = {
  // Profile Metadata
  metadata: {
    profileName: "",
    targetRole: "",
    targetCompany: "",
    jobId: "",
    jobDescription: "",
    createdAt: "",
    lastModified: ""
  },
  // Resume Sections
  // In DEFAULT_PROFILE_STRUCTURE
  personal: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    website: "",
    linkedin: "",
    location: "",
    summary: ""
  },

  education: [
    {
      school: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      achievements: ""
    }
  ],
  experience: [
    {
      jobTitle: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      responsibilities: ""
    }
  ],
  skills: [],
  achievements: [
    {
      name: "",
      awardedDate: "",
      description: "",
      issuer: ""
    },
  ],
  projects: [
    {
      name: "",
      startDate: "",
      endDate: "",
      description: "",
    },
  ],
  certifications: [
    {
      name: "",
      awardedDate: "",
      issuer: ""
    },
  ],
  // Cover Letter Section
  coverLetter: "",

  self_identification: {
    gender: "",
    pronouns: "",
    veteran: "",
    disability: "",
    ethnicity: ""
  },

  legal_authorization: {
    us_work_authorization: "",
    legally_allowed_to_work_in_us: "",
    requires_us_visa: "",
    requires_us_sponsorship: "",

    eu_work_authorization: "",
    requires_eu_visa: "",
    legally_allowed_to_work_in_eu: "",
    requires_eu_sponsorship: "",

    canada_work_authorization: "",
    legally_allowed_to_work_in_canada: "",
    requires_canada_visa: "",
    requires_canada_sponsorship: "",

    uk_work_authorization: "",
    legally_allowed_to_work_in_uk: "",
    requires_uk_visa: "",
    requires_uk_sponsorship: ""
  },
  work_preferences: {
    remote_work: "",
    on_site_work: "",
    open_to_relocation: "",
    willing_to_complete_assessments: "",
    willing_to_undergo_drug_tests: "",
    willing_to_undergo_background_checks: ""
  },
  salary_expectations: {
    salary_range: ""
  },
  languages: [
    {
      language: "",
      proficiency: ""
    }
  ],
  application_misc: {
    country: "",
    address_line_1: "",
    city: "",
    county: "",
    state: "",
    postal_code: "",
    phone_type: ""
  },
}

export const LABELS = {
  sections: {
    metadata: {
      name: "Profile Data",
      fields: {
        profileName: "Profile Name",
        resumeName: "Resume File",
        targetRole: "Target Role",
        targetCompany: "Target Company",
        jobId: "Job ID",
        jobDescription: "Job Description",
        createdAt: "Created At",
        lastModified: "Last Modified"
      }
    },
    // In LABELS.sections
    personal: {
      name: "Personal Information",
      fields: {
        firstName: "First Name",
        lastName: "Last Name",
        email: "Email Address",
        phone: "Phone Number",
        location: "Location",
        website: "Website",
        linkedin: "LinkedIn Profile",
        summary: "Professional Summary"
      }
    },
    education: {
      name: "Education",
      fields: {
        degree: "Degree",
        school: "School/University",
        field: "Field of Study",
        startDate: "Start Date",
        endDate: "End Date",
        achievements: "Achievements"
      }
    },
    experience: {
      name: "Professional Experience",
      fields: {
        jobTitle: "Job Title",
        company: "Company",
        location: "Location",
        startDate: "Start Date",
        endDate: "End Date",
        responsibilities: "Responsibilities"
      }
    },
    skills: {
      name: "Skills & Technologies",
      fields: {}
    },
    achievements: {
      name: "Achievements & Awards",
      fields: {
        name: "Achievement Name",
        awardedDate: "Date Awarded",
        description: "Description",
        issuer: "Issuing Organization"
      }
    },
    projects: {
      name: "Projects",
      fields: {
        name: "Project Name",
        startDate: "Start Date",
        endDate: "End Date",
        description: "Description"
      }
    },
    certifications: {
      name: "Certifications",
      fields: {
        name: "Certification Name",
        awardedDate: "Date Awarded",
        issuer: "Issuing Organization"
      },
    },
    coverLetter: {
      name: "Cover Letter",
      fields: {}
    },
    self_identification: {
      name: "Self Identification",
      fields: {
        gender: "Gender",
        pronouns: "Pronouns",
        veteran: "Veteran Status",
        disability: "Disability Status",
        ethnicity: "Ethnicity"
      }
    },
    legal_authorization: {
      name: "Work Authorization",
      fields: {
        eu_work_authorization: "EU Work Authorization",
        us_work_authorization: "US Work Authorization",
        requires_us_visa: "Requires US Visa",
        requires_us_sponsorship: "Requires US Sponsorship",
        requires_eu_visa: "Requires EU Visa",
        legally_allowed_to_work_in_eu: "Legally Allowed to Work in EU",
        legally_allowed_to_work_in_us: "Legally Allowed to Work in US",
        requires_eu_sponsorship: "Requires EU Sponsorship",
        canada_work_authorization: "Canada Work Authorization",
        requires_canada_visa: "Requires Canada Visa",
        legally_allowed_to_work_in_canada: "Legally Allowed to Work in Canada",
        requires_canada_sponsorship: "Requires Canada Sponsorship",
        uk_work_authorization: "UK Work Authorization",
        requires_uk_visa: "Requires UK Visa",
        legally_allowed_to_work_in_uk: "Legally Allowed to Work in UK",
        requires_uk_sponsorship: "Requires UK Sponsorship"
      }
    },
    work_preferences: {
      name: "Work Preferences",
      fields: {
        remote_work: "Open to Remote Work",
        on_site_work: "Open to On-Site Work",
        open_to_relocation: "Open to Relocation",
        willing_to_complete_assessments: "Willing to Complete Assessments",
        willing_to_undergo_drug_tests: "Willing to Undergo Drug Tests",
        willing_to_undergo_background_checks: "Willing to Undergo Background Checks"
      }
    },
    salary_expectations: {
      name: "Salary Expectations",
      fields: {
        salary_range: "Salary Range"
      }
    },
    languages: {
      name: "Languages",
      fields: {
        language: "Language",
        proficiency: "Proficiency Level"
      }
    },
    application_misc: {
      name: "Application Misc.",
      fields: {
        country: "Country",
        address_line_1: "Address Line 1",
        city: "City",
        county: "County",
        state: "State",
        postal_code: "Postal Code",
        phone_type: "Phone Type",
      }
    },
  },
  actions: {
    edit: "Edit",
    save: "Save",
    cancel: "Cancel"
  }
};

export const ARRAY_SECTIONS = [
  'education',
  'experience',
  'achievements',
  'projects',
  'certifications',
  'languages'
];

export const TEXTAREA_FIELDS = [
  'summary',
  'responsibilities',
  'achievements',
  'description',
  'coverLetter',
];

export const DATE_TIME_FIELDS = [
  'createdAt',
  'lastModified'
];

export const DATE_FIELDS = [
  'startDate',
  'endDate',
  'awardedDate',
];

export const NOT_EDITABLE_FIELDS = [
  'resumeName',
  'createdAt',
  'lastModified',
]

export const APPLICATION_ONLY_SECTIONS = [
  'self_identification',
  'legal_authorization',
  'work_preferences',
  'salary_expectations',
  'languages',
  'application_misc',
];

export const BOOLEAN_FIELDS = [
  'requires_us_visa',
  'requires_us_sponsorship',
  'requires_eu_visa',
  'legally_allowed_to_work_in_eu',
  'legally_allowed_to_work_in_us',
  'requires_eu_sponsorship',
  'requires_canada_visa',
  'legally_allowed_to_work_in_canada',
  'requires_canada_sponsorship',
  'requires_uk_visa',
  'legally_allowed_to_work_in_uk',
  'requires_uk_sponsorship',
  'eu_work_authorization',
  'us_work_authorization',
  'canada_work_authorization',
  'uk_work_authorization',
  'veteran',
  'disability',
  'remote_work',
  'on_site_work',
  'open_to_relocation',
  'willing_to_complete_assessments',
  'willing_to_undergo_drug_tests',
  'willing_to_undergo_background_checks',
];

export const AI_CONFIG = {
  SYSTEM_MESSAGE: {
    role: "system",
    content: "You are a helpful assistant that parses resumes accurately."
  },
  TEMPERATURE: 0.7,
  MAX_CONTENT_LENGTH: 12000,
  MAX_TOKENS: 4000
};

const PROFILE_RULES = ` Profile Rules:
 1. Text Formatting:
    - Long fields (responsibilities, achievements, description):
      * Split each point with double newlines (\\n\\n)
      * One point per line
    - Summary: single paragraph
    - Cover letter: generate from resume content
      * Professional yet conversational tone
      * Clear subjects, short sentences
      * Double newline between paragraphs
  
 2. Other Fields:
    - Skills: single items, no categories
    - Dates: ISO format
    - Certifications: name, issuer, date`

export const AI_PROMPTS = {
  RESUME_PARSE: `Parse resume into strict JSON structure, NO MARKDOWN blocks:
  ${JSON.stringify(
    Object.fromEntries(
      Object.entries(DEFAULT_PROFILE_STRUCTURE)
        .filter(([key]) => !APPLICATION_ONLY_SECTIONS.includes(key))
    ),
    null,
    2
  )}
  
 ${PROFILE_RULES}`,

  JOB_MATCH: `Compare job description with candidate profile:
    1. Extract required skills & qualifications from job description
    2. Compare with profile:
       - Match similar terms (e.g., HTML5=HTML)
       - Include soft skills
       - Find missing requirements
  
    Return strict JSON only format:
    {
      "missingKeywords": ["skill1", "skill2"]
    }
  
    Note: Consolidate similar terms, no duplicates.`,

  PROFILE_ENHANCE: `Enhance profile based on job description and keywords:

    1. Extract and update metadata:
       - targetCompany, targetRole, jobId from job description
       - Set jobDescription to full description
  
    2. For keywords rated >= 1:
       - Add to skills
       - Based on description:
         - Summary: general skills
         - Experience: job skills
         - Education: academic skills
         - Projects: technical skills
         - Achievements: certifications
       - Add school-related items to latest education entry
  
    3. For keywords rated 0:
       - Skip skills section
       - Add to cover letter:
         - Learning interest
         - Similar/transferable skills
         - Related experience
  
    4. General skills (e.g., debugging, feedback):
       - Brief mention in summary
       - Elaborate in cover letter
  
    5. Overall:
       - Keep original facts
       - Use professional tone
       - Focus on job relevance

    ${PROFILE_RULES}
  
    Return exact JSON: ${JSON.stringify(
    Object.fromEntries(
      Object.entries(DEFAULT_PROFILE_STRUCTURE)
        .filter(([key]) => !APPLICATION_ONLY_SECTIONS.includes(key))
    ),
    null,
    2
  )}`,
};