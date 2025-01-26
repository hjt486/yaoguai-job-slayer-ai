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
  // Cover Letter Section
  coverLetter: ""
}

export const LABELS = {
  sections: {
    metadata: "Profile Data",
    personal: "Personal Information",
    education: "Education",
    experience: "Professional Experience",
    skills: "Skills & Technologies",
    achievements: "Achievements & Awards",
    projects: "Projects",
    coverLetter: "Cover Letter"
  },
  actions: {
    edit: "Edit",
    save: "Save",
    cancel: "Cancel"
  },
  fields: {
    // Metadata fields
    profileName: "Profile Name",
    resumeName: "Resume File",
    targetRole: "Target Role",
    targetCompany: "Target Company",
    jobId: "Job ID",
    jobDescription: "Job Description",
    createdAt: "Created At",
    lastModified: "Last Modified",

    // Personal fields
    fullName: "Full Name",
    email: "Email Address",
    phone: "Phone Number",
    location: "Location",
    website: "Website",
    linkedin: "LinkedIn Profile",
    summary: "Professional Summary",

    // Education fields
    degree: "Degree",
    school: "School/University",
    field: "Field of Study",
    startDate: "Start Date",
    endDate: "End Date",
    achievements: "Achievements",

    // Experience fields
    jobTitle: "Job Title",
    company: "Company",
    responsibilities: "Responsibilities",

    // Achievement fields
    name: "Achievement Name",
    awardedDate: "Date Awarded",
    description: "Description",
    issuer: "Issuing Organization",

    // Projects fields
    name: "Project Name",
    startDate: "Start Date",
    endDate: "End Date",
    description: "Description",
  }
}

export const ARRAY_SECTIONS = [
  'education',
  'experience',
  'achievements',
  'projects'
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
  and return the data strictly following this JSON structure: ${JSON.stringify(DEFAULT_PROFILE_STRUCTURE, null, 2)}

  Note: For fields with long paragraph, please detect the point and separate each point with two newlines. 
  
  Please also generate and fill cover letter based on the resume, make sure that: 
  Please write a cover letter based on my resume and the job description provided. 
  The writing style should balance between formal academic writing and conversational expression. 
  Ensure that every sentence has a clear subject. Avoid using long or complex sentences. 
  Use short sentences as much as possible.
  Break paragraphs with two newlines.

  Lastly, Ensure all dates are in ISO format and all fields match exactly as specified.
  `,
  JOB_MATCH: `Analyze this job description and compare it with the provided profile.
  Extract key technical skills, requirements, and qualifications from the job description.
  Compare them with the candidate's profile and identify missing or mismatched skills.
  
  Return ONLY the following JSON structure without any markdown or code blocks:
  {
    "missingKeywords": [
        "keyword1",
        "keyword2",
    ]
  }

  Important: 
  - Do not include markdown code blocks (\`\`\`)
  - Return only the JSON object
  - The response must be valid JSON
  - Include both technical skills and soft skills
  - Consider partial matches in the profile
  - Keywords should be strings in an array
  - Provide specific context for each keyword`,
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

  Return the enhanced profile in this exact JSON structure: ${JSON.stringify(DEFAULT_PROFILE_STRUCTURE, null, 2)}
  `,
};