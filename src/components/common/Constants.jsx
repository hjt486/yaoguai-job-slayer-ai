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
  personal: {
    fullName: "",
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
    personal: {
      name: "Personal Information",
      fields: {
        fullName: "Full Name",
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
  'languages'
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


export const AI_PROMPTS = {
  RESUME_PARSE: `Please analyze this resume and extract information to fill in below structure,
  and return the data strictly following this JSON structure: ${JSON.stringify(
    Object.fromEntries(
      Object.entries(DEFAULT_PROFILE_STRUCTURE)
        .filter(([key]) => !APPLICATION_ONLY_SECTIONS.includes(key))
    ),
    null,
    2
  )}

  Note:
  - For fields with long paragraph, please detect the point and separate each point with two newlines.
  - For certifications, extract any professional certifications, licenses, or relevant credentials.
  - Include certification names, issuing organizations, and dates awarded. 
  - For skills, parse all of them in single small item, don't categorize.
  
  Please also generate and fill cover letter based on the resume, make sure that: 
  Please write a cover letter based on my resume and the job description provided. 
  The writing style should balance between formal academic writing and conversational expression. 
  Ensure that every sentence has a clear subject. Avoid using long or complex sentences. 
  Use short sentences as much as possible.
  Break paragraphs with two newlines.

  Lastly, Ensure all dates are in ISO format and all fields match exactly as specified.
  `,
  JOB_MATCH: `Analyze the job description and compare it with the provided candidate profile.

  Parse the candidate's profile (provided as a JSON object) to remove unnecessary escape characters.
  Extract key technical skills, requirements, and qualifications from the job description.
  Compare these extracted keywords with the candidate's profile, focusing on both technical and soft skills.
  Identify missing keywords or skills by consolidating similar terms (e.g., HTML5 and HTML as "HTML," AWS as "Amazon Web Services (AWS)").
  Return only a valid JSON object in this structure:
  { "missingKeywords": [ "keyword1", "keyword2" ] }

  Important Notes:

  Do not include markdown code blocks or explanations.
  Consolidate redundant skills into a single keyword.
  Provide accurate, specific keywords for missing skills, avoiding duplicates.
  The response must strictly adhere to the required JSON format.
  `,
  PROFILE_ENHANCE: `Given the current profile, job description, and missing keywords, please enhance the profile following these rules:

  1. For missing keywords with rating >= 1:
     - Add them to the skills section
     - If description includes details, based on the rating:
       - integrate into relevant sections use your best judgement and words:
        - Add to summary if it's a general skill
        - Add to experience if it's job-related
        - Add to education if it's academic
        - Add to projects if it's project-related
        - Add to achievements if it's certification/award related
      - If it's a general saying on something similar "I worked on school project" without saying when, put it into the latest school.
      - Apply the same principle above to other sections.

  2. For keywords with rating = 0:
     - Do not add to skills
     - Incorporate into cover letter positively, emphasizing:
       - Eagerness to learn
       - Transferable skills, for example, missing Azure or Google cloud, but user has AWS in profile.
       - Related experience that could help quick learning

  3. Overall Enhancement:
     - Maintain truthfulness of the original profile
     - Improve professional language
     - Highlight relevant experiences
     - Strengthen alignment with job description

  4. For skills that is generallized such as Debugging, Diagnostic Skills, Give and Receive Feedback etc.
     Just generate a short sentence in the summmary, and mentioned them in the cover letter..

  Return the enhanced profile in this exact JSON structure: ${JSON.stringify(
    Object.fromEntries(
      Object.entries(DEFAULT_PROFILE_STRUCTURE)
        .filter(([key]) => !APPLICATION_ONLY_SECTIONS.includes(key))
    ),
    null,
    2
  )}
  `,
};