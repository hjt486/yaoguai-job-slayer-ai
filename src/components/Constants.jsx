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