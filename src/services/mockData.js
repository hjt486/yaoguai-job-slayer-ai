export const MOCK_API_RESPONSES = {
  // For Profiles.jsx handleParse
  parseResume: {
    id: "chatcmpl-ParseResume123",
    object: "chat.completion",
    created: 1738100026,
    model: "gpt-4-mock",
    choices: [{
      index: 0,
      message: {
        role: "assistant",
        content: `\`\`\`json
{
  "metadata": {
    "profileName": "Software Engineer Profile",
    "targetRole": "Full Stack Developer",
    "targetCompany": "Tech Corp",
    "jobDescription": ""
  },
  "personal": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@email.com",
    "phone": "(555) 123-4567",
    "website": "https://fakewebsite.com",
    "linkedin": "https://linkedin.com/fake_profile",
    "location": "Houston, TX",
    "summary": "Experienced software engineer with 5+ years in full-stack development"
  },
  "education": [{
    "school": "University of Technology",
    "degree": "Bachelor of Science",
    "field": "Computer Science",
    "startDate": "2015-09",
    "endDate": "2019-05",
    "achievements": "Dean's List\\n\\nGraduated with Honors"
  }],
  "experience": [{
    "jobTitle": "Senior Software Engineer",
    "company": "Tech Solutions Inc",
    "location": "Houston, TX",
    "startDate": "2019-06",
    "endDate": "Present",
    "responsibilities": "Led development of cloud-based applications\\n\\nManaged team of 5 developers\\n\\nImplemented CI/CD pipeline"
  }],
  "skills": [
    "JavaScript",
    "React",
    "Node.js",
    "Python",
    "SQL"
  ],
  "achievements": [
    {
      "name": "Employee of the Year",
      "awardedDate": "2019-06",
      "description": "Top preformer of the year",
      "issuer": "Tech Solutions Inc"
    }
  ],
  "projects": [{
    "name": "E-commerce Platform",
    "startDate": "2021-01",
    "endDate": "2021-06",
    "description": "Built scalable e-commerce platform\\n\\nImplemented payment processing\\n\\nOptimized performance"
  }],
  "certifications": [
    {
      "name": "AWS Certificate",
      "awardedDate": "2019-05",
      "issuer": "Amazon Cloud Service"
    }
  ],
  "coverLetter": "Dear Hiring Manager,\\n\\nI am writing to express my strong interest in the Full Stack Developer position at Tech Corp. With over 5 years of experience in software development and a proven track record of delivering robust applications, I am confident in my ability to contribute to your team.\\n\\nMy experience at Tech Solutions Inc. has given me extensive hands-on experience with modern web technologies and cloud infrastructure. I have successfully led multiple projects from conception to deployment, consistently meeting deadlines and exceeding client expectations.\\n\\nI am particularly excited about the opportunity to work with Tech Corp's innovative products and contribute to your mission of transforming digital experiences. My background in both front-end and back-end development, combined with my team leadership experience, aligns perfectly with your requirements.\\n\\nThank you for considering my application. I look forward to discussing how my skills and experience can benefit Tech Corp.\\n\\nBest regards,\\nJohn Doe",
  "self_identification": {
    "gender": "Male",
    "pronouns": "he/him",
    "veteran": "No",
    "disability": "No",
    "ethnicity": "Asian"
  },

  "legal_authorization": {
    "us_work_authorization": "Yes",
    "legally_allowed_to_work_in_us": "Yes",
    "requires_us_visa": "Yes",
    "requires_us_sponsorship": "Yes",

    "eu_work_authorization": "",
    "requires_eu_visa": "",
    "legally_allowed_to_work_in_eu": "",
    "requires_eu_sponsorship": "",

    "canada_work_authorization": "",
    "legally_allowed_to_work_in_canada": "",
    "requires_canada_visa": "",
    "requires_canada_sponsorship": "",

    "uk_work_authorization": "",
    "legally_allowed_to_work_in_uk": "",
    "requires_uk_visa": "",
    "requires_uk_sponsorship": ""
  },
  "work_preferences": {
    "remote_work": "Yes",
    "on_site_work": "Yes",
    "open_to_relocation": "Yes",
    "willing_to_complete_assessments": "Yes",
    "willing_to_undergo_drug_tests": "Yes",
    "willing_to_undergo_background_checks": "Yes"
  },
  "salary_expectations": {
    "salary_range": ""
  },
  "languages": [
    {
      "language": "English",
      "proficiency": "Native"
    },
    {
      "language": "Spanish",
      "proficiency": "Proficient"
    }
  ],
  "application_misc": {
    "country": "United States of America",
    "address_line_1": "3833 Cummins St.",
    "city": "Houston, TX",
    "county": "Harris",
    "state": "TX",
    "postal_code": "77027",
    "phone_type": "Mobile"
  }
}
\`\`\``,
        refusal: null
      },
      logprobs: null,
      finish_reason: "stop"
    }],
    usage: {
      prompt_tokens: 1972,
      completion_tokens: 118,
      total_tokens: 2090,
      prompt_tokens_details: {
        cached_tokens: 0,
        audio_tokens: 0
      },
      completion_tokens_details: {
        reasoning_tokens: 0,
        audio_tokens: 0,
        accepted_prediction_tokens: 0,
        rejected_prediction_tokens: 0
      }
    },
    service_tier: "default",
    system_fingerprint: "fp_mock123"
  },

  // For Match.jsx handleAnalyze
  analyzeJobMatch: {
    "id": "chatcmpl-AunVKW6d8qMHn5K2rg3N7TNXZPrS8",
    object: "chat.completion",
    created: 1738100026,
    model: "gpt-4-mock",
    "choices": [
      {
        "index": 0,
        "message": {
          "role": "assistant",
          "content": "```json\n{\n  \"missingKeywords\": [\n    \"TypeScript\",\n    \"SyteLine\",\n    \"Angular\",\n    \"Spring Boot\",\n    \"MySQL\",\n    \"HTML\",\n    \"CSS\",\n    \"PowerShell\",\n    \"C#\",\n    \"ASP.NET\",\n    \"Salesforce\",\n    \"relational database management\",\n    \"time management\",\n    \"strong organizational skills\",\n    \"strong collaboration skills\",\n    \"availability to work shifts\",\n    \"self-motivated\",\n    \"detail-oriented\",\n    \"creative problem-solver\"\n  ]\n}\n```",
          "refusal": null
        },
        "logprobs": null,
        "finish_reason": "stop"
      }
    ],
    "usage": {
      "prompt_tokens": 1972,
      "completion_tokens": 118,
      "total_tokens": 2090,
      "prompt_tokens_details": {
        "cached_tokens": 0,
        "audio_tokens": 0
      },
      "completion_tokens_details": {
        "reasoning_tokens": 0,
        "audio_tokens": 0,
        "accepted_prediction_tokens": 0,
        "rejected_prediction_tokens": 0
      }
    },
    "service_tier": "default",
    "system_fingerprint": "fp_72ed7ab54c"
  },

  // For Match.jsx handleGenerateProfile
  generateEnhancedProfile: {
    id: "chatcmpl-EnhanceProfile123",
    object: "chat.completion",
    created: 1738100026,
    model: "gpt-4-mock",
    choices: [{
      index: 0,
      message: {
        role: "assistant",
        content: `\`\`\`json
{
  "metadata": {
    "profileName": "Software Engineer Profile",
    "targetRole": "Full Stack Developer",
    "targetCompany": "Tech Corp",
    "jobDescription": "Looking for experienced full-stack developer..."
  },
  "personal": {
    "fullName": "John Doe",
    "email": "john.doe@email.com",
    "phone": "(123) 456-7890",
    "location": "San Francisco, CA",
    "summary": "Experienced software engineer with strong background in cloud technologies and containerization..."
  },
  "education": [{
    "school": "University of Technology",
    "degree": "Bachelor of Science",
    "field": "Computer Science",
    "startDate": "2015-09",
    "endDate": "2019-05",
    "achievements": "Specialized in Cloud Computing\\n\\nCompleted Docker certification"
  }],
  "experience": [{
    "jobTitle": "Senior Software Engineer",
    "company": "Tech Solutions Inc",
    "location": "San Francisco, CA",
    "startDate": "2019-06",
    "endDate": "Present",
    "responsibilities": "Led containerization initiatives using Docker\\n\\nImplemented Kubernetes clusters\\n\\nManaged AWS infrastructure"
  }],
  "skills": [
    "JavaScript",
    "React",
    "Node.js",
    "Python",
    "SQL",
    "Docker",
    "Kubernetes",
    "AWS",
    "GraphQL"
  ],
  "projects": [{
    "name": "Cloud Migration Project",
    "startDate": "2021-01",
    "endDate": "2021-06",
    "description": "Led migration to cloud infrastructure\\n\\nImplemented containerization strategy\\n\\nOptimized deployment pipeline"
  }],
  "coverLetter": "Dear Hiring Manager,\\n\\nI am writing to express my strong interest in the Full Stack Developer position at Tech Corp. As a senior software engineer with expertise in cloud technologies and containerization, I am excited about the opportunity to contribute to your innovative team.\\n\\nMy experience with Docker, Kubernetes, and AWS has given me a deep understanding of modern cloud infrastructure and microservices architecture. At Tech Solutions Inc., I successfully led containerization initiatives and implemented Kubernetes clusters that improved deployment efficiency by 40%.\\n\\nWhile I am new to GraphQL, I have extensive experience with RESTful APIs and am eager to expand my expertise in this area. My strong foundation in API design principles and quick learning ability will enable me to quickly become proficient with GraphQL.\\n\\nI am particularly drawn to Tech Corp's commitment to technological innovation and look forward to discussing how my skills in cloud technologies and containerization can contribute to your team's success.\\n\\nThank you for considering my application.\\n\\nBest regards,\\nJohn Doe"
}
\`\`\``,
        refusal: null
      },
      logprobs: null,
      finish_reason: "stop"
    }],
    usage: {
      prompt_tokens: 1972,
      completion_tokens: 118,
      total_tokens: 2090,
      prompt_tokens_details: {
        cached_tokens: 0,
        audio_tokens: 0
      },
      completion_tokens_details: {
        reasoning_tokens: 0,
        audio_tokens: 0,
        accepted_prediction_tokens: 0,
        rejected_prediction_tokens: 0
      }
    },
    service_tier: "default",
    system_fingerprint: "fp_mock123"
  },
}
