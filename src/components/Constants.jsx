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
    location: "",
    website: "",
    linkedin: "",
    summary: ""
  },
  education: [
    {
      degree: "",
      school: "",
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
    }
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
    coverLetter: "Cover Letter"
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
    issuer: "Issuing Organization"
  }
}

export const TEXTAREA_FIELDS = [
  'summary',
  'responsibilities',
  'achievements',
  'description',
  'coverLetter',
  'projectDescription',
  'accomplishments'
];

export const DATE_TIME_FIELDS = [
  'createdAt',
  'lastModified'
];

export const DATE_FIELDS = [
  'startDate',
  'endDate'
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
  `
};